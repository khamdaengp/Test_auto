const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://qa_user:qa_password@localhost:5434/qa_dashboard' });

async function check() {
  // Show all runs with their project_id
  const runs = await pool.query(
    'SELECT id, suite_id, suite_name, project_id, status, start_time FROM test_runs ORDER BY start_time DESC LIMIT 30'
  );
  console.log('=== All test_runs (last 30) ===');
  runs.rows.forEach(r => {
    console.log(`  [${r.status}] ${r.suite_name} | project_id: ${r.project_id || 'NULL'} | suite: ${r.suite_id}`);
  });

  // Count by project_id
  const counts = await pool.query(
    'SELECT project_id, COUNT(*) as total FROM test_runs GROUP BY project_id ORDER BY total DESC'
  );
  console.log('\n=== Runs count by project_id ===');
  counts.rows.forEach(r => console.log(`  project_id: ${r.project_id || 'NULL'} => ${r.total} runs`));

  // Show projects
  const projects = await pool.query('SELECT id, name FROM projects ORDER BY name');
  console.log('\n=== Projects ===');
  projects.rows.forEach(p => console.log(`  [${p.id}] ${p.name}`));

  await pool.end();
}

check().catch(e => { console.error(e.message); pool.end(); });
