const cron = require('node-cron');
const db = require('../db');
const testRunner = require('./testRunner');

// In-memory registry of active scheduled cron jobs: suiteId -> cronTask
const activeJobs = new Map();

/**
 * Validates a cron expression string
 */
function isValidCron(expression) {
  if (!expression || typeof expression !== 'string') return false;
  return cron.validate(expression.trim());
}

/**
 * Schedules or reschedules an in-memory cron job for a given suite
 */
function scheduleSuiteJob(suite) {
  if (!suite || !suite.id) return;

  // Stop any existing task for this suite
  if (activeJobs.has(suite.id)) {
    try {
      activeJobs.get(suite.id).stop();
      activeJobs.delete(suite.id);
      console.log(`[Scheduler] Stopped existing cron task for suite: ${suite.id}`);
    } catch (e) {
      console.warn(`[Scheduler] Error stopping previous task for suite ${suite.id}:`, e.message);
    }
  }

  // If scheduling is disabled or expression is missing, do nothing further
  if (!suite.is_scheduled_enabled || !suite.schedule_cron) {
    return;
  }

  const cronExpr = suite.schedule_cron.trim();
  if (!cron.validate(cronExpr)) {
    console.warn(`[Scheduler] Invalid cron expression for suite '${suite.name}' (${suite.id}): "${cronExpr}"`);
    return;
  }

  try {
    const task = cron.schedule(cronExpr, async () => {
      console.log(`[Scheduler] Triggering scheduled execution for suite '${suite.name}' (${suite.id}) [Cron: ${cronExpr}]`);
      try {
        // Record last scheduled run timestamp in database
        await db.query('UPDATE test_suites SET last_scheduled_run = NOW() WHERE id = $1', [suite.id]);

        // Run the suite via testRunner
        await testRunner.runTest(suite.id, {
          triggeredBy: 'scheduled',
          workers: suite.workers_count || 1,
          retries: suite.retry_count || 0,
          environment: suite.environment_profile || 'default',
        });
      } catch (err) {
        console.error(`[Scheduler] Error during scheduled test run for suite '${suite.id}':`, err.message);
      }
    });

    activeJobs.set(suite.id, task);
    console.log(`[Scheduler] Registered cron task for suite '${suite.name}' (${suite.id}) with expression: "${cronExpr}"`);
  } catch (err) {
    console.error(`[Scheduler] Failed to register cron job for suite '${suite.id}':`, err.message);
  }
}

/**
 * Synchronizes a suite's schedule dynamically (called after create / update / toggle)
 */
function syncSuiteSchedule(suite) {
  if (!suite) return;
  scheduleSuiteJob(suite);
}

/**
 * Removes a scheduled job when a suite is deleted
 */
function removeSuiteSchedule(suiteId) {
  if (activeJobs.has(suiteId)) {
    try {
      activeJobs.get(suiteId).stop();
      activeJobs.delete(suiteId);
      console.log(`[Scheduler] Removed cron task for deleted suite: ${suiteId}`);
    } catch (e) {
      console.warn(`[Scheduler] Error removing task for ${suiteId}:`, e.message);
    }
  }
}

/**
 * Initializes the scheduler on server startup by loading all enabled suites from DB
 */
async function initScheduler() {
  console.log('[Scheduler] Initializing automated test scheduler service...');
  try {
    const res = await db.query(
      `SELECT id, name, schedule_cron, is_scheduled_enabled, workers_count, retry_count, environment_profile
       FROM test_suites
       WHERE is_scheduled_enabled = true AND schedule_cron IS NOT NULL AND schedule_cron != ''`
    );

    console.log(`[Scheduler] Found ${res.rows.length} active scheduled suites in database.`);
    for (const suite of res.rows) {
      scheduleSuiteJob(suite);
    }
  } catch (err) {
    console.error('[Scheduler] Failed to initialize schedules from database:', err.message);
  }
}

/**
 * Returns diagnostic summary of all currently active cron jobs
 */
function getActiveSchedules() {
  return Array.from(activeJobs.keys()).map((suiteId) => ({
    suiteId,
    active: true,
  }));
}

module.exports = {
  initScheduler,
  scheduleSuiteJob,
  syncSuiteSchedule,
  removeSuiteSchedule,
  getActiveSchedules,
  isValidCron,
};
