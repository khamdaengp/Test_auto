const fs = require('fs');
const { query } = require('../backend/src/db');

async function register() {
  const code = fs.readFileSync('tests/database/db-create-connector-sale-staff.spec.ts', 'utf8');
  const sql = `
    INSERT INTO test_suites (id, project_id, name, type, description, test_file, project, target_url, code, tags, is_system)
    VALUES (
      'bccs3-create-connector-sale-staff',
      'proj-mbccs-muaqo0id',
      'WS_createConnectorCodeWithSaleStaff API & Database Verification',
      'database',
      'Validates WS_createConnectorCodeWithSaleStaff API execution against MariaDB bccs3_catalog_la.staff, bccs3_vsa_la.users, and bccs3_network_product_la.infrastructure',
      'tests/database/db-create-connector-sale-staff.spec.ts',
      'database',
      'http://10.120.44.76:8500',
      $1,
      ARRAY['database', 'api', 'connector', 'sale_staff', 'catalog', 'mariadb'],
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
  console.log('Successfully registered bccs3-create-connector-sale-staff in test_suites');
  process.exit(0);
}

register().catch(err => {
  console.error('Registration error:', err);
  process.exit(1);
});
