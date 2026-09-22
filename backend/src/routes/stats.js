const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * GET /api/stats - Aggregated metrics and trends for the QA Dashboard
 */
router.get('/', async (req, res) => {
  try {
    const projectId = req.query.projectId;
    const filterClause = (projectId && projectId !== 'all') ? "WHERE (project_id = $1 OR project_id IS NULL OR suite_id IN ('all-active', 'all-tests'))" : '';
    const filterParams = (projectId && projectId !== 'all') ? [projectId] : [];

    // Overall counts
    const overviewRes = await db.query(`
      SELECT 
        COUNT(*) as total_runs,
        COUNT(*) FILTER (WHERE status = 'passed') as passed_runs,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_runs,
        COUNT(*) FILTER (WHERE status = 'running') as running_runs,
        COALESCE(ROUND(AVG(duration_ms) FILTER (WHERE duration_ms > 0)), 0) as avg_duration_ms,
        COALESCE(SUM(total_tests), 0) as total_tests_executed,
        COALESCE(SUM(passed_tests), 0) as total_tests_passed,
        COALESCE(SUM(failed_tests), 0) as total_tests_failed
      FROM test_runs
      ${filterClause}
    `, filterParams);

    // Trend of the last 15 test runs
    const trendWhere = (projectId && projectId !== 'all')
      ? "WHERE status IN ('passed', 'failed') AND (project_id = $1 OR project_id IS NULL OR suite_id IN ('all-active', 'all-tests'))"
      : "WHERE status IN ('passed', 'failed')";
    const trendRes = await db.query(`
      SELECT 
        id,
        suite_name,
        type,
        status,
        duration_ms,
        passed_tests,
        failed_tests,
        total_tests,
        start_time
      FROM test_runs
      ${trendWhere}
      ORDER BY start_time DESC
      LIMIT 15
    `, filterParams);

    // Suite breakdown
    const suiteWhere = (projectId && projectId !== 'all')
      ? "WHERE (project_id = $1 OR project_id IS NULL OR suite_id IN ('all-active', 'all-tests'))"
      : '';
    const suiteRes = await db.query(`
      SELECT 
        suite_id,
        suite_name,
        type,
        COUNT(*) as total_executions,
        COUNT(*) FILTER (WHERE status = 'passed') as passed_executions,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_executions
      FROM test_runs
      ${suiteWhere}
      GROUP BY suite_id, suite_name, type
      ORDER BY total_executions DESC
    `, filterParams);

    const overview = overviewRes.rows[0];
    const totalRuns = parseInt(overview.total_runs, 10) || 0;
    const passedRuns = parseInt(overview.passed_runs, 10) || 0;
    const failedRuns = parseInt(overview.failed_runs, 10) || 0;
    const passRate = totalRuns > 0 ? Math.round((passedRuns / totalRuns) * 100) : 0;

    res.json({
      summary: {
        totalRuns,
        passedRuns,
        failedRuns,
        runningRuns: parseInt(overview.running_runs, 10) || 0,
        passRate,
        avgDurationMs: parseInt(overview.avg_duration_ms, 10) || 0,
        totalTestsExecuted: parseInt(overview.total_tests_executed, 10) || 0,
        totalTestsPassed: parseInt(overview.total_tests_passed, 10) || 0,
        totalTestsFailed: parseInt(overview.total_tests_failed, 10) || 0,
      },
      trends: trendRes.rows.reverse(), // chronologically ascending for charts
      suites: suiteRes.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
