const fs = require('fs');
const { query } = require('../backend/src/db');

async function register() {
  const code = fs.readFileSync('tests/database/db-api-and-table-verification.spec.ts', 'utf8');
  const sql = `
    INSERT INTO test_suites (id, project_id, name, type, description, test_file, project, target_url, code, tags, is_system)
    VALUES (
      'bccs3-db-api-and-table-verification',
      'proj-mbccs-muaqo0id',
      'BCCS3 Database & API State Verification Suite',
      'database',
      'E2E API-to-Database consistency validation (Case 1) and direct table state checks for users, roles, OAuth tokens, and sales transactions (Case 2)',
      'tests/database/db-api-and-table-verification.spec.ts',
      'database',
      'http://10.120.44.76:8500',
      $1,
      ARRAY['database', 'api', 'mariadb', 'bccs3', 'transactions', 'oauth'],
      false
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      test_file = EXCLUDED.test_file,
      code = EXCLUDED.code,
      project_id = EXCLUDED.project_id,
      updated_at = CURRENT_TIMESTAMP
  `;
  await query(sql, [code]);
  console.log('Successfully registered bccs3-db-api-and-table-verification');
  process.exit(0);
}

register().catch(err => {
  console.error('Registration error:', err);
  process.exit(1);
});
