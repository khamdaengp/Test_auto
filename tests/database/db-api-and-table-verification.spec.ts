import { test, expect } from '@playwright/test';
import mysql from 'mysql2/promise';

/**
 * Automated Database & API Integration Test Suite:
 * 1. End-to-End API-to-Database Data Consistency Verification:
 *    - Executes API request to BCCS3 API Gateway.
 *    - Asserts API response payload and verifies correlated user/audit state in MariaDB.
 * 2. Direct Database Table State Verification:
 *    - Verifies Account Status (Active, Lock Count, Dept) directly in bccs3_vsa_la.users.
 *    - Verifies User Security Roles in bccs3_vsa_la.roles and role_user.
 *    - Verifies OAuth Client & Token Configurations in bccs3_oauth.oauth_client_details.
 *    - Verifies Sales Transactions in bccs3_sale_trans_la.sale_trans.
 */

const DB_HOST = process.env.MARIADB_HOST || '10.120.254.144';
const DB_PORT = parseInt(process.env.MARIADB_PORT || '3306', 10);
const DB_USER = process.env.MARIADB_USER || 'bccs3_stl';
const DB_PASSWORD = process.env.MARIADB_PASSWORD || 'bCcs3#St1';
const DB_NAME = process.env.MARIADB_DATABASE || 'bccs3_vsa_la';

const API_BASE_URL = process.env.API_BASE_URL || 'http://10.120.44.76:8500';
const API_TOKEN = process.env.API_TOKEN || '';
const API_SESSION_ID = process.env.API_SESSION_ID || 'de4e7258-5c79-4ac3-8eba-54158a430174';
const API_USERNAME = process.env.API_USERNAME || 'BCCS3_FULL';

test.describe('Automated Database & API Integration Verification', () => {
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

  // -------------------------------------------------------------
  // PART 1: API Execution & Database Data Consistency Verification
  // -------------------------------------------------------------
  test('Case 1.1: Execute API Request and Assert Correlated User Account in Database', async ({ request }, testInfo) => {
    // 1. Send API Request to API Gateway
    const response = await request.post(`${API_BASE_URL}/ApiGateway/CoreService/UserRouting`, {
      data: {
        wsCode: 'WS_searchRptV2',
        wsRequest: {
          type: 'R580_GET_LST_CONNECTOR_CODE_WITH_SALE_STAFF_STATUS',
        },
        username: API_USERNAME,
        sessionId: API_SESSION_ID,
        token: API_TOKEN,
      },
      headers: { 'Content-Type': 'application/json' },
    });

    const responseStatus = response.status();
    const responseBodyText = await response.text();

    if (testInfo) {
      await testInfo.attach('api-response.json', { body: responseBodyText, contentType: 'application/json' });
      await testInfo.attach('api-status', { body: String(responseStatus), contentType: 'text/plain' });
    }

    expect(responseStatus).toBe(200);

    let apiJson: any = {};
    try {
      apiJson = JSON.parse(responseBodyText);
    } catch {
      throw new Error(`API returned non-JSON body: ${responseBodyText.slice(0, 100)}`);
    }

    expect(apiJson.errorCode).toBe('S200');
    expect(apiJson.errorMessage).toBe('The api access successful');
    expect(apiJson.result).toBeDefined();

    // 2. Query Database directly to verify the requesting user's identity & credentials
    const [userRows]: [any[], any] = await pool.query(
      'SELECT USER_ID, USER_NAME, STATUS, LOGIN_FAILURE_COUNT, EMAIL, DEPT_NAME FROM users WHERE LOWER(USER_NAME) = ? LIMIT 1',
      [API_USERNAME.toLowerCase()]
    );

    expect(userRows.length).toBe(1);
    const userInDb = userRows[0];

    // Assert database user record matches API authentication state
    expect(userInDb.USER_NAME.toLowerCase()).toBe(API_USERNAME.toLowerCase());
    expect(userInDb.STATUS).toBe(1); // Status 1 = Active
    expect(userInDb.LOGIN_FAILURE_COUNT).toBe(0); // Not locked
    expect(typeof userInDb.USER_ID).toBe('number');

    console.log(`[E2E Verification] API ${apiJson.errorCode} matched DB user ${userInDb.USER_NAME} (ID: ${userInDb.USER_ID}, Status: Active)`);
  });

  // -------------------------------------------------------------
  // PART 2: Direct Table State Verification (Account, Roles, Tokens, Transactions)
  // -------------------------------------------------------------
  test('Case 2.1: Verify Account Status, Active State & Lock Counters in users Table', async () => {
    const [activeUsers]: [any[], any] = await pool.query(
      'SELECT USER_ID, USER_NAME, FULL_NAME, STATUS, LOGIN_FAILURE_COUNT, LAST_LOGIN FROM users WHERE STATUS = 1 AND LOWER(USER_NAME) = ?',
      [API_USERNAME.toLowerCase()]
    );

    expect(activeUsers.length).toBe(1);
    const user = activeUsers[0];

    expect(user.STATUS).toBe(1);
    expect(user.LOGIN_FAILURE_COUNT).toBeLessThanOrEqual(3); // Under lock threshold
    expect(user.USER_NAME.toLowerCase()).toBe('bccs3_full');
    console.log(`[DB Assertion] User ${user.USER_NAME}: Status=${user.STATUS} (Active), LockFailures=${user.LOGIN_FAILURE_COUNT}`);
  });

  test('Case 2.2: Verify Security Roles and Permissions in roles & role_user Tables', async () => {
    const query = `
      SELECT u.USER_NAME, u.STATUS AS USER_STATUS, r.ROLE_ID, r.ROLE_NAME, r.ROLE_CODE, r.STATUS AS ROLE_STATUS
      FROM users u
      JOIN role_user ru ON u.USER_ID = ru.USER_ID
      JOIN roles r ON ru.ROLE_ID = r.ROLE_ID
      WHERE LOWER(u.USER_NAME) = ?
    `;
    const [roles]: [any[], any] = await pool.query(query, [API_USERNAME.toLowerCase()]);

    expect(Array.isArray(roles)).toBe(true);
    expect(roles.length).toBeGreaterThan(0);

    const roleCodes = roles.map((r: any) => r.ROLE_CODE);
    expect(roleCodes).toContain('ADMIN_BCCS3');

    for (const role of roles) {
      expect(role.ROLE_STATUS).toBe(1); // Active role
      expect(typeof role.ROLE_CODE).toBe('string');
    }

    console.log(`[DB Assertion] User has ${roles.length} active roles: ${roleCodes.join(', ')}`);
  });

  test('Case 2.3: Verify OAuth Client & Token Security in bccs3_oauth.oauth_client_details', async () => {
    const [oauthClients]: [any[], any] = await pool.query(
      'SELECT client_id, scope, authorized_grant_types, access_token_validity FROM bccs3_oauth.oauth_client_details LIMIT 10'
    );

    expect(Array.isArray(oauthClients)).toBe(true);
    expect(oauthClients.length).toBeGreaterThan(0);

    const clientIds = oauthClients.map((c: any) => c.client_id);
    expect(clientIds).toContain('authorization_client_id');

    for (const client of oauthClients) {
      expect(typeof client.client_id).toBe('string');
      expect(client.scope).toBeDefined();
      expect(client.access_token_validity).toBeGreaterThan(0);
    }

    console.log(`[DB Assertion] Verified ${oauthClients.length} OAuth clients in bccs3_oauth. Sample client: ${oauthClients[0].client_id}`);
  });

  test('Case 2.4: Verify Sales Transactions State & Integrity in bccs3_sale_trans_la.sale_trans', async () => {
    const [transactions]: [any[], any] = await pool.query(
      'SELECT SALE_TRANS_ID, SALE_TRANS_DATE, STATUS, AMOUNT_TAX, STAFF_ID, CUST_NAME FROM bccs3_sale_trans_la.sale_trans ORDER BY SALE_TRANS_DATE DESC LIMIT 5'
    );

    expect(Array.isArray(transactions)).toBe(true);
    expect(transactions.length).toBeGreaterThan(0);

    for (const trans of transactions) {
      expect(trans.SALE_TRANS_ID).toBeGreaterThan(0);
      expect(trans.SALE_TRANS_DATE).toBeDefined();
      expect([1, 2, 3, 4]).toContain(Number(trans.STATUS)); // Standard transaction status codes
      expect(typeof trans.AMOUNT_TAX).toBe('number');
      expect(trans.AMOUNT_TAX).toBeGreaterThanOrEqual(0);
    }

    const latest = transactions[0];
    console.log(`[DB Assertion] Latest transaction ID: ${latest.SALE_TRANS_ID}, Customer: "${latest.CUST_NAME}", Status: ${latest.STATUS}, Amount: ${latest.AMOUNT_TAX} LAK, Date: ${latest.SALE_TRANS_DATE}`);
  });
});
