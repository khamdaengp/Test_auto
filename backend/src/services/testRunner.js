const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const config = require('../config');
const { parsePlaywrightReport } = require('./testParser');
const scheduler = require('./scheduler');

// In-memory registry of running test processes
const activeProcesses = new Map();

// Ensure tests/custom directory exists for user-created suites
const customTestsDir = path.join(config.playwrightRoot, 'tests', 'custom');
if (!fs.existsSync(customTestsDir)) {
  fs.mkdirSync(customTestsDir, { recursive: true });
}

/**
 * Retrieves all test suites from PostgreSQL database
 */
async function getSuites() {
  const res = await db.query(
    'SELECT * FROM test_suites ORDER BY is_system DESC, created_at ASC'
  );
  return res.rows.map((r) => ({
    id: r.id,
    projectId: r.project_id,
    name: r.name,
    type: r.type,
    description: r.description,
    testFile: r.test_file,
    project: r.project,
    targetUrl: r.target_url,
    tags: r.tags || [],
    isSystem: r.is_system,
    scheduleCron: r.schedule_cron,
    isScheduledEnabled: r.is_scheduled_enabled,
    lastScheduledRun: r.last_scheduled_run,
    environmentProfile: r.environment_profile || 'default',
    workersCount: r.workers_count || 1,
    retryCount: r.retry_count || 0,
    testDataset: r.test_dataset,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

/**
 * Retrieves a single test suite by ID, including its test code
 */
async function getSuiteById(id) {
  if (id === 'all-active') {
    const activeRes = await db.query(
      "SELECT test_file FROM test_suites WHERE is_system = false AND test_file IS NOT NULL AND test_file != ''"
    );
    const activeFiles = activeRes.rows.map((r) => r.test_file).filter(Boolean);
    const targetFile = activeFiles.length > 0 ? 'tests/custom' : '';

    return {
      id: 'all-active',
      projectId: null,
      name: 'All Active Test Suites',
      type: 'full',
      description: `Executes all active custom test suites (${activeFiles.length} suites registered).`,
      testFile: targetFile,
      project: '',
      targetUrl: '',
      code: '',
      tags: ['active', 'custom'],
      isSystem: false,
      scheduleCron: null,
      isScheduledEnabled: false,
      environmentProfile: 'default',
      workersCount: 1,
      retryCount: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  const res = await db.query('SELECT * FROM test_suites WHERE id = $1', [id]);
  if (res.rows.length === 0) return null;
  const r = res.rows[0];

  let codeContent = r.code || '';
  if (!codeContent && r.test_file) {
    const fullPath = path.isAbsolute(r.test_file)
      ? r.test_file
      : path.join(config.playwrightRoot, r.test_file);
    if (fs.existsSync(fullPath)) {
      try {
        codeContent = fs.readFileSync(fullPath, 'utf8');
      } catch (e) {
        // ignore
      }
    }
  }

  return {
    id: r.id,
    projectId: r.project_id,
    name: r.name,
    type: r.type,
    description: r.description,
    testFile: r.test_file,
    project: r.project,
    targetUrl: r.target_url,
    code: codeContent,
    tags: r.tags || [],
    isSystem: r.is_system,
    scheduleCron: r.schedule_cron,
    isScheduledEnabled: r.is_scheduled_enabled,
    lastScheduledRun: r.last_scheduled_run,
    environmentProfile: r.environment_profile || 'default',
    workersCount: r.workers_count || 1,
    retryCount: r.retry_count !== undefined && r.retry_count !== null ? r.retry_count : 1,
    testDataset: r.test_dataset,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/**
 * Creates a new custom test suite, writes its Playwright spec file, and saves to DB
 */
async function createSuite(data) {
  const {
    name,
    projectId = null,
    type = 'e2e',
    description = '',
    project = 'chromium',
    targetUrl = '',
    code = '',
    tags = [],
    scheduleCron = null,
    isScheduledEnabled = false,
    environmentProfile = 'default',
    workersCount = 1,
    retryCount = 1,
    testDataset = null,
  } = data;
  if (!name) throw new Error('Suite name is required');

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const id = `custom-${type}-${slug}-${Date.now().toString(36)}`;
  const relativeFilePath = `tests/custom/${id}.spec.ts`;
  const absoluteFilePath = path.join(config.playwrightRoot, relativeFilePath);

  // Write spec file
  fs.writeFileSync(absoluteFilePath, code, 'utf8');

  // Validate and sanitize target project ID
  let verifiedProjectId = null;
  if (projectId && projectId !== 'all') {
    const pCheck = await db.query('SELECT id FROM projects WHERE id = $1', [projectId]);
    if (pCheck.rows.length > 0) {
      verifiedProjectId = pCheck.rows[0].id;
    }
  }

  // Insert into PostgreSQL
  const res = await db.query(
    `INSERT INTO test_suites (
       id, project_id, name, type, description, test_file, project, target_url, code, tags,
       schedule_cron, is_scheduled_enabled, environment_profile, workers_count, retry_count, test_dataset, is_system
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, false)
     RETURNING *`,
    [
      id,
      verifiedProjectId,
      name,
      type,
      description,
      relativeFilePath,
      project,
      targetUrl,
      code,
      tags,
      scheduleCron,
      isScheduledEnabled,
      environmentProfile,
      workersCount,
      retryCount,
      testDataset ? JSON.stringify(testDataset) : null,
    ]
  );

  const newSuite = res.rows[0];
  // Sync in-memory cron scheduler
  scheduler.syncSuiteSchedule(newSuite);

  return {
    ...newSuite,
    projectId: newSuite.project_id,
  };
}

/**
 * Updates an existing test suite and its test spec file
 */
async function updateSuite(id, data) {
  const existing = await getSuiteById(id);
  if (!existing) throw new Error('Suite not found');

  const name = data.name || existing.name;
  const type = data.type || existing.type;
  const description = data.description !== undefined ? data.description : existing.description;
  const project = data.project || existing.project;
  const targetUrl = data.targetUrl !== undefined ? data.targetUrl : existing.targetUrl;
  const code = data.code !== undefined ? data.code : existing.code;
  const tags = data.tags || existing.tags;
  
  let verifiedProjectId = existing.projectId;
  if (data.projectId !== undefined) {
    if (data.projectId && data.projectId !== 'all') {
      const pCheck = await db.query('SELECT id FROM projects WHERE id = $1', [data.projectId]);
      verifiedProjectId = pCheck.rows.length > 0 ? pCheck.rows[0].id : null;
    } else {
      verifiedProjectId = null;
    }
  }

  const scheduleCron = data.scheduleCron !== undefined ? data.scheduleCron : existing.scheduleCron;
  const isScheduledEnabled = data.isScheduledEnabled !== undefined ? data.isScheduledEnabled : existing.isScheduledEnabled;
  const environmentProfile = data.environmentProfile !== undefined ? data.environmentProfile : existing.environmentProfile;
  const workersCount = data.workersCount !== undefined ? data.workersCount : existing.workersCount;
  const retryCount = data.retryCount !== undefined ? data.retryCount : existing.retryCount;
  const testDataset = data.testDataset !== undefined ? data.testDataset : existing.testDataset;

  // Update file if code provided and not system suite with empty testFile
  if (data.code !== undefined && existing.testFile) {
    const fullPath = path.isAbsolute(existing.testFile)
      ? existing.testFile
      : path.join(config.playwrightRoot, existing.testFile);
    fs.writeFileSync(fullPath, data.code, 'utf8');
  }

  const res = await db.query(
    `UPDATE test_suites
     SET name = $1, type = $2, description = $3, project = $4, target_url = $5, code = $6, tags = $7, project_id = $8,
         schedule_cron = $9, is_scheduled_enabled = $10, environment_profile = $11, workers_count = $12, retry_count = $13,
         test_dataset = $14, updated_at = NOW()
     WHERE id = $15
     RETURNING *`,
    [
      name,
      type,
      description,
      project,
      targetUrl,
      code,
      tags,
      verifiedProjectId,
      scheduleCron,
      isScheduledEnabled,
      environmentProfile,
      workersCount,
      retryCount,
      testDataset ? (typeof testDataset === 'string' ? testDataset : JSON.stringify(testDataset)) : null,
      id,
    ]
  );

  const updatedSuite = res.rows[0];
  // Sync in-memory cron scheduler
  scheduler.syncSuiteSchedule(updatedSuite);

  return {
    ...updatedSuite,
    projectId: updatedSuite.project_id,
  };
}

/**
 * Deletes a custom test suite and removes its spec file
 */
async function deleteSuite(id) {
  const existing = await getSuiteById(id);
  if (!existing) throw new Error('Suite not found');
  if (existing.isSystem) throw new Error('System default suites cannot be deleted');

  // Stop cron schedule if active
  scheduler.removeSuiteSchedule(id);

  // Delete file if in tests/custom
  if (existing.testFile && existing.testFile.includes('tests/custom')) {
    const fullPath = path.join(config.playwrightRoot, existing.testFile);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (e) {
        // ignore
      }
    }
  }

  await db.query('DELETE FROM test_suites WHERE id = $1', [id]);
  return { success: true, id };
}

/**
 * Executes a test suite via Playwright CLI, streams real-time logs via Socket.io,
 * and records test runs, results, and logs in the PostgreSQL database.
 */
async function runTest(suiteId, options = {}, io = null) {
  const suite = await getSuiteById(suiteId);
  if (!suite) {
    throw new Error(`Test suite not found: ${suiteId}`);
  }

  const runId = uuidv4();
  const startTime = new Date();
  const reportPath = path.join(config.playwrightRoot, 'test-results', `report-${runId}.json`);

  const workers = options.workers ? Number(options.workers) : (suite.workersCount || 1);
  const retries = options.retries !== undefined ? Number(options.retries) : (suite.retryCount !== undefined && suite.retryCount !== null ? suite.retryCount : 1);
  const environment = options.environment || suite.environmentProfile || 'default';
  const triggeredBy = options.triggeredBy || 'manual';

  // Ensure test-results directory exists
  const resultsDir = path.dirname(reportPath);
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  // Insert initial test run record
  await db.query(
    `INSERT INTO test_runs (id, project_id, suite_id, suite_name, type, status, start_time, triggered_by, environment, workers, retries)
     VALUES ($1, $2, $3, $4, $5, 'running', $6, $7, $8, $9, $10)`,
    [runId, suite.projectId || null, suite.id, suite.name, suite.type, startTime, triggeredBy, environment, workers, retries]
  );

  // Broadcast test started
  if (io) {
    io.emit('test:started', {
      runId,
      suiteId: suite.id,
      suiteName: suite.name,
      startTime: startTime.toISOString(),
      environment,
      workers,
      retries,
      triggeredBy,
    });
    io.emit('test:progress', { runId, percent: 10, status: 'initializing', text: 'Initializing test runner...' });
  }

  // Construct Playwright CLI arguments
  const args = ['playwright', 'test'];

  if (options.testFiles && Array.isArray(options.testFiles) && options.testFiles.length > 0) {
    args.push(...options.testFiles);
  } else if (suite.testFile) {
    args.push(suite.testFile);
  }

  if (suite.project) {
    args.push(`--project=${suite.project}`);
  }

  if (workers > 1) {
    args.push(`--workers=${workers}`);
  }

  if (retries > 0) {
    args.push(`--retries=${retries}`);
  }

  // Standard Playwright reporters: list for stdout streaming, json for structured parsing
  args.push('--reporter=list,json');

  const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const logBuffer = [];

  const addLog = async (stream, message) => {
    const timestamp = new Date();
    logBuffer.push({ stream, message, timestamp });

    if (io) {
      io.emit('test:log', {
        runId,
        stream,
        message,
        timestamp: timestamp.toISOString(),
      });
    }

    try {
      await db.query(
        `INSERT INTO test_logs (run_id, stream, message, timestamp) VALUES ($1, $2, $3, $4)`,
        [runId, stream, message, timestamp]
      );
    } catch (err) {
      // Fallback for transient log insert errors
    }
  };

  const videoOption = options.video || 'retain-on-failure';
  const screenshotOption = options.screenshot || 'only-on-failure';

  await addLog('system', `[Runner] Executing command: ${cmd} ${args.join(' ')} (Workers: ${workers}, Retries: ${retries}, Env: ${environment}, Video: ${videoOption}, Screenshot: ${screenshotOption})`);
  if (io) io.emit('test:progress', { runId, percent: 30, status: 'running', text: `Executing tests with ${workers} worker(s)...` });

  const child = spawn(cmd, args, {
    cwd: config.playwrightRoot,
    env: {
      ...process.env,
      FORCE_COLOR: '0',
      PLAYWRIGHT_JSON_OUTPUT_NAME: reportPath,
      TEST_ENV: environment,
      PLAYWRIGHT_VIDEO: videoOption,
      PLAYWRIGHT_SCREENSHOT: screenshotOption,
      npm_config_loglevel: 'error',
      npm_config_notice: 'false',
      ...(options.baseUrlOverride ? { PLAYWRIGHT_TEST_BASE_URL: options.baseUrlOverride } : {}),
      ...(options.dataset ? { PLAYWRIGHT_TEST_DATASET: JSON.stringify(options.dataset) } : {}),
    },
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  activeProcesses.set(runId, child);

  child.stdout.on('data', async (chunk) => {
    const text = chunk.toString();
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0 && !l.startsWith('npm notice'));
    for (const line of lines) {
      await addLog('stdout', line);
    }
  });

  child.stderr.on('data', async (chunk) => {
    const text = chunk.toString();
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0 && !l.startsWith('npm notice'));
    for (const line of lines) {
      await addLog('stderr', line);
    }
  });

  return new Promise((resolve) => {
    let resolved = false;

    // Safety timeout: 120 seconds maximum per run to prevent hanging indefinitely
    const executionTimeout = setTimeout(async () => {
      if (!resolved && activeProcesses.has(runId)) {
        await addLog('system', '[Runner] Execution timeout exceeded 120 seconds. Aborting run...');
        stopRun(runId);
      }
    }, 120_000);

    child.on('close', async (code) => {
      clearTimeout(executionTimeout);
      if (resolved) return;
      resolved = true;
      activeProcesses.delete(runId);
      const endTime = new Date();
      const durationMs = endTime.getTime() - startTime.getTime();

      if (io) io.emit('test:progress', { runId, percent: 90, status: 'parsing', text: 'Parsing test results and failure media...' });

      // Parse JSON report
      const testCases = parsePlaywrightReport(reportPath);

      let totalTests = testCases.length;
      let passedTests = testCases.filter((t) => t.status === 'passed').length;
      let failedTests = testCases.filter((t) => t.status === 'failed').length;
      let skippedTests = testCases.filter((t) => t.status === 'skipped').length;

      // Determine overall status
      let overallStatus = 'passed';
      if (code !== 0 || failedTests > 0) {
        overallStatus = 'failed';
      }

      // If test runner didn't produce test cases (e.g. compile error or crash)
      if (totalTests === 0) {
        totalTests = 1;
        if (code === 0) {
          passedTests = 1;
        } else {
          failedTests = 1;
          overallStatus = 'failed';
        }
      }

      const hasFlaky = testCases.some((t) => t.is_flaky);

      await addLog('system', `[Runner] Test run finished with exit code ${code}. Status: ${overallStatus.toUpperCase()}${hasFlaky ? ' (Passed on Retry / Flaky)' : ''}`);

      // Update test_runs table
      await db.query(
        `UPDATE test_runs 
         SET status = $1, end_time = $2, duration_ms = $3, total_tests = $4, passed_tests = $5, failed_tests = $6, skipped_tests = $7, is_flaky = $8
         WHERE id = $9`,
        [overallStatus, endTime, durationMs, totalTests, passedTests, failedTests, skippedTests, hasFlaky, runId]
      );

      // Persist run artifacts into permanent runsStorageDir to prevent Playwright overwriting them
      const runArtifactsDir = path.join(config.runsStorageDir, runId);
      if (!fs.existsSync(runArtifactsDir)) {
        fs.mkdirSync(runArtifactsDir, { recursive: true });
      }

      for (const t of testCases) {
        if (t.before_screenshot_url && t.before_screenshot_url.startsWith('/artifacts/')) {
          const relPath = t.before_screenshot_url.replace('/artifacts/', '');
          const srcPath = path.join(config.artifactsDir, relPath);
          if (fs.existsSync(srcPath)) {
            const destName = `before_${path.basename(srcPath)}`;
            const destPath = path.join(runArtifactsDir, destName);
            try {
              fs.copyFileSync(srcPath, destPath);
              t.before_screenshot_url = `/artifacts/runs/${runId}/${destName}`;
            } catch (e) {
              // ignore
            }
          }
        }

        if (t.screenshot_url && t.screenshot_url.startsWith('/artifacts/')) {
          const relPath = t.screenshot_url.replace('/artifacts/', '');
          const srcPath = path.join(config.artifactsDir, relPath);
          if (fs.existsSync(srcPath)) {
            const destName = `after_${path.basename(srcPath)}`;
            const destPath = path.join(runArtifactsDir, destName);
            try {
              fs.copyFileSync(srcPath, destPath);
              t.screenshot_url = `/artifacts/runs/${runId}/${destName}`;
            } catch (e) {
              // ignore
            }
          }
        }

        if (t.video_url && t.video_url.startsWith('/artifacts/')) {
          const relPath = t.video_url.replace('/artifacts/', '');
          const srcPath = path.join(config.artifactsDir, relPath);
          if (fs.existsSync(srcPath)) {
            const destName = `video_${path.basename(srcPath)}`;
            const destPath = path.join(runArtifactsDir, destName);
            try {
              fs.copyFileSync(srcPath, destPath);
              t.video_url = `/artifacts/runs/${runId}/${destName}`;
            } catch (e) {
              // ignore
            }
          }
        }
      }

      // Insert individual test results
      for (const t of testCases) {
        const resultId = uuidv4();
        await db.query(
          `INSERT INTO test_results 
           (id, run_id, title, project, file, status, duration_ms, error_message, error_stack, screenshot_url, video_url, before_screenshot_url, response_status, response_body, response_headers, request_payload)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          [
            resultId,
            runId,
            t.title,
            t.project,
            t.file,
            t.status,
            t.duration_ms,
            t.error_message,
            t.error_stack,
            t.screenshot_url,
            t.video_url,
            t.before_screenshot_url,
            t.response_status || null,
            t.response_body || null,
            t.response_headers ? JSON.stringify(t.response_headers) : null,
            t.request_payload || null,
          ]
        );
      }

      // Broadcast completion
      if (io) {
        io.emit('test:progress', { runId, percent: 100, status: overallStatus, text: 'Execution complete' });
        io.emit('test:completed', {
          runId,
          status: overallStatus,
          durationMs,
          totalTests,
          passedTests,
          failedTests,
          skippedTests,
        });
      }

      // Clean up temp report file
      try {
        if (fs.existsSync(reportPath)) {
          fs.unlinkSync(reportPath);
        }
      } catch (e) {
        // ignore
      }

      resolve({
        runId,
        status: overallStatus,
        durationMs,
        totalTests,
        passedTests,
        failedTests,
        skippedTests,
      });
    });

    child.on('error', async (err) => {
      clearTimeout(executionTimeout);
      if (resolved) return;
      resolved = true;
      activeProcesses.delete(runId);
      const endTime = new Date();
      const durationMs = endTime.getTime() - startTime.getTime();

      await addLog('stderr', `[Runner] Execution error: ${err.message}`);

      await db.query(
        `UPDATE test_runs 
         SET status = 'error', end_time = $1, duration_ms = $2, total_tests = 1, failed_tests = 1 
         WHERE id = $3`,
        [endTime, durationMs, runId]
      );

      if (io) {
        io.emit('test:progress', { runId, percent: 100, status: 'error', text: `Failed: ${err.message}` });
        io.emit('test:completed', {
          runId,
          status: 'error',
          durationMs,
          totalTests: 1,
          passedTests: 0,
          failedTests: 1,
          skippedTests: 0,
        });
      }

      resolve({
        runId,
        status: 'error',
        error: err.message,
      });
    });
  });
}

/**
 * Aborts an active test run by process ID
 */
function stopRun(runId) {
  const child = activeProcesses.get(runId);
  if (child) {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', child.pid.toString(), '/f', '/t']);
    } else {
      child.kill('SIGTERM');
    }
    activeProcesses.delete(runId);
    return true;
  }
  return false;
}

module.exports = {
  getSuites,
  getSuiteById,
  createSuite,
  updateSuite,
  deleteSuite,
  runTest,
  stopRun,
};
