const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://qa_user:qa_password@localhost:5434/qa_dashboard' });

async function fix() {
  // For each run with NULL project_id, try to find the project from the suite
  const nullRuns = await pool.query(
    `SELECT r.id, r.suite_id, r.suite_name, ts.project_id as suite_project_id
     FROM test_runs r
     LEFT JOIN test_suites ts ON ts.id = r.suite_id
     WHERE r.project_id IS NULL`
  );

  console.log(`Found ${nullRuns.rows.length} runs with NULL project_id:`);
  for (const run of nullRuns.rows) {
    console.log(`  run ${run.id} | suite: ${run.suite_id} | suite_project_id: ${run.suite_project_id || 'NOT FOUND'}`);
    if (run.suite_project_id) {
      await pool.query(
        'UPDATE test_runs SET project_id = $1 WHERE id = $2',
        [run.suite_project_id, run.id]
      );
      console.log(`    -> Updated project_id = ${run.suite_project_id}`);
    }
  }

  // Show final state
  const counts = await pool.query(
    'SELECT project_id, COUNT(*) as total FROM test_runs GROUP BY project_id ORDER BY total DESC'
  );
  console.log('\n=== Runs count by project_id (after fix) ===');
  counts.rows.forEach(r => console.log(`  project_id: ${r.project_id || 'NULL'} => ${r.total} runs`));

  await pool.end();
  console.log('\nDone.');
}

fix().catch(e => { console.error(e.message); pool.end(); });
