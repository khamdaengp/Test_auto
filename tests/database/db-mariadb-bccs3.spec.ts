import { test, expect } from '@playwright/test';
import mysql from 'mysql2/promise';

const DB_HOST = process.env.MARIADB_HOST || '10.120.254.144';
const DB_PORT = parseInt(process.env.MARIADB_PORT || '3306', 10);
const DB_USER = process.env.MARIADB_USER || 'bccs3_stl';
const DB_PASSWORD = process.env.MARIADB_PASSWORD || 'bCcs3#St1';
const DB_NAME = process.env.MARIADB_DATABASE || 'bccs3_vsa_la';

test.describe('Automated Database Testing: BCCS3 MariaDB Enterprise', () => {
  let pool: mysql.Pool;

  test.beforeAll(async () => {
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      connectTimeout: 10_000,
    });
  });

  test.afterAll(async () => {
    if (pool) {
      await pool.end();
    }
  });

  test('TC-DB-01: Verify MariaDB Server Connection & Engine Version', async () => {
    const startTime = Date.now();
    const [rows]: [any[], any] = await pool.query(
      'SELECT 1 AS ping, VERSION() AS version, DATABASE() AS current_db, NOW() AS server_time'
    );
    const latency = Date.now() - startTime;

    expect(rows.length).toBe(1);
    expect(rows[0].ping).toBe(1);
    expect(rows[0].current_db).toBe(DB_NAME);
    expect(rows[0].version.toLowerCase()).toContain('mariadb');
    console.log(`[MariaDB Test] Connected to ${rows[0].current_db} (v${rows[0].version}) in ${latency}ms`);
  });

  test('TC-DB-02: Verify Core Schema Tables Existence in bccs3_vsa_la', async () => {
    const [tables]: [any[], any] = await pool.query('SHOW TABLES');
    const tableNames = tables.map((t: any) => Object.values(t)[0] as string);

    const requiredTables = ['users', 'applications', 'department', 'roles', 'event_log'];
    for (const required of requiredTables) {
      expect(tableNames).toContain(required);
    }
    console.log(`[MariaDB Test] Verified ${requiredTables.length} core tables in ${DB_NAME}: ${requiredTables.join(', ')}`);
  });

  test('TC-DB-03: Verify User Table Records & Active Accounts', async () => {
    const [users]: [any[], any] = await pool.query(
      'SELECT user_name, status FROM users WHERE status = 1 LIMIT 5'
    );

    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);

    for (const user of users) {
      expect(typeof user.user_name).toBe('string');
      expect(user.user_name.length).toBeGreaterThan(0);
      expect(user.status).toBe(1);
    }
    console.log(`[MariaDB Test] Successfully retrieved ${users.length} active users. Sample: ${users[0].user_name}`);
  });

  test('TC-DB-04: Verify Query Execution Latency Benchmark (< 1000ms)', async () => {
    const startTime = Date.now();
    const [result]: [any[], any] = await pool.query('SELECT COUNT(*) AS total_users FROM users');
    const durationMs = Date.now() - startTime;

    const totalCount = Number(result[0].total_users);
    expect(totalCount).toBeGreaterThan(0);
    expect(durationMs).toBeLessThan(1000);
    console.log(`[MariaDB Test] Total users in system: ${totalCount} (Query latency: ${durationMs}ms)`);
  });

  test('TC-DB-05: Verify Cross-Database Access to BCCS3 Schemas', async () => {
    const [databases]: [any[], any] = await pool.query('SHOW DATABASES');
    const dbList = databases.map((d: any) => d.Database as string);

    const expectedDatabases = ['bccs3_vsa_la', 'bccs3_oauth', 'bccs3_customer_la', 'bccs3_sale_trans_la'];
    for (const expectedDb of expectedDatabases) {
      expect(dbList).toContain(expectedDb);
    }
    console.log(`[MariaDB Test] Verified access to required BCCS3 databases: ${expectedDatabases.join(', ')}`);
  });
});
