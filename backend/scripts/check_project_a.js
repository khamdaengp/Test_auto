const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://qa_user:qa_password@localhost:5434/qa_dashboard' });

async function check() {
  // Check if project proj-a-mudze39g exists
  const proj = await pool.query("SELECT * FROM projects WHERE id = 'proj-a-mudze39g'");
  console.log('Project proj-a-mudze39g:', proj.rows.length > 0 ? JSON.stringify(proj.rows[0]) : 'NOT FOUND IN DB');

  // Runs with that project_id
  const runs = await pool.query("SELECT * FROM test_runs WHERE project_id = 'proj-a-mudze39g'");
  console.log('Runs with proj-a-mudze39g:', runs.rows.length);

  // All projects
  const all = await pool.query('SELECT id, name, base_url FROM projects ORDER BY name');
  console.log('\nAll projects:');
  all.rows.forEach(p => console.log(`  [${p.id}] ${p.name} => ${p.base_url}`));

  await pool.end();
}

check().catch(e => { console.error(e.message); pool.end(); });
