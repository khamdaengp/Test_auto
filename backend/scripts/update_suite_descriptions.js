const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: 'postgresql://qa_user:qa_password@localhost:5434/qa_dashboard',
});

async function main() {
  try {
    console.log('Connecting to PostgreSQL database...');

    // 1. Fix placeholder description for login suite
    const fix1 = await pool.query(
      `UPDATE test_suites
       SET description = 'Validates that submitting invalid login credentials displays error notification and prevents unauthorized session.'
       WHERE id = 'custom-e2e-login-invalid-copy-mu4yaw2j'
         AND (description = 'LOGIN' OR description IS NULL)`
    );
    console.log('Fixed login suite descriptions, rows affected:', fix1.rowCount);

    // 2. Register db-create-connector-sale-staff.spec.ts if not already present
    const dbSuiteFile = 'tests/database/db-create-connector-sale-staff.spec.ts';
    const dbSuiteId = 'custom-database-ws-create-connector-code-with-sale-staff';
    const dbSpecFullPath = path.resolve(__dirname, '../../', dbSuiteFile);

    let dbCode = '';
    if (fs.existsSync(dbSpecFullPath)) {
      dbCode = fs.readFileSync(dbSpecFullPath, 'utf8');
      console.log('Read spec file:', dbSpecFullPath);
    } else {
      console.log('Warning: spec file not found at', dbSpecFullPath);
    }

    const checkRes = await pool.query(
      'SELECT id FROM test_suites WHERE id = $1 OR test_file = $2',
      [dbSuiteId, dbSuiteFile]
    );

    if (checkRes.rows.length === 0) {
      console.log('Registering db-create-connector-sale-staff suite in test_suites table...');
      await pool.query(
        `INSERT INTO test_suites
           (id, project_id, name, type, description, test_file, project, target_url, code, tags, is_system)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false)`,
        [
          dbSuiteId,
          'proj-mbccs3-mu6c2ai5',
          'WS_createConnectorCodeWithSaleStaff API & MariaDB Verification',
          'database',
          'Automated API and MariaDB verification for WS_createConnectorCodeWithSaleStaff ensuring sales staff, user status, and network infrastructure consistency.',
          dbSuiteFile,
          'database',
          'http://10.120.44.76:8500',
          dbCode,
          ['api', 'database', 'mariadb', 'connector', 'staff'],
        ]
      );
      console.log('Registered suite:', dbSuiteId);
    } else {
      console.log('Suite already exists, updating description...');
      await pool.query(
        `UPDATE test_suites
         SET description = 'Automated API and MariaDB verification for WS_createConnectorCodeWithSaleStaff ensuring sales staff, user status, and network infrastructure consistency.',
             name = 'WS_createConnectorCodeWithSaleStaff API & MariaDB Verification'
         WHERE id = $1 OR test_file = $2`,
        [dbSuiteId, dbSuiteFile]
      );
      console.log('Updated suite:', dbSuiteId);
    }

    // 3. Print all suites with descriptions
    const allSuites = await pool.query(
      'SELECT id, name, type, description FROM test_suites ORDER BY is_system DESC, created_at ASC'
    );
    console.log('\n--- Registered Test Suites in Database ---');
    allSuites.rows.forEach((s) => {
      const desc = s.description
        ? s.description.substring(0, 80) + (s.description.length > 80 ? '...' : '')
        : 'NONE';
      console.log(`[${s.type.toUpperCase()}] ${s.name}`);
      console.log(`   ${desc}`);
    });

    console.log('\nFinished successfully.');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
