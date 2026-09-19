import { test, expect } from '@playwright/test';
import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://qa_user:qa_password@localhost:5432/qa_dashboard';

test.describe('Database Automated Testing - PostgreSQL', () => {
  let pool: Pool;

  test.beforeAll(async () => {
    pool = new Pool({
      connectionString: DATABASE_URL,
      connectionTimeoutMillis: 5000,
    });
  });

  test.afterAll(async () => {
    if (pool) {
      await pool.end();
    }
  });

  test('TC-DB-01: Verify PostgreSQL Connection & Engine Version', async () => {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT 1 AS ping, version() AS version, current_database() AS db_name');
      expect(res.rows.length).toBe(1);
      expect(res.rows[0].ping).toBe(1);
      expect(res.rows[0].db_name).toBe('qa_dashboard');
      expect(res.rows[0].version).toContain('PostgreSQL');
      console.log(`[DB Test] Connected to PostgreSQL: ${res.rows[0].db_name}`);
    } finally {
      client.release();
    }
  });

  test('TC-DB-02: Verify Required Schema Tables Exist', async () => {
    const client = await pool.connect();
    try {
      const res = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      const existingTables = res.rows.map((r: { table_name: string }) => r.table_name);
      
      const expectedTables = ['test_suites', 'test_runs', 'test_results', 'test_logs'];
      for (const table of expectedTables) {
        expect(existingTables).toContain(table);
      }
      console.log(`[DB Test] Verified schema tables: ${existingTables.join(', ')}`);
    } finally {
      client.release();
    }
  });

  test('TC-DB-03: Verify test_suites and test_runs Column Definitions', async () => {
    const client = await pool.connect();
    try {
      const resSuites = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'test_suites'
      `);
      const suiteCols = resSuites.rows.map((r: { column_name: string }) => r.column_name);
      expect(suiteCols).toContain('id');
      expect(suiteCols).toContain('name');
      expect(suiteCols).toContain('type');
      expect(suiteCols).toContain('test_file');

      const resRuns = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'test_runs'
      `);
      const runCols = resRuns.rows.map((r: { column_name: string }) => r.column_name);
      expect(runCols).toContain('id');
      expect(runCols).toContain('suite_id');
      expect(runCols).toContain('status');
      expect(runCols).toContain('duration_ms');
    } finally {
      client.release();
    }
  });

  test('TC-DB-04: Verify Transaction Isolation & Rollback Integrity', async () => {
    const client = await pool.connect();
    const testSuiteId = `db-temp-suite-${Date.now()}`;
    try {
      await client.query('BEGIN');

      // Insert record inside transaction
      await client.query(
        `INSERT INTO test_suites (id, name, type, description, test_file, project, target_url, is_system)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [testSuiteId, 'Temp Rollback Test', 'database', 'Temporary test suite for rollback validation', 'tests/database/db-integration.spec.ts', 'database', '', false]
      );

      // Verify row exists within current transaction
      const selectInside = await client.query('SELECT id, name FROM test_suites WHERE id = $1', [testSuiteId]);
      expect(selectInside.rows.length).toBe(1);
      expect(selectInside.rows[0].id).toBe(testSuiteId);

      // Rollback transaction
      await client.query('ROLLBACK');

      // Verify row is rolled back and does not pollute database
      const selectOutside = await client.query('SELECT id FROM test_suites WHERE id = $1', [testSuiteId]);
      expect(selectOutside.rows.length).toBe(0);
      console.log('[DB Test] Transaction rollback verified cleanly.');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  });

  test('TC-DB-05: Verify Foreign Key Constraints on test_results', async () => {
    const client = await pool.connect();
    try {
      let threwForeignKeyError = false;
      try {
        // Attempt to insert a result referencing non-existent run_id
        await client.query(
          `INSERT INTO test_results (id, run_id, title, project, file, status, duration_ms)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [`res-${Date.now()}`, 'non-existent-run-uuid-0000', 'FK Test', 'database', 'tests/database/db-integration.spec.ts', 'passed', 10]
        );
      } catch (err: any) {
        if (err.code === '23503') { // PostgreSQL foreign_key_violation code
          threwForeignKeyError = true;
        }
      }
      expect(threwForeignKeyError).toBe(true);
      console.log('[DB Test] Foreign key constraint verified (error 23503 caught).');
    } finally {
      client.release();
    }
  });

  test('TC-DB-06: Database Query Latency Benchmark (< 100ms)', async () => {
    const client = await pool.connect();
    try {
      const start = performance.now();
      const res = await client.query('SELECT COUNT(*) AS total_runs FROM test_runs');
      const duration = performance.now() - start;

      expect(res.rows.length).toBe(1);
      expect(duration).toBeLessThan(100); // Benchmark under 100ms
      console.log(`[DB Test] Query execution latency: ${duration.toFixed(2)}ms (benchmark passed)`);
    } finally {
      client.release();
    }
  });
});
