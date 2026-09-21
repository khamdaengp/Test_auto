const express = require('express');
const router = express.Router();
const db = require('../db');
const { deleteSuite } = require('../services/testRunner');

/**
 * GET /api/projects - List all registered software projects
 */
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT p.*,
        (SELECT COUNT(*) FROM test_suites ts WHERE ts.project_id = p.id) as suite_count,
        (SELECT COUNT(*) FROM test_runs tr
           JOIN test_suites ts ON tr.suite_id = ts.id
           WHERE ts.project_id = p.id) as run_count
      FROM projects p
      ORDER BY p.created_at ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/projects - Create a new software project
 */
router.post('/', async (req, res) => {
  try {
    const { name, baseUrl, description = '' } = req.body;
    if (!name || !baseUrl) {
      return res.status(400).json({ error: 'Project name and baseUrl are required' });
    }

    const id = `proj-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString(36)}`;
    const { rows } = await db.query(
      `INSERT INTO projects (id, name, base_url, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, name.trim(), baseUrl.trim(), description.trim()]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/projects/:id - Update an existing project
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, baseUrl, description } = req.body;
    const { rows } = await db.query(
      `UPDATE projects
       SET name = COALESCE($1, name),
           base_url = COALESCE($2, base_url),
           description = COALESCE($3, description),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [name, baseUrl, description, req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/projects/:id - Delete a project and all its associated test suites
 */
router.delete('/:id', async (req, res) => {
  try {
    const projectId = req.params.id;

    // 1. Verify project exists
    const projCheck = await db.query('SELECT * FROM projects WHERE id = $1', [projectId]);
    if (projCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const targetProject = projCheck.rows[0];

    // 2. Query all test suites belonging to this project
    const { rows: suitesToDelete } = await db.query(
      'SELECT id, name, test_file, is_system FROM test_suites WHERE project_id = $1',
      [projectId]
    );

    // 3. Delete each associated test suite (removes cron schedule, deletes spec file on disk)
    for (const suite of suitesToDelete) {
      try {
        await deleteSuite(suite.id);
      } catch (suiteErr) {
        console.warn(`[Projects] Note while deleting suite ${suite.id} for project ${projectId}:`, suiteErr.message);
      }
    }

    // 4. Delete any remaining test runs associated with this project
    await db.query('DELETE FROM test_runs WHERE project_id = $1', [projectId]);

    // 5. Delete the project record
    await db.query('DELETE FROM projects WHERE id = $1', [projectId]);

    res.json({
      message: `Project "${targetProject.name}" and ${suitesToDelete.length} associated test suite(s) deleted successfully`,
      deletedProjectId: projectId,
      deletedSuitesCount: suitesToDelete.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
