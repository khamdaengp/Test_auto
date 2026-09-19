const express = require('express');
const router = express.Router();
const db = require('../db');
const { runTest, stopRun } = require('../services/testRunner');

/**
 * GET /api/runs - Retrieve paginated test runs list
 */
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = parseInt(req.query.offset, 10) || 0;
    const status = req.query.status;
    const projectId = req.query.projectId;

    let queryText = `
      SELECT r.*,
        EXISTS(SELECT 1 FROM test_results tr WHERE tr.run_id = r.id AND tr.screenshot_url IS NOT NULL) as has_screenshot,
        EXISTS(SELECT 1 FROM test_results tr WHERE tr.run_id = r.id AND tr.video_url IS NOT NULL) as has_video
      FROM test_runs r
    `;
    const params = [];
    const whereClauses = [];

    if (status) {
      params.push(status);
      whereClauses.push(`r.status = $${params.length}`);
    }

    if (projectId && projectId !== 'all') {
      params.push(projectId);
      whereClauses.push(`r.project_id = $${params.length}`);
    }

    if (whereClauses.length > 0) {
      queryText += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    queryText += ` ORDER BY r.start_time DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const { rows } = await db.query(queryText, params);
    const countQuery = whereClauses.length > 0
      ? `SELECT COUNT(*) as total FROM test_runs r WHERE ${whereClauses.join(' AND ')}`
      : 'SELECT COUNT(*) as total FROM test_runs';
    const countRes = await db.query(countQuery, params.slice(0, whereClauses.length));

    res.json({
      runs: rows,
      total: parseInt(countRes.rows[0].total, 10),
      limit,
      offset,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/runs/:id - Get specific test run with its detailed test cases and logs
 */
router.get('/:id', async (req, res) => {
  try {
    const runId = req.params.id;

    // Get run summary
    const runRes = await db.query('SELECT * FROM test_runs WHERE id = $1', [runId]);
    if (runRes.rows.length === 0) {
      return res.status(404).json({ error: 'Test run not found' });
    }

    // Get test case results
    const resultsRes = await db.query(
      'SELECT * FROM test_results WHERE run_id = $1 ORDER BY created_at ASC',
      [runId]
    );

    // Get test logs
    const logsRes = await db.query(
      'SELECT id, stream, message, timestamp FROM test_logs WHERE run_id = $1 ORDER BY id ASC',
      [runId]
    );

    res.json({
      run: runRes.rows[0],
      results: resultsRes.rows,
      logs: logsRes.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/tests/run - Trigger execution of a test suite
 */
router.post('/run', async (req, res) => {
  try {
    const { suiteId, options } = req.body;
    if (!suiteId) {
      return res.status(400).json({ error: 'suiteId is required' });
    }

    const io = req.app.get('io');
    
    // Asynchronously kick off run
    runTest(suiteId, options || {}, io).catch((err) => {
      console.error('[Runner] Error executing test in background:', err);
    });

    res.status(202).json({
      message: 'Test execution initiated',
      suiteId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/tests/stop/:id - Stop an ongoing test run
 */
router.post('/stop/:id', (req, res) => {
  try {
    const runId = req.params.id;
    const stopped = stopRun(runId);
    if (stopped) {
      res.json({ message: 'Execution cancelled', runId });
    } else {
      res.status(404).json({ error: 'Active process not found for this runId' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/runs - Clear all historical test runs
 */
router.delete('/', async (req, res) => {
  try {
    const { rowCount } = await db.query('DELETE FROM test_runs');
    res.json({ message: 'All test run history cleared', deletedCount: rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/runs/:id - Delete a specific test run record
 */
router.delete('/:id', async (req, res) => {
  try {
    const runId = req.params.id;
    const { rowCount } = await db.query('DELETE FROM test_runs WHERE id = $1', [runId]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Test run not found' });
    }
    res.json({ message: 'Test run deleted', runId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
