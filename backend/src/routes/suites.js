const express = require('express');
const router = express.Router();
const {
  getSuites,
  getSuiteById,
  createSuite,
  updateSuite,
  deleteSuite,
} = require('../services/testRunner');

/**
 * GET /api/suites - Retrieve list of all test suites from DB
 */
router.get('/', async (req, res) => {
  try {
    const suites = await getSuites();
    res.json(suites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/suites/:id - Retrieve single test suite details including code
 */
router.get('/:id', async (req, res) => {
  try {
    const suite = await getSuiteById(req.params.id);
    if (!suite) {
      return res.status(404).json({ error: 'Suite not found' });
    }
    res.json(suite);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/suites - Create a new test suite
 */
router.post('/', async (req, res) => {
  try {
    const newSuite = await createSuite(req.body);
    res.status(201).json(newSuite);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * PUT /api/suites/:id - Update an existing test suite
 */
router.put('/:id', async (req, res) => {
  try {
    const updated = await updateSuite(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /api/suites/:id - Delete a test suite
 */
router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteSuite(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * PATCH /api/suites/:id/schedule - Toggle or update schedule for a test suite
 */
router.patch('/:id/schedule', async (req, res) => {
  try {
    const { isScheduledEnabled, scheduleCron } = req.body;
    const updated = await updateSuite(req.params.id, {
      isScheduledEnabled,
      scheduleCron,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const { exec } = require('child_process');
const config = require('../config');

/**
 * POST /api/suites/codegen - Launch Playwright CodeGen for non-code interactive recording
 */
router.post('/codegen', (req, res) => {
  try {
    const targetUrl = req.body.url || 'http://localhost:5175/login';
    const deviceArg = req.body.device ? `--device="${req.body.device}" ` : '';
    // On Windows, use `cmd.exe /c start /min ""` to start minimized in the taskbar
    // so it doesn't block the screen, while Chromium and Playwright Inspector pop up in the foreground.
    const cmd = process.platform === 'win32'
      ? `cmd.exe /c start /min "" npx playwright codegen ${deviceArg}"${targetUrl}"`
      : `npx playwright codegen ${deviceArg}"${targetUrl}" &`;

    exec(cmd, { cwd: config.playwrightRoot }, (err) => {
      if (err) {
        console.error('[CodeGen] Execution error:', err);
      }
    });

    res.json({
      success: true,
      message: `Playwright CodeGen launched successfully for ${targetUrl}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

