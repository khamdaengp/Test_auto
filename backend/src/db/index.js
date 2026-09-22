const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Initialize PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: config.databaseUrl,
});

pool.on('error', (err) => {
  console.error('[PostgreSQL] Unexpected idle client error:', err);
});

/**
 * Initializes database tables using schema.sql
 */
async function initDb() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  try {
    const client = await pool.connect();
    try {
      console.log('[PostgreSQL] Checking and initializing database schema...');
      await client.query(schemaSql);

      // Safe column migrations for test_suites
      await client.query(`
        ALTER TABLE test_suites ADD COLUMN IF NOT EXISTS schedule_cron VARCHAR(100);
        ALTER TABLE test_suites ADD COLUMN IF NOT EXISTS is_scheduled_enabled BOOLEAN DEFAULT false;
        ALTER TABLE test_suites ADD COLUMN IF NOT EXISTS last_scheduled_run TIMESTAMPTZ;
        ALTER TABLE test_suites ADD COLUMN IF NOT EXISTS environment_profile VARCHAR(50) DEFAULT 'default';
        ALTER TABLE test_suites ADD COLUMN IF NOT EXISTS workers_count INTEGER DEFAULT 1;
        ALTER TABLE test_suites ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;
        ALTER TABLE test_suites ADD COLUMN IF NOT EXISTS test_dataset JSONB;
      `);

      // Safe column migrations for test_runs
      await client.query(`
        ALTER TABLE test_runs ADD COLUMN IF NOT EXISTS project_id VARCHAR(64);
        ALTER TABLE test_runs ADD COLUMN IF NOT EXISTS environment VARCHAR(50) DEFAULT 'default';
        ALTER TABLE test_runs ADD COLUMN IF NOT EXISTS workers INTEGER DEFAULT 1;
        ALTER TABLE test_runs ADD COLUMN IF NOT EXISTS retries INTEGER DEFAULT 0;
        ALTER TABLE test_runs ADD COLUMN IF NOT EXISTS is_flaky BOOLEAN DEFAULT false;
      `);

      // Safe column migrations for test_results (API testing response capture)
      await client.query(`
        ALTER TABLE test_results ADD COLUMN IF NOT EXISTS response_status INTEGER;
        ALTER TABLE test_results ADD COLUMN IF NOT EXISTS response_body TEXT;
        ALTER TABLE test_results ADD COLUMN IF NOT EXISTS response_headers JSONB;
        ALTER TABLE test_results ADD COLUMN IF NOT EXISTS request_payload TEXT;
      `);

      // Check if test_suites table needs seeding
      const countRes = await client.query('SELECT COUNT(*) as count FROM test_suites');
      if (parseInt(countRes.rows[0].count, 10) === 0) {
        console.log('[PostgreSQL] Seeding default test suites...');
        const defaultSuites = [
          {
            id: 'e2e-web',
            name: 'Desktop Web E2E Suite',
            type: 'e2e',
            description: 'Desktop browser tests validating UI elements, links, and navigation.',
            test_file: 'tests/e2e/web-app.spec.ts',
            project: 'chromium',
            target_url: 'https://example.com',
            tags: ['desktop', 'e2e', 'web'],
            is_system: true,
          },
          {
            id: 'mobile-web',
            name: 'Mobile Web Emulation Suite',
            type: 'mobile',
            description: 'Mobile emulation (Pixel 7 / iPhone 14) verifying responsive viewports and touch gestures.',
            test_file: 'tests/mobile/mobile-web.spec.ts',
            project: 'mobile-chrome',
            target_url: 'https://example.com',
            tags: ['mobile', 'responsive', 'emulation'],
            is_system: true,
          },
          {
            id: 'api-tests',
            name: 'REST API Integration Suite',
            type: 'api',
            description: 'API endpoint validation (GET, POST, 404, schemas) using Playwright request fixture.',
            test_file: 'tests/api/api-integration.spec.ts',
            project: 'api',
            target_url: 'https://jsonplaceholder.typicode.com',
            tags: ['api', 'rest', 'backend'],
            is_system: true,
          },
          {
            id: 'db-tests',
            name: 'PostgreSQL Database Integration Suite',
            type: 'database',
            description: 'Automated database testing validating schema tables, columns, transaction isolation, FK constraints, and query latency.',
            test_file: 'tests/database/db-integration.spec.ts',
            project: 'database',
            target_url: 'postgresql://localhost:5434/qa_dashboard',
            tags: ['database', 'postgresql', 'integration', 'sql'],
            is_system: true,
          },
          {
            id: 'failing-demo',
            name: 'Failure Capture Demonstration',
            type: 'e2e',
            description: 'Intentional failure test showing only-on-failure screenshot & video capture retention.',
            test_file: 'tests/e2e/failing-demo.spec.ts',
            project: 'chromium',
            target_url: 'https://example.com',
            tags: ['demo', 'failure-attachment', 'video-capture'],
            is_system: true,
          },
          {
            id: 'all-tests',
            name: 'All Test Suites Combined',
            type: 'full',
            description: 'Executes all Desktop, Mobile, API, and Database test suites concurrently.',
            test_file: '',
            project: '',
            target_url: '',
            tags: ['full-regression', 'e2e', 'mobile', 'api', 'database'],
            is_system: true,
          },
        ];

        for (const s of defaultSuites) {
          await client.query(
            `INSERT INTO test_suites (id, name, type, description, test_file, project, target_url, tags, is_system)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (id) DO NOTHING`,
            [s.id, s.name, s.type, s.description, s.test_file, s.project, s.target_url, s.tags, s.is_system]
          );
        }
        console.log('[PostgreSQL] Default test suites seeded.');
      }

      // Ensure db-tests is also present if database was already initialized
      await client.query(`
        INSERT INTO test_suites (id, name, type, description, test_file, project, target_url, tags, is_system)
        VALUES ('db-tests', 'PostgreSQL Database Integration Suite', 'database', 
                'Automated database testing validating schema tables, columns, transaction isolation, FK constraints, and query latency.',
                'tests/database/db-integration.spec.ts', 'database', 'postgresql://localhost:5434/qa_dashboard',
                ARRAY['database', 'postgresql', 'integration', 'sql'], true)
        ON CONFLICT (id) DO NOTHING
      `);

      console.log('[PostgreSQL] Database tables initialized successfully.');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[PostgreSQL] Failed to initialize database tables:', err.message);
    throw err;
  }
}

/**
 * Helper to execute SQL queries
 */
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  // console.log('[DB Query]', { text: text.slice(0, 50), duration: `${duration}ms`, rows: res.rowCount });
  return res;
}

module.exports = {
  pool,
  query,
  initDb,
};
