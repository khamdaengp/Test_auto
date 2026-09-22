import { test, expect } from '@playwright/test';
import mysql from 'mysql2/promise';

/**
 * Automated API & Database Integration Test:
 * Target API: WS_createConnectorCodeWithSaleStaff
 * Verification:
 * 1. Execute API request WS_createConnectorCodeWithSaleStaff via BCCS3 API Gateway.
 * 2. Assert API Response: Status 200, errorCode 'S200', and success message:
 *    "Successfully mapped connector code with the sales staff".
 * 3. MariaDB Database Cross-Verification:
 *    - Verify Sales Staff existence, name, shop_id, and active status in bccs3_catalog_la.staff.
 *    - Verify Creator User account state and permissions in bccs3_vsa_la.users.
 *    - Verify Network Infrastructure cable boxes & connector state in bccs3_network_product_la.infrastructure.
 */

const DB_HOST = process.env.MARIADB_HOST || '10.120.254.144';
const DB_PORT = parseInt(process.env.MARIADB_PORT || '3306', 10);
const DB_USER = process.env.MARIADB_USER || 'bccs3_stl';
const DB_PASSWORD = process.env.MARIADB_PASSWORD || 'bCcs3#St1';

const API_BASE_URL = process.env.API_BASE_URL || 'http://10.120.44.76:8500';
const API_TOKEN = process.env.API_TOKEN || '';
const API_SESSION_ID = process.env.API_SESSION_ID || 'de4e7258-5c79-4ac3-8eba-54158a430174';
const API_USERNAME = process.env.API_USERNAME || 'BCCS3_FULL';

// Test Payload Parameters
const TEST_STAFF_CODE = '550112090';
const TEST_SHOP_ID = '3367';
const TEST_BRANCH_ID = '41';
const TEST_ACCOUNT = '2092326652';

test.describe('Automated Test: WS_createConnectorCodeWithSaleStaff API & Database Verification', () => {
  let conn: mysql.Connection;

  test.beforeAll(async () => {
    conn = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: 'bccs3_catalog_la',
      connectTimeout: 10_000,
    });
  });

  test.afterAll(async () => {
    if (conn) {
      await conn.end();
    }
  });

  test('TC-01: Call WS_createConnectorCodeWithSaleStaff and Assert API Gateway Success', async ({ request }, testInfo) => {
    const payload = {
      wsCode: 'WS_createConnectorCodeWithSaleStaff',
      wsRequest: {
        type: '2',
        branch: TEST_BRANCH_ID,
        businessCenter: TEST_SHOP_ID,
        saleStaff: TEST_STAFF_CODE,
        status: '1',
        branchName: 'BOP Vientiane Capital',
        businessCenterName: 'VIC 05 (Naxaythong district)',
        saleStaffName: '550112090_MR.Phoudthilad duangmala',
        account: TEST_ACCOUNT,
      },
      username: API_USERNAME,
      sessionId: API_SESSION_ID,
      token: API_TOKEN,
    };

    const response = await request.post(`${API_BASE_URL}/ApiGateway/CoreService/UserRouting`, {
      data: payload,
      headers: { 'Content-Type': 'application/json' },
    });

    const responseStatus = response.status();
    const responseBodyText = await response.text();

    if (testInfo) {
      await testInfo.attach('api-request.json', { body: JSON.stringify(payload, null, 2), contentType: 'application/json' });
      await testInfo.attach('api-response.json', { body: responseBodyText, contentType: 'application/json' });
      await testInfo.attach('api-status', { body: String(responseStatus), contentType: 'text/plain' });
    }

    console.log('[API Result]', responseBodyText);
    expect(responseStatus).toBe(200);

    const json = JSON.parse(responseBodyText);
    expect(json.errorCode).toBe('S200');
    expect(json.errorMessage).toBe('The api access successful');
    expect(json.result).toBeDefined();
    expect(json.result.errorCode).toBe('0');
    expect(json.result.object).toContain('Successfully mapped connector code with the sales staff');
  });

  test('TC-02: Verify Sales Staff & Business Center Alignment in bccs3_catalog_la.staff', async () => {
    const [rows]: [any[], any] = await conn.query(
      'SELECT staff_id, staff_code, name, status, shop_id, tel FROM bccs3_catalog_la.staff WHERE staff_code = ? LIMIT 1',
      [TEST_STAFF_CODE]
    );

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(1);

    const staff = rows[0];
    expect(staff.staff_code).toBe(TEST_STAFF_CODE);
    expect(staff.name).toContain('Phoudthilad');
    expect(String(staff.shop_id)).toBe(TEST_SHOP_ID); // Matches businessCenter 3367
    expect(Number(staff.status)).toBe(1); // Active staff
    console.log(`[DB Assertion] Staff verified in Database: ${staff.staff_code} - ${staff.name} (Shop/BusinessCenter: ${staff.shop_id}, Status: Active)`);
  });

  test('TC-03: Verify Calling User Credentials & Lock State in bccs3_vsa_la.users', async () => {
    const [userRows]: [any[], any] = await conn.query(
      'SELECT USER_ID, USER_NAME, STATUS, LOGIN_FAILURE_COUNT, DEPT_NAME FROM bccs3_vsa_la.users WHERE LOWER(USER_NAME) = ? LIMIT 1',
      [API_USERNAME.toLowerCase()]
    );

    expect(userRows.length).toBe(1);
    const user = userRows[0];
    expect(user.STATUS).toBe(1); // Active
    expect(user.LOGIN_FAILURE_COUNT).toBe(0); // Not locked
    console.log(`[DB Assertion] Creator user verified: ${user.USER_NAME} (Dept: ${user.DEPT_NAME}, Status: ${user.STATUS})`);
  });

  test('TC-04: Verify Active Network Connectors & Cable Boxes in bccs3_network_product_la', async () => {
    const [infras]: [any[], any] = await conn.query(
      'SELECT infrastructure_id, cable_box_code, status FROM bccs3_network_product_la.infrastructure WHERE cable_box_code IS NOT NULL AND status IN (1, 2) LIMIT 5'
    );

    expect(Array.isArray(infras)).toBe(true);
    expect(infras.length).toBeGreaterThan(0);

    for (const item of infras) {
      expect(item.cable_box_code).toBeDefined();
      expect(typeof item.cable_box_code).toBe('string');
      expect([1, 2]).toContain(Number(item.status));
    }
    console.log(`[DB Assertion] Network cable box connectors verified. Sample: ${infras[0].cable_box_code} (Status: ${infras[0].status})`);
  });
});
