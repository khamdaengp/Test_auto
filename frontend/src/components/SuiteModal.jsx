import React, { useState, useEffect } from 'react';
import {
  X,
  Code,
  FileCode,
  Monitor,
  Smartphone,
  Webhook,
  Database,
  RotateCcw,
  Check,
  AlertCircle,
  Loader2,
  Tag,
  Globe,
  Layers,
  Wand2,
  Video,
  Plus,
  Trash2,
  Sparkles,
  MousePointer,
  Type,
  CheckCircle2,
  ArrowRight,
  Camera,
  Clock,
  Calendar,
  Cpu,
  RefreshCw,
  Upload,
  FileText,
  CheckSquare,
  Eye,
  Sliders,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from 'lucide-react';

const STARTER_TEMPLATES = {
  e2e: (url = 'https://example.com') => `import { test, expect } from '@playwright/test';

test.describe('Custom Desktop Web Suite', () => {
  test('should load page and verify core elements', async ({ page }, testInfo) => {
    // 1. Navigate to target URL
    await page.goto('${url || 'https://example.com'}');

    // 2. Capture Before Action screenshot (Initial state)
    const beforeShot = testInfo.outputPath('before-action.png');
    await page.screenshot({ path: beforeShot, fullPage: true });
    await testInfo.attach('before-action', { path: beforeShot, contentType: 'image/png' });

    // 3. Verify page title and heading
    await expect(page).toHaveTitle(/.+/);
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    // 4. Capture After Action screenshot (Target state)
    const afterShot = testInfo.outputPath('after-action.png');
    await page.screenshot({ path: afterShot, fullPage: true });
    await testInfo.attach('after-action', { path: afterShot, contentType: 'image/png' });
  });
});
`,

  mobile: (url = 'https://example.com') => `import { test, expect } from '@playwright/test';

test.describe('Custom Mobile Emulation Suite', () => {
  test('should render responsive mobile layout correctly', async ({ page }, testInfo) => {
    // 1. Navigate to target URL with mobile emulation
    await page.goto('${url || 'https://example.com'}');

    const beforeShot = testInfo.outputPath('before-action.png');
    await page.screenshot({ path: beforeShot, fullPage: true });
    await testInfo.attach('before-action', { path: beforeShot, contentType: 'image/png' });

    // 2. Validate mobile viewport size (< 600px)
    const viewport = page.viewportSize();
    expect(viewport.width).toBeLessThanOrEqual(500);

    // 3. Verify mobile header visibility
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    // 4. Test mobile touch gesture
    const interactiveElement = page.locator('a, button').first();
    await expect(interactiveElement).toBeVisible();
    await interactiveElement.tap();

    const afterShot = testInfo.outputPath('after-action.png');
    await page.screenshot({ path: afterShot, fullPage: true });
    await testInfo.attach('after-action', { path: afterShot, contentType: 'image/png' });
  });
});
`,

  api: (url = 'https://jsonplaceholder.typicode.com') => `import { test, expect } from '@playwright/test';

test.describe('Custom API Testing Suite', () => {
  const BASE_URL = '${url || 'https://jsonplaceholder.typicode.com'}';

  test('GET endpoint - should return 200 OK and valid JSON', async ({ request }) => {
    const response = await request.get(\`\${BASE_URL}/posts/1\`);

    // Verify status code
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    // Verify response schema
    const body = await response.json();
    expect(body).toHaveProperty('id');
  });

  test('POST endpoint - should create resource with 201 status', async ({ request }) => {
    const response = await request.post(\`\${BASE_URL}/posts\`, {
      data: {
        title: 'Automated Playwright API Test',
        body: 'Payload validation test',
        userId: 1,
      },
    });

    expect(response.status()).toBe(201);
  });
});
`,

  database: (url = 'postgresql://qa_user:qa_password@localhost:5434/qa_dashboard') => `import { test, expect } from '@playwright/test';
import { Pool } from 'pg';

test.describe('Custom PostgreSQL Database Suite', () => {
  let pool: Pool;

  test.beforeAll(async () => {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || '${url || 'postgresql://qa_user:qa_password@localhost:5434/qa_dashboard'}',
      connectionTimeoutMillis: 5000,
    });
  });

  test.afterAll(async () => {
    if (pool) await pool.end();
  });

  test('should ping database and verify connection health', async () => {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT 1 AS ping, current_database() AS db_name');
      expect(res.rows.length).toBe(1);
      expect(res.rows[0].ping).toBe(1);
    } finally {
      client.release();
    }
  });

  test('should verify database tables and query latency', async () => {
    const client = await pool.connect();
    try {
      const start = performance.now();
      const res = await client.query('SELECT COUNT(*) AS total FROM test_suites');
      const latency = performance.now() - start;

      expect(res.rows.length).toBe(1);
      expect(latency).toBeLessThan(100);
    } finally {
      client.release();
    }
  });
});
`,
};

// 1-Click Scenario Presets for Non-coders
const SCENARIO_PRESETS = [
  {
    id: 'login-valid',
    name: 'Standard Login Success',
    desc: 'Fills email & password, clicks sign in, and verifies dashboard URL',
    targetUrl: 'http://localhost:5175/login',
    generate: (url) => `import { test, expect } from '@playwright/test';

test.describe('Scenario: Valid User Sign In', () => {
  test('verify successful login and redirect to dashboard', async ({ page }, testInfo) => {
    test.setTimeout(60_000);
    await page.goto('${url || 'http://localhost:5175/login'}', { waitUntil: 'domcontentloaded' });

    const beforeShot = testInfo.outputPath('before-action.png');
    await page.screenshot({ path: beforeShot, fullPage: true });
    await testInfo.attach('before-action', { path: beforeShot, contentType: 'image/png' });

    await page.getByPlaceholder('name@hrmn.local').fill('admin@hrmn.local');
    await page.getByPlaceholder('••••••••••••').fill('Password123!');
    await page.getByRole('button', { name: 'Sign In to Workspace' }).click();

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15_000 });

    const afterShot = testInfo.outputPath('after-action.png');
    await page.screenshot({ path: afterShot, fullPage: true });
    await testInfo.attach('after-action', { path: afterShot, contentType: 'image/png' });
  });
});
`,
  },
  {
    id: 'login-invalid-pass',
    name: 'Invalid Password Notification',
    desc: 'Enters bad password, clicks submit, and asserts error banner is visible',
    targetUrl: 'http://localhost:5175/login',
    generate: (url) => `import { test, expect } from '@playwright/test';

test.describe('Scenario: Invalid Password Security Check', () => {
  test('verify invalid credentials error notification', async ({ page }, testInfo) => {
    test.setTimeout(60_000);
    await page.goto('${url || 'http://localhost:5175/login'}', { waitUntil: 'domcontentloaded' });

    const beforeShot = testInfo.outputPath('before-action.png');
    await page.screenshot({ path: beforeShot, fullPage: true });
    await testInfo.attach('before-action', { path: beforeShot, contentType: 'image/png' });

    await page.getByPlaceholder('name@hrmn.local').fill('admin@hrmn.local');
    await page.getByPlaceholder('••••••••••••').fill('WrongPassword999!');
    await page.getByRole('button', { name: 'Sign In to Workspace' }).click();

    const errorAlert = page.locator('text=Invalid email or password');
    await expect(errorAlert).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/.*login/);

    const afterShot = testInfo.outputPath('after-action.png');
    await page.screenshot({ path: afterShot, fullPage: true });
    await testInfo.attach('after-action', { path: afterShot, contentType: 'image/png' });
  });
});
`,
  },
  {
    id: 'login-manager-quick',
    name: '1-Click Quick Role Login',
    desc: 'Clicks quick role preset button (Manager) and asserts instant dashboard entry',
    targetUrl: 'http://localhost:5175/login',
    generate: (url) => `import { test, expect } from '@playwright/test';

test.describe('Scenario: 1-Click Role Login', () => {
  test('verify quick role login for manager', async ({ page }, testInfo) => {
    test.setTimeout(60_000);
    await page.goto('${url || 'http://localhost:5175/login'}', { waitUntil: 'domcontentloaded' });

    const beforeShot = testInfo.outputPath('before-action.png');
    await page.screenshot({ path: beforeShot, fullPage: true });
    await testInfo.attach('before-action', { path: beforeShot, contentType: 'image/png' });

    await page.getByRole('button', { name: 'Manager' }).click();
    await expect(page.getByPlaceholder('name@hrmn.local')).toHaveValue('manager.tech@hrmn.local');
    await page.getByRole('button', { name: 'Sign In to Workspace' }).click();

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15_000 });

    const afterShot = testInfo.outputPath('after-action.png');
    await page.screenshot({ path: afterShot, fullPage: true });
    await testInfo.attach('after-action', { path: afterShot, contentType: 'image/png' });
  });
});
`,
  },
  {
    id: 'login-empty-fields',
    name: 'Empty Fields HTML5 Validation',
    desc: 'Leaves input empty, clicks submit, and confirms browser blocks submission',
    targetUrl: 'http://localhost:5175/login',
    generate: (url) => `import { test, expect } from '@playwright/test';

test.describe('Scenario: Required Fields Validation', () => {
  test('verify required fields block submission', async ({ page }, testInfo) => {
    test.setTimeout(60_000);
    await page.goto('${url || 'http://localhost:5175/login'}', { waitUntil: 'domcontentloaded' });

    const beforeShot = testInfo.outputPath('before-action.png');
    await page.screenshot({ path: beforeShot, fullPage: true });
    await testInfo.attach('before-action', { path: beforeShot, contentType: 'image/png' });

    await page.getByPlaceholder('name@hrmn.local').fill('admin@hrmn.local');
    await page.getByPlaceholder('••••••••••••').fill('');
    await page.getByRole('button', { name: 'Sign In to Workspace' }).click();

    await expect(page).toHaveURL(/.*login/);
    const passwordInput = page.getByPlaceholder('••••••••••••');
    const isInvalid = await passwordInput.evaluate((el: HTMLInputElement) => !el.checkValidity());
    expect(isInvalid).toBe(true);

    const afterShot = testInfo.outputPath('after-action.png');
    await page.screenshot({ path: afterShot, fullPage: true });
    await testInfo.attach('after-action', { path: afterShot, contentType: 'image/png' });
  });
});
`,
  },
];

// 1-Click Scenario Presets for API Request Testing
const API_PRESETS = [
  {
    id: 'api-get-verify',
    name: 'REST API GET Endpoint (Status 200 & Schema)',
    desc: 'Requests GET /posts/1, validates HTTP 200 OK, JSON content-type header, and response schema properties',
    targetUrl: 'https://jsonplaceholder.typicode.com',
    generate: (url) => `import { test, expect } from '@playwright/test';

test.describe('API Endpoint: GET /posts/1', () => {
  const BASE_URL = '${url || 'https://jsonplaceholder.typicode.com'}';

  test('should return 200 OK and valid post payload', async ({ request }) => {
    const response = await request.get(\`\${BASE_URL}/posts/1\`);

    // Verify status and headers
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('application/json');

    // Verify response body
    const body = await response.json();
    expect(body).toHaveProperty('id', 1);
    expect(body).toHaveProperty('title');
    expect(typeof body.title).toBe('string');
  });
});
`,
  },
  {
    id: 'api-post-create',
    name: 'REST API POST Resource Creation (Status 201)',
    desc: 'Sends POST with JSON payload, validates HTTP 201 Created status, and checks returned ID',
    targetUrl: 'https://jsonplaceholder.typicode.com',
    generate: (url) => `import { test, expect } from '@playwright/test';

test.describe('API Endpoint: POST /posts', () => {
  const BASE_URL = '${url || 'https://jsonplaceholder.typicode.com'}';

  test('should create new resource and return status 201', async ({ request }) => {
    const payload = {
      title: 'Automated Playwright API Test',
      body: 'Verified via Playwright Request fixture',
      userId: 1,
    };

    const response = await request.post(\`\${BASE_URL}/posts\`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.title).toBe(payload.title);
    expect(body).toHaveProperty('id');
  });
});
`,
  },
  {
    id: 'api-crud-lifecycle',
    name: 'Full CRUD Flow (POST -> GET -> PUT -> DELETE)',
    desc: 'Sequentially creates a record, fetches it, updates it with PUT, and deletes it with DELETE',
    targetUrl: 'https://jsonplaceholder.typicode.com',
    generate: (url) => `import { test, expect } from '@playwright/test';

test.describe('API Scenario: Complete CRUD Lifecycle', () => {
  const BASE_URL = '${url || 'https://jsonplaceholder.typicode.com'}';

  test('1. CREATE resource via POST', async ({ request }) => {
    const res = await request.post(\`\${BASE_URL}/posts\`, {
      data: { title: 'Initial Title', body: 'CRUD test body', userId: 1 },
    });
    expect(res.status()).toBe(201);
  });

  test('2. READ resource via GET', async ({ request }) => {
    const res = await request.get(\`\${BASE_URL}/posts/1\`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.id).toBe(1);
  });

  test('3. UPDATE resource via PUT', async ({ request }) => {
    const res = await request.put(\`\${BASE_URL}/posts/1\`, {
      data: { title: 'Updated Title', body: 'Modified body', userId: 1 },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.title).toBe('Updated Title');
  });

  test('4. DELETE resource via DELETE', async ({ request }) => {
    const res = await request.delete(\`\${BASE_URL}/posts/1\`);
    expect(res.status()).toBe(200);
  });
});
`,
  },
  {
    id: 'api-auth-bearer',
    name: 'Auth Header & Bearer Token Verification',
    desc: 'Simulates Authorization header with Bearer token, tests success and 404/401 negative check',
    targetUrl: 'https://jsonplaceholder.typicode.com',
    generate: (url) => `import { test, expect } from '@playwright/test';

test.describe('API Security: Authentication & Bearer Token', () => {
  const BASE_URL = '${url || 'https://jsonplaceholder.typicode.com'}';
  const MOCK_TOKEN = 'qa-bearer-token-xyz-12345';

  test('should accept request with valid Authorization header', async ({ request }) => {
    const response = await request.get(\`\${BASE_URL}/posts/1\`, {
      headers: {
        'Authorization': \`Bearer \${MOCK_TOKEN}\`,
        'Accept': 'application/json',
      },
    });
    expect(response.status()).toBe(200);
  });

  test('negative test: should handle missing resource gracefully', async ({ request }) => {
    const response = await request.get(\`\${BASE_URL}/posts/999999\`);
    expect(response.status()).toBe(404);
  });
});
`,
  },
  {
    id: 'api-latency-sla',
    name: 'API Response Latency & SLA Check (< 1000ms)',
    desc: 'Measures round-trip execution latency in milliseconds and asserts response is within SLA',
    targetUrl: 'https://jsonplaceholder.typicode.com',
    generate: (url) => `import { test, expect } from '@playwright/test';

test.describe('API Performance: Latency SLA Verification', () => {
  const BASE_URL = '${url || 'https://jsonplaceholder.typicode.com'}';

  test('GET /posts should respond within 1000ms SLA', async ({ request }) => {
    const startTime = performance.now();
    const response = await request.get(\`\${BASE_URL}/posts\`);
    const durationMs = performance.now() - startTime;

    expect(response.status()).toBe(200);
    // Performance assertion: ensure backend responds quickly
    expect(durationMs).toBeLessThan(1000);
  });
});
`,
  },
];

// Helper to convert Visual API Steps into Playwright Script
function generateApiCodeFromSteps(steps, baseUrl = 'https://jsonplaceholder.typicode.com') {
  const cleanUrl = (baseUrl || 'https://jsonplaceholder.typicode.com').replace(/\/$/, '');
  let testCases = '';

  steps.forEach((step, idx) => {
    const method = (step.method || 'GET').toLowerCase();
    const rawPath = step.path || '/';
    const stepPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    const status = parseInt(step.expectedStatus, 10) || 200;
    const testTitle = `${step.method || 'GET'} ${stepPath} - should return ${status}`;

    let requestSnippet = '';
    if (['post', 'put', 'patch'].includes(method)) {
      const dataString = step.payload && step.payload.trim() ? step.payload.trim() : '{\n        title: "Automated QA Test"\n      }';
      requestSnippet = `    const response = await request.${method}(\`\${BASE_URL}${stepPath}\`, {\n      data: ${dataString},\n      headers: { 'Content-Type': 'application/json' },\n    });`;
    } else if (method === 'delete') {
      requestSnippet = `    const response = await request.delete(\`\${BASE_URL}${stepPath}\`);`;
    } else {
      requestSnippet = `    const response = await request.get(\`\${BASE_URL}${stepPath}\`);`;
    }

    let assertionSnippet = `    expect(response.status()).toBe(${status});`;
    if (step.expectedKey && step.expectedKey.trim()) {
      assertionSnippet += `\n    const body = await response.json();\n    expect(body).toHaveProperty('${step.expectedKey.trim()}');`;
    }

    testCases += `  test('${testTitle}', async ({ request }) => {\n${requestSnippet}\n${assertionSnippet}\n  });\n\n`;
  });

  return `import { test, expect } from '@playwright/test';

test.describe('Automated API Request Test Suite', () => {
  const BASE_URL = '${cleanUrl}';

${testCases.trimEnd()}
});
`;
}

// 5 Production-Ready Pre-built Database Test Scenarios
const DATABASE_PRESETS = [
  {
    id: 'db-connection-health',
    name: 'PostgreSQL Connection & Health Ping',
    desc: 'Pings PostgreSQL, verifies connection health, active database name, and engine version string',
    targetUrl: 'postgresql://qa_user:qa_password@localhost:5434/qa_dashboard',
    generate: (url) => `import { test, expect } from '@playwright/test';
import { Pool } from 'pg';

test.describe('Database Health & Connection Verification', () => {
  let pool: Pool;

  test.beforeAll(async () => {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || '${url || 'postgresql://qa_user:qa_password@localhost:5434/qa_dashboard'}',
      connectionTimeoutMillis: 5000,
    });
  });

  test.afterAll(async () => {
    if (pool) await pool.end();
  });

  test('should connect and ping PostgreSQL engine', async () => {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT 1 AS ping, version() AS version, current_database() AS db_name');
      expect(res.rows.length).toBe(1);
      expect(res.rows[0].ping).toBe(1);
      expect(res.rows[0].version).toContain('PostgreSQL');
    } finally {
      client.release();
    }
  });
});
`,
  },
  {
    id: 'db-schema-tables',
    name: 'Core Schema Tables & Views Existence',
    desc: 'Queries information_schema.tables to verify all required business tables exist in public schema',
    targetUrl: 'postgresql://qa_user:qa_password@localhost:5434/qa_dashboard',
    generate: (url) => `import { test, expect } from '@playwright/test';
import { Pool } from 'pg';

test.describe('Database Schema: Table Existence Check', () => {
  let pool: Pool;

  test.beforeAll(async () => {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || '${url || 'postgresql://qa_user:qa_password@localhost:5434/qa_dashboard'}',
      connectionTimeoutMillis: 5000,
    });
  });

  test.afterAll(async () => {
    if (pool) await pool.end();
  });

  test('should verify required tables exist in public schema', async () => {
    const client = await pool.connect();
    try {
      const res = await client.query(\`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      \`);
      const tables = res.rows.map((r: { table_name: string }) => r.table_name);
      
      expect(tables).toContain('test_suites');
      expect(tables).toContain('test_runs');
      expect(tables).toContain('test_results');
    } finally {
      client.release();
    }
  });
});
`,
  },
  {
    id: 'db-transaction-rollback',
    name: 'ACID Transaction Isolation & Rollback Test',
    desc: 'Inserts test record within a transaction, rolls back, and asserts database has zero dirty data',
    targetUrl: 'postgresql://qa_user:qa_password@localhost:5434/qa_dashboard',
    generate: (url) => `import { test, expect } from '@playwright/test';
import { Pool } from 'pg';

test.describe('Database ACID: Transaction Rollback Integrity', () => {
  let pool: Pool;

  test.beforeAll(async () => {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || '${url || 'postgresql://qa_user:qa_password@localhost:5434/qa_dashboard'}',
      connectionTimeoutMillis: 5000,
    });
  });

  test.afterAll(async () => {
    if (pool) await pool.end();
  });

  test('should verify transactional rollback prevents data contamination', async () => {
    const client = await pool.connect();
    const tempId = \`qa-temp-\${Date.now()}\`;
    try {
      await client.query('BEGIN');
      await client.query(
        \`INSERT INTO test_suites (id, name, type, description, test_file, project, target_url, is_system)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)\`,
        [tempId, 'Rollback Test', 'database', 'Integrity Test', 'tests/database/db.spec.ts', 'database', '', false]
      );

      // Verify row exists inside active transaction
      const inside = await client.query('SELECT id FROM test_suites WHERE id = $1', [tempId]);
      expect(inside.rows.length).toBe(1);

      // Rollback transaction
      await client.query('ROLLBACK');

      // Verify row was cleanly removed outside
      const outside = await client.query('SELECT id FROM test_suites WHERE id = $1', [tempId]);
      expect(outside.rows.length).toBe(0);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  });
});
`,
  },
  {
    id: 'db-performance-sla',
    name: 'Query Latency SLA Benchmark (< 50ms)',
    desc: 'Executes aggregation query and measures execution time to ensure query completes within 50ms SLA',
    targetUrl: 'postgresql://qa_user:qa_password@localhost:5434/qa_dashboard',
    generate: (url) => `import { test, expect } from '@playwright/test';
import { Pool } from 'pg';

test.describe('Database Performance: Query Latency SLA (< 50ms)', () => {
  let pool: Pool;

  test.beforeAll(async () => {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || '${url || 'postgresql://qa_user:qa_password@localhost:5434/qa_dashboard'}',
      connectionTimeoutMillis: 5000,
    });
  });

  test.afterAll(async () => {
    if (pool) await pool.end();
  });

  test('COUNT query on test_runs should execute under 50ms', async () => {
    const client = await pool.connect();
    try {
      const startTime = performance.now();
      const res = await client.query('SELECT COUNT(*) AS total_runs FROM test_runs');
      const durationMs = performance.now() - startTime;

      expect(res.rows.length).toBe(1);
      expect(durationMs).toBeLessThan(50);
    } finally {
      client.release();
    }
  });
});
`,
  },
  {
    id: 'db-foreign-key-integrity',
    name: 'Foreign Key Constraint & Referential Integrity',
    desc: 'Attempts invalid foreign key insertion on child table to assert constraint error 23503 is thrown',
    targetUrl: 'postgresql://qa_user:qa_password@localhost:5434/qa_dashboard',
    generate: (url) => `import { test, expect } from '@playwright/test';
import { Pool } from 'pg';

test.describe('Database Integrity: Foreign Key Constraints', () => {
  let pool: Pool;

  test.beforeAll(async () => {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || '${url || 'postgresql://qa_user:qa_password@localhost:5434/qa_dashboard'}',
      connectionTimeoutMillis: 5000,
    });
  });

  test.afterAll(async () => {
    if (pool) await pool.end();
  });

  test('inserting invalid foreign key should throw PostgreSQL error 23503', async () => {
    const client = await pool.connect();
    try {
      let caughtFkViolation = false;
      try {
        await client.query(
          \`INSERT INTO test_results (id, run_id, title, project, file, status, duration_ms)
           VALUES ($1, $2, $3, $4, $5, $6, $7)\`,
          [\`invalid-fk-\${Date.now()}\`, 'non-existent-run-uuid-0000', 'FK Integrity', 'database', 'db.spec.ts', 'passed', 5]
        );
      } catch (err: any) {
        if (err.code === '23503') caughtFkViolation = true;
      }
      expect(caughtFkViolation).toBe(true);
    } finally {
      client.release();
    }
  });
});
`,
  },
];

// Helper to convert Visual Database Steps into Playwright Script
function generateDatabaseCodeFromSteps(steps, dbUrl = 'postgresql://qa_user:qa_password@localhost:5434/qa_dashboard') {
  let testCases = '';

  steps.forEach((step, idx) => {
    const title = step.desc || `Step ${idx + 1}: Execute ${step.type || 'SQL'} check`;
    let body = '';

    if (step.type === 'ping') {
      body = `    const res = await client.query('SELECT 1 AS ping, current_database() AS db_name');
    expect(res.rows.length).toBe(1);
    expect(res.rows[0].ping).toBe(1);`;
    } else if (step.type === 'table_exists') {
      const tbl = step.targetTable || 'test_suites';
      body = `    const res = await client.query(\`
      SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${tbl}'
    \`);
    expect(res.rows.length).toBeGreaterThanOrEqual(1);`;
    } else if (step.type === 'row_count') {
      const tbl = step.targetTable || 'test_runs';
      body = `    const res = await client.query('SELECT COUNT(*) AS count FROM ${tbl}');
    expect(parseInt(res.rows[0].count, 10)).toBeGreaterThanOrEqual(${parseInt(step.expectedRows, 10) || 0});`;
    } else {
      const sql = step.query || 'SELECT 1 AS result';
      body = `    const res = await client.query('${sql.replace(/'/g, "\\'")}');\n`;
      if (step.assertCol && step.assertVal) {
        body += `    expect(res.rows.length).toBeGreaterThanOrEqual(1);\n`;
        body += `    expect(String(res.rows[0]['${step.assertCol}'])).toBe('${step.assertVal}');`;
      } else {
        body += `    expect(res.rows.length).toBeGreaterThanOrEqual(1);`;
      }
    }

    testCases += `  test('${idx + 1}. ${title.replace(/'/g, "\\'")}', async () => {
    const client = await pool.connect();
    try {
${body}
    } finally {
      client.release();
    }
  });\n\n`;
  });

  return `import { test, expect } from '@playwright/test';
import { Pool } from 'pg';

test.describe('Automated Database Verification Suite', () => {
  let pool: Pool;

  test.beforeAll(async () => {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || '${dbUrl || 'postgresql://qa_user:qa_password@localhost:5434/qa_dashboard'}',
      connectionTimeoutMillis: 5000,
    });
  });

  test.afterAll(async () => {
    if (pool) await pool.end();
  });

${testCases.trimEnd()}
});
`;
}

// Helper to convert No-Code Steps into Playwright Script
function generateCodeFromSteps(steps, targetUrl) {
  let stepCode = '';
  steps.forEach((s, idx) => {
    const target = (s.target || '').replace(/'/g, "\\'");
    const val = (s.value || '').replace(/'/g, "\\'");
    const strategy = s.strategy || 'auto';

    switch (s.type) {
      case 'fill': {
        const isCss = target.startsWith('#') || target.startsWith('.') || target.includes('[') || target.includes('>');
        if (strategy === 'label') {
          stepCode += `    // Step ${idx + 1}: Fill input located by label "${target}"\n`;
          stepCode += `    await page.getByLabel('${target}').fill('${val}');\n\n`;
        } else if (strategy === 'css' || isCss) {
          stepCode += `    // Step ${idx + 1}: Fill input located by selector "${target}"\n`;
          stepCode += `    await page.locator('${target}').fill('${val}');\n\n`;
        } else if (strategy === 'testid') {
          stepCode += `    // Step ${idx + 1}: Fill input located by test-id "${target}"\n`;
          stepCode += `    await page.getByTestId('${target}').fill('${val}');\n\n`;
        } else if (strategy === 'placeholder') {
          stepCode += `    // Step ${idx + 1}: Fill input located by placeholder "${target}"\n`;
          stepCode += `    await page.getByPlaceholder('${target}').fill('${val}');\n\n`;
        } else {
          // 'auto' strategy: smart fallback supporting placeholder, label, name, or id
          stepCode += `    // Step ${idx + 1}: Fill input (smart auto: placeholder, label, name, or id "${target}")\n`;
          stepCode += `    await (page.getByPlaceholder('${target}').or(page.getByLabel('${target}')).or(page.locator('input[name="${target}"], input[id="${target}"]')).first()).fill('${val}');\n\n`;
        }
        break;
      }
      case 'click': {
        const isCss = target.startsWith('#') || target.startsWith('.') || target.includes('[') || target.includes('>');
        if (strategy === 'css' || isCss) {
          stepCode += `    // Step ${idx + 1}: Click element by selector "${target}"\n`;
          stepCode += `    await page.locator('${target}').click();\n\n`;
        } else if (strategy === 'testid') {
          stepCode += `    // Step ${idx + 1}: Click element by test-id "${target}"\n`;
          stepCode += `    await page.getByTestId('${target}').click();\n\n`;
        } else {
          stepCode += `    // Step ${idx + 1}: Click button or link "${target}"\n`;
          stepCode += `    await (page.getByRole('button', { name: '${target}' }).or(page.getByRole('link', { name: '${target}' })).or(page.locator('button:has-text("${target}"), a:has-text("${target}")')).first()).click();\n\n`;
        }
        break;
      }
      case 'assert_url': {
        // Escape forward slashes so it produces a valid JS regex literal /.../
        const escapedUrl = target.replace(/\\/g, '\\\\').replace(/\//g, '\\/');
        stepCode += `    // Step ${idx + 1}: Verify URL contains "${target}"\n`;
        stepCode += `    await expect(page).toHaveURL(/.*${escapedUrl}/, { timeout: 15_000 });\n\n`;
        break;
      }
      case 'assert_text': {
        const cleanText = target.replace(/^text=/, '').replace(/'/g, "\\'");
        if (val && val.trim()) {
          const cleanVal = val.trim().replace(/'/g, "\\'");
          stepCode += `    // Step ${idx + 1}: Verify dropdown "${cleanText}" contains "${cleanVal}"\n`;
          stepCode += `    await expect(page.locator('form formly-field, form .ant-form-item, form nz-form-item, form .ant-col').filter({ has: page.getByText('${cleanText}', { exact: true }) }).locator('nz-select:not(.ant-pagination-options-size-changer), .ant-select:not(.ant-pagination-options-size-changer)').first()).toContainText('${cleanVal}', { timeout: 10_000 });\n\n`;
        } else {
          stepCode += `    // Step ${idx + 1}: Verify text "${cleanText}" is visible\n`;
          stepCode += `    await expect(page.getByRole('button', { name: '${cleanText}' }).or(page.getByText('${cleanText}')).or(page.locator('button:has-text("${cleanText}"), a:has-text("${cleanText}")')).first()).toBeVisible({ timeout: 10_000 });\n\n`;
        }
        break;
      }
      case 'select_option':
        stepCode += `    // Step ${idx + 1}: Select option "${val}" in dropdown "${target}"\n`;
        stepCode += `    await (page.locator('select[name="${target}"], select[id="${target}"]')
      .or(page.getByLabel('${target}'))
      .or(page.locator('${target}'))
      .first()).selectOption({ label: '${val}' });\n\n`;
        break;
      case 'upload_file':
        stepCode += `    // Step ${idx + 1}: Upload file "${val}" to file input "${target}"\n`;
        stepCode += `    await (page.locator('input[type="file"][name="${target}"], input[type="file"][id="${target}"]')
      .or(page.locator('${target}'))
      .first()).setInputFiles('${val}');\n\n`;
        break;
      case 'hover':
        stepCode += `    // Step ${idx + 1}: Hover over element "${target}"\n`;
        stepCode += `    await (page.locator('${target}')
      .or(page.getByRole('button', { name: '${target}' }))
      .or(page.getByText('${target}'))
      .first()).hover();\n\n`;
        break;
      case 'check':
        stepCode += `    // Step ${idx + 1}: Check checkbox/radio "${target}"\n`;
        stepCode += `    await (page.getByLabel('${target}')
      .or(page.locator('input[type="checkbox"][name="${target}"], input[type="checkbox"][id="${target}"]'))
      .or(page.locator('${target}'))
      .first()).check();\n\n`;
        break;
      case 'uncheck':
        stepCode += `    // Step ${idx + 1}: Uncheck checkbox "${target}"\n`;
        stepCode += `    await (page.getByLabel('${target}')
      .or(page.locator('input[type="checkbox"][name="${target}"], input[type="checkbox"][id="${target}"]'))
      .or(page.locator('${target}'))
      .first()).uncheck();\n\n`;
        break;
      case 'wait_for_selector':
        stepCode += `    // Step ${idx + 1}: Wait for element "${target}" to be visible\n`;
        stepCode += `    await (page.locator('${target}').or(page.getByText('${target}')).first()).waitFor({ state: 'visible', timeout: 15_000 });\n\n`;
        break;
      case 'wait_for_response':
        stepCode += `    // Step ${idx + 1}: Wait for API response matching "${target}"\n`;
        stepCode += `    await page.waitForResponse((res) => res.url().includes('${target}') && res.status() === 200, { timeout: 15_000 });\n\n`;
        break;
      case 'scroll_to':
        stepCode += `    // Step ${idx + 1}: Scroll element "${target}" into view\n`;
        stepCode += `    await (page.locator('${target}').or(page.getByText('${target}')).first()).scrollIntoViewIfNeeded();\n\n`;
        break;
      default:
        break;
    }
  });

  return `import { test, expect } from '@playwright/test';

test.describe('Automated Visual Scenario', () => {
  test('execute visual no-code test flow', async ({ page }, testInfo) => {
    test.setTimeout(60_000);

    // 1. Navigate to target URL
    await page.goto('${targetUrl || 'http://localhost:5175/login'}', { waitUntil: 'domcontentloaded' });

    // Capture Start Screenshot (Before Action)
    const beforeShot = testInfo.outputPath('before-action.png');
    await page.screenshot({ path: beforeShot, fullPage: true });
    await testInfo.attach('before-action', { path: beforeShot, contentType: 'image/png' });

    // 2. User Defined Action Steps
${stepCode || '    // No steps defined\n'}
    // Capture End Screenshot (After Action)
    const afterShot = testInfo.outputPath('after-action.png');
    await page.screenshot({ path: afterShot, fullPage: true });
    await testInfo.attach('after-action', { path: afterShot, contentType: 'image/png' });
  });
});`;
}

// Reverse Parser: converts Playwright Code Script into Visual Steps
function parseCodeToVisualSteps(code, type = 'e2e') {
  if (!code || typeof code !== 'string') return [];
  if (type === 'api') {
    return parseApiCodeToSteps(code);
  } else if (type === 'database') {
    return parseDatabaseCodeToSteps(code);
  } else {
    return parseWebCodeToSteps(code);
  }
}

function parseWebCodeToSteps(code) {
  const steps = [];
  if (!code || typeof code !== 'string') return steps;

  const rawLines = code.split(/\r?\n/);
  const statements = [];
  let buffer = '';
  let currentComment = '';

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (!line) continue;

    if (line.startsWith('//')) {
      const c = line.replace(/^\/\/\s*/, '').trim();
      if (
        !c.toLowerCase().includes('before-action') &&
        !c.toLowerCase().includes('after-action') &&
        !c.toLowerCase().includes('screenshot')
      ) {
        currentComment = c;
      }
      continue;
    }

    if (
      line.startsWith('import ') ||
      line.startsWith('test.describe') ||
      line.startsWith('test(') ||
      line.startsWith('test.setTimeout') ||
      line.includes('outputPath(') ||
      line.includes('screenshot(') ||
      line.includes('attach(') ||
      line === '});' ||
      line === '}' ||
      line === 'try {' ||
      line === '} finally {' ||
      line === 'catch'
    ) {
      currentComment = '';
      continue;
    }

    buffer = buffer ? buffer + ' ' + line : line;

    const openParens = (buffer.match(/\(/g) || []).length;
    const closeParens = (buffer.match(/\)/g) || []).length;
    const isTerminated =
      buffer.endsWith(';') ||
      (openParens <= closeParens &&
        (buffer.includes('.fill(') ||
          buffer.includes('.click(') ||
          buffer.includes('.toBe') ||
          buffer.includes('.toHave') ||
          buffer.includes('.toContain') ||
          buffer.includes('.selectOption(') ||
          buffer.includes('.waitFor')));

    if (isTerminated || i === rawLines.length - 1) {
      statements.push({ text: buffer, comment: currentComment });
      buffer = '';
      currentComment = '';
    }
  }

  const pendingConsts = new Map();
  let legacyPlaceholderCount = 0;

  for (const item of statements) {
    let raw = item.text.trim();
    const comment = item.comment;

    const varMatch = raw.match(/(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*([^;]+);?/);
    if (varMatch) {
      pendingConsts.set(varMatch[1], varMatch[2]);
    }

    for (const [varName, expr] of pendingConsts.entries()) {
      if (raw.includes(varName)) {
        raw = raw.replace(new RegExp('\\b' + varName + '\\b', 'g'), expr);
      }
    }

    let step = null;

    // 1. FILL
    const fillMatch = raw.match(/\.fill\(\s*(['"`])(.*?)\1\s*\)/);
    if (fillMatch) {
      const val = fillMatch[2];
      let target = 'Input Field';
      let strategy = 'auto';

      const phMatch = raw.match(/getByPlaceholder\(\s*(?:['"`]|\/)(.*?)(?:['"`\/]|\))/);
      const labelMatch = raw.match(/getByLabel\(\s*(?:['"`]|\/)(.*?)(?:['"`\/]|\))/);
      const testidMatch = raw.match(/getByTestId\(\s*(?:['"`]|\/)(.*?)(?:['"`\/]|\))/);
      const locMatch = raw.match(/locator\(\s*(?:['"`]|\/)(.*?)(?:['"`\/]|\))/);
      const nameMatch = raw.match(/input\[name=(['"`])(.*?)\1\]/);

      if (phMatch && phMatch[1]) {
        target = phMatch[1];
        strategy = 'placeholder';
      } else if (labelMatch && labelMatch[1]) {
        target = labelMatch[1];
        strategy = 'label';
      } else if (testidMatch && testidMatch[1]) {
        target = testidMatch[1];
        strategy = 'testid';
      } else if (locMatch && locMatch[1]) {
        target = locMatch[1];
        strategy = 'css';
      } else if (nameMatch && nameMatch[2]) {
        target = nameMatch[2];
        strategy = 'auto';
      } else {
        const firstStr = raw.match(/(['"`])([^'"`]+)\1/);
        if (firstStr && firstStr[2] !== val) target = firstStr[2];
      }

      step = {
        id: Date.now() + steps.length,
        type: 'fill',
        strategy,
        target,
        value: val,
        label: comment || `Fill "${target}" with "${val}"`,
      };
    }

    // 2. CLICK / TAP
    else if (raw.includes('.click(') || raw.includes('.tap(')) {
      let target = 'Button / Element';
      let strategy = 'auto';

      const roleMatch = raw.match(/getByRole\(\s*(['"`])([a-zA-Z0-9_-]+)\1\s*,\s*\{\s*name:\s*(?:['"`]|\/)(.*?)(?:['"`\/]|\})/);
      const testidMatch = raw.match(/getByTestId\(\s*(?:['"`]|\/)(.*?)(?:['"`\/]|\))/);
      const locMatch = raw.match(/locator\(\s*(?:['"`]|\/)(.*?)(?:['"`\/]|\))/);
      const textMatch = raw.match(/getByText\(\s*(?:['"`]|\/)(.*?)(?:['"`\/]|\))/);

      if (roleMatch && roleMatch[3]) {
        target = roleMatch[3];
        strategy = 'role';
      } else if (testidMatch && testidMatch[1]) {
        target = testidMatch[1];
        strategy = 'testid';
      } else if (locMatch && locMatch[1]) {
        target = locMatch[1];
        strategy = 'css';
      } else if (textMatch && textMatch[1]) {
        target = textMatch[1];
        strategy = 'auto';
      } else {
        const firstStr = raw.match(/(['"`])([^'"`]+)\1/);
        if (firstStr) target = firstStr[2];
      }

      step = {
        id: Date.now() + steps.length,
        type: 'click',
        strategy,
        target,
        value: '',
        label: comment || `Click "${target}"`,
      };
    }

    // 3. ASSERT URL
    else if (raw.includes('toHaveURL')) {
      let target = 'dashboard';
      const regexMatch = raw.match(/toHaveURL\(\s*\/(.*?)\/(?:[a-z]*)\s*[,)]/);
      const strMatch = raw.match(/toHaveURL\(\s*(['"`])(.*?)\1/);
      if (regexMatch && regexMatch[1]) {
        target = regexMatch[1].replace(/^\.\*/, '').replace(/\\([\/])/g, '$1');
      } else if (strMatch && strMatch[2]) {
        target = strMatch[2];
      }
      step = {
        id: Date.now() + steps.length,
        type: 'assert_url',
        strategy: 'auto',
        target,
        value: '',
        label: comment || `Verify URL contains "${target}"`,
      };
    }

    // 4. ASSERT TEXT / VISIBILITY / DROPDOWN VALUES
    else if (
      raw.includes('toBeVisible') ||
      raw.includes('toBeHidden') ||
      raw.includes('toHaveText') ||
      raw.includes('toContainText') ||
      raw.includes('toHaveTitle')
    ) {
      let target = 'heading';
      let val = '';
      const isHidden = raw.includes('toBeHidden');

      // Check if it's checking dropdown / element text containing value
      const containMatch = raw.match(/(?:toContainText|toHaveText)\(\s*(?:['"`]|\/)(.*?)(?:['"`\/]|\))/);
      if (containMatch && containMatch[1]) {
        val = containMatch[1].trim();
      }

      const titleMatch = raw.match(/toHaveTitle\(\s*(?:['"`]|\/)(.*?)(?:['"`\/]|\))/);
      const roleMatch = raw.match(/getByRole\(\s*(['"`])(.*?)\1\s*,\s*\{\s*name:\s*(?:['"`]|\/)(.*?)(?:['"`\/]|\})/);
      const textMatch = raw.match(/getByText\(\s*(?:['"`]|\/)(.*?)(?:['"`\/]|\))/);
      const filterMatch = raw.match(/filter\(\s*\{\s*(?:hasText|has):\s*(?:page\.getByText\(\s*)?['"`](.*?)['"`]/);
      const hasTextMatch = raw.match(/:has-text\(\s*['"`](.*?)['"`]\s*\)/);
      const locMatch = raw.match(/locator\(\s*(?:['"`]|\/)(.*?)(?:['"`\/]|\))/);

      if (filterMatch && filterMatch[1]) {
        target = filterMatch[1];
      } else if (titleMatch && titleMatch[1]) {
        target = `Title: ${titleMatch[1]}`;
      } else if (roleMatch && roleMatch[3]) {
        target = roleMatch[3];
      } else if (hasTextMatch && hasTextMatch[1]) {
        target = hasTextMatch[1];
      } else if (textMatch && textMatch[1]) {
        target = textMatch[1];
      } else if (locMatch && locMatch[1]) {
        target = locMatch[1];
      } else {
        const firstStr = raw.match(/(['"`])([^'"`]+)\1/);
        if (firstStr) target = firstStr[2];
      }

      if (target.startsWith('text=')) {
        target = target.replace(/^text=/, '');
      }

      // If target contains variable placeholders or template expressions like ${cleanText} or ${fieldName}
      if (target.includes('${') || target.includes('cleanText') || target.includes('fieldName')) {
        if (comment) {
          // Extract quoted string from comment: e.g. // Step 10: Verify text "search" is visible
          const commentTextMatch = comment.match(/(?:text|button|link|dropdown|element)?\s*["'`](.*?)["'`]\s*(?:is visible|contains|$)/i);
          if (commentTextMatch && commentTextMatch[1] && !commentTextMatch[1].includes('${')) {
            target = commentTextMatch[1];
          } else {
            // Check comment for known field names
            const knownNames = [
              'Branch',
              'Business center',
              'Sales staff',
              'Station code',
              'Cablebox code',
              'Status',
              'Search',
              'Reset',
              'Create',
              'Import files',
              'Export files',
            ];
            const found = knownNames.find((n) => comment.toLowerCase().includes(n.toLowerCase()));
            if (found) {
              target = found;
              if (['Branch', 'Business center', 'Sales staff', 'Station code', 'Cablebox code', 'Status'].includes(found)) {
                if (!val) val = 'All';
              }
            }
          }
        }
      }

      // If target is still a variable placeholder (${cleanText} or ${fieldName}), fallback gracefully to sequential dropdown or action names
      if (target.includes('${') || target.includes('cleanText') || target.includes('fieldName')) {
        const fallbacks = [
          { t: 'Branch', v: 'All' },
          { t: 'Business center', v: 'All' },
          { t: 'Sales staff', v: 'All' },
          { t: 'Station code', v: 'All' },
          { t: 'Cablebox code', v: 'All' },
          { t: 'Status', v: 'All' },
          { t: 'Search', v: '' },
          { t: 'Reset', v: '' },
          { t: '+ Create', v: '' },
          { t: 'Import files', v: '' },
          { t: 'Export files', v: '' },
        ];
        const fallbackIdx = legacyPlaceholderCount % fallbacks.length;
        legacyPlaceholderCount++;
        target = fallbacks[fallbackIdx].t;
        if (!val && fallbacks[fallbackIdx].v) val = fallbacks[fallbackIdx].v;
      }

      // Clean up regex symbols if target was extracted from regex literal (e.g. \+?\s*create -> + Create)
      if (target.includes('\\+') || target.toLowerCase().includes('create')) {
        target = '+ Create';
      } else if (target.toLowerCase() === 'search') {
        target = 'Search';
      } else if (target.toLowerCase() === 'reset') {
        target = 'Reset';
      } else if (target.toLowerCase() === 'import files') {
        target = 'Import files';
      } else if (target.toLowerCase().startsWith('export files')) {
        target = 'Export files';
      }

      const safeComment = comment && !comment.includes('${') && !comment.includes('cleanText') ? comment : '';
      step = {
        id: Date.now() + steps.length,
        type: 'assert_text',
        strategy: 'auto',
        target,
        value: val,
        label: safeComment || (val ? `Verify "${target}" contains "${val}"` : (isHidden ? `Verify "${target}" is hidden` : `Verify "${target}" is visible`)),
      };
    }

    // 5. SELECT OPTION
    else if (raw.includes('.selectOption(')) {
      const optMatch = raw.match(/selectOption\(\s*\{?\s*(?:label:\s*)?(['"`])(.*?)\1\s*\}?\s*\)/);
      const locMatch = raw.match(/locator\(\s*(['"`])(.*?)\1\s*\)/);
      step = {
        id: Date.now() + steps.length,
        type: 'select_option',
        strategy: 'auto',
        target: locMatch ? locMatch[2] : 'select',
        value: optMatch ? optMatch[2] : '',
        label: comment || `Select option "${optMatch ? optMatch[2] : ''}"`,
      };
    }

    // 6. UPLOAD FILE
    else if (raw.includes('.setInputFiles(')) {
      const fileMatch = raw.match(/setInputFiles\(\s*(['"`])(.*?)\1\s*\)/);
      const locMatch = raw.match(/locator\(\s*(['"`])(.*?)\1\s*\)/);
      step = {
        id: Date.now() + steps.length,
        type: 'upload_file',
        strategy: 'auto',
        target: locMatch ? locMatch[2] : 'input[type="file"]',
        value: fileMatch ? fileMatch[2] : '',
        label: comment || `Upload file "${fileMatch ? fileMatch[2] : ''}"`,
      };
    }

    // 7. HOVER
    else if (raw.includes('.hover(')) {
      const locMatch = raw.match(/(?:locator|getByRole|getByText)\(\s*(['"`])(.*?)\1\s*\)/);
      const target = locMatch ? locMatch[2] : 'element';
      step = {
        id: Date.now() + steps.length,
        type: 'hover',
        strategy: 'auto',
        target,
        value: '',
        label: comment || `Hover on "${target}"`,
      };
    }

    // 8. CHECK / UNCHECK
    else if (raw.includes('.check(') || raw.includes('.uncheck(')) {
      const isUncheck = raw.includes('.uncheck(');
      const locMatch = raw.match(/(?:locator|getByLabel)\(\s*(['"`])(.*?)\1\s*\)/);
      const target = locMatch ? locMatch[2] : 'checkbox';
      step = {
        id: Date.now() + steps.length,
        type: isUncheck ? 'uncheck' : 'check',
        strategy: 'auto',
        target,
        value: '',
        label: comment || (isUncheck ? `Uncheck "${target}"` : `Check "${target}"`),
      };
    }

    // 9. WAIT FOR SELECTOR / LOAD STATE
    else if (raw.includes('waitForSelector(') || raw.includes('waitForLoadState(')) {
      const selMatch = raw.match(/waitFor(?:Selector|LoadState)\(\s*(['"`])(.*?)\1\s*\)/);
      const target = selMatch ? selMatch[2] : 'domcontentloaded';
      step = {
        id: Date.now() + steps.length,
        type: 'wait_for_selector',
        strategy: 'auto',
        target,
        value: '',
        label: comment || `Wait for "${target}"`,
      };
    }

    if (step) {
      steps.push(step);
    }
  }

  return steps;
}

function parseApiCodeToSteps(code) {
  const steps = [];
  const reqRegex = /request\.(get|post|put|delete|patch)\(\s*(?:`([^`]+)`|(['"`])(.*?)\3)\s*(?:,\s*\{([\s\S]*?)\}\s*)?\)/gi;
  let match;
  let idx = 1;
  while ((match = reqRegex.exec(code)) !== null) {
    const method = match[1].toUpperCase();
    let rawPath = match[2] || match[4] || '/';
    rawPath = rawPath.replace(/\$\{?[a-zA-Z0-9_]*BASE_URL\}?/gi, '').replace(/^https?:\/\/[^\/]+/, '') || '/';

    const subStr = code.slice(match.index, match.index + 500);
    const statusMatch = subStr.match(/expect\(.*status\(\)\)\.toBe\((\d+)\)/);
    const status = statusMatch ? parseInt(statusMatch[1], 10) : (method === 'POST' ? 201 : 200);

    const propMatch = subStr.match(/toHaveProperty\(\s*(['"`])(.*?)\1\s*\)/);
    const expectedKey = propMatch ? propMatch[2] : 'id';

    let payload = '';
    if (match[5]) {
      const dataMatch = match[5].match(/data:\s*(\{[\s\S]*?\})/);
      if (dataMatch) {
        payload = dataMatch[1].trim();
      }
    }

    steps.push({
      id: Date.now() + idx,
      method,
      path: rawPath.startsWith('/') ? rawPath : `/${rawPath}`,
      expectedStatus: status,
      expectedKey,
      payload,
      desc: `${method} ${rawPath} - Expect ${status}`,
    });
    idx++;
  }

  return steps;
}

function parseDatabaseCodeToSteps(code) {
  const steps = [];
  const queryRegex = /client\.query\(\s*(?:`([\s\S]*?)`|(['"`])([\s\S]*?)\2)/gi;
  let match;
  let idx = 1;

  while ((match = queryRegex.exec(code)) !== null) {
    const sql = (match[1] || match[3] || '').trim();
    if (!sql) continue;

    if (sql.includes('SELECT 1 AS ping') || sql.includes('version()')) {
      steps.push({
        id: Date.now() + idx,
        type: 'ping',
        targetTable: '',
        expectedRows: '1',
        assertCol: 'ping',
        assertVal: '1',
        desc: 'PostgreSQL connection ping & health check',
      });
    } else if (sql.includes('information_schema.tables')) {
      const tblMatch = sql.match(/table_name\s*=\s*['"]([a-zA-Z0-9_-]+)['"]/);
      steps.push({
        id: Date.now() + idx,
        type: 'table_exists',
        targetTable: tblMatch ? tblMatch[1] : 'test_suites',
        expectedRows: '1',
        assertCol: '',
        assertVal: '',
        desc: `Verify table "${tblMatch ? tblMatch[1] : 'table'}" exists`,
      });
    } else if (sql.includes('COUNT(') || sql.includes('count(')) {
      const tblMatch = sql.match(/FROM\s+([a-zA-Z0-9_-]+)/i);
      steps.push({
        id: Date.now() + idx,
        type: 'row_count',
        targetTable: tblMatch ? tblMatch[1] : 'test_runs',
        expectedRows: '0',
        assertCol: '',
        assertVal: '',
        desc: `Verify "${tblMatch ? tblMatch[1] : 'table'}" has accessible records`,
      });
    } else {
      steps.push({
        id: Date.now() + idx,
        type: 'query',
        targetTable: '',
        query: sql,
        expectedRows: '1',
        assertCol: '',
        assertVal: '',
        desc: `Execute SQL: ${sql.slice(0, 32).replace(/\n/g, ' ')}...`,
      });
    }
    idx++;
  }

  return steps;
}

export default function SuiteModal({ suite, isOpen, onClose, onSave, projects = [], selectedProjectId = 'all' }) {
  const [activeTab, setActiveTab] = useState('nocode'); // 'nocode' | 'presets' | 'code'
  const [formData, setFormData] = useState({
    name: '',
    type: 'e2e',
    project: 'chromium',
    projectId: '',
    targetUrl: '',
    description: '',
    tags: '',
    code: '',
    scheduleCron: '0 8 * * *',
    isScheduledEnabled: false,
    environmentProfile: 'default',
    workersCount: 1,
    retryCount: 1,
    testDataset: '',
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codegenStatus, setCodegenStatus] = useState(null);

  // Visual No-Code Steps for Web UI
  const [visualSteps, setVisualSteps] = useState([
    { id: 1, type: 'fill', strategy: 'auto', target: 'name@hrmn.local', value: 'admin@hrmn.local', label: 'Email' },
    { id: 2, type: 'fill', strategy: 'auto', target: '••••••••••••', value: 'Password123!', label: 'Password' },
    { id: 3, type: 'click', strategy: 'auto', target: 'Sign In to Workspace', value: '', label: 'Sign In Button' },
    { id: 4, type: 'assert_url', strategy: 'auto', target: 'dashboard', value: '', label: 'Verify Dashboard' },
  ]);

  // Visual No-Code Steps for API Request Testing
  const [apiSteps, setApiSteps] = useState([
    { id: 1, method: 'GET', path: '/posts/1', expectedStatus: 200, expectedKey: 'id', payload: '', desc: 'Fetch single post & verify ID' },
    { id: 2, method: 'POST', path: '/posts', expectedStatus: 201, expectedKey: 'id', payload: '{\n  "title": "Automated Post",\n  "body": "API Test Payload",\n  "userId": 1\n}', desc: 'Create new post with JSON payload' },
    { id: 3, method: 'GET', path: '/posts/999999', expectedStatus: 404, expectedKey: '', payload: '', desc: 'Verify 404 for missing resource' },
  ]);

  // Visual No-Code Steps for Database Testing
  const [databaseSteps, setDatabaseSteps] = useState([
    { id: 1, type: 'ping', targetTable: '', expectedRows: '1', assertCol: 'ping', assertVal: '1', desc: 'PostgreSQL connection ping & health check' },
    { id: 2, type: 'table_exists', targetTable: 'test_suites', expectedRows: '1', assertCol: '', assertVal: '', desc: 'Verify core table "test_suites" exists in schema' },
    { id: 3, type: 'row_count', targetTable: 'test_runs', expectedRows: '0', assertCol: '', assertVal: '', desc: 'Verify "test_runs" table has accessible records' },
  ]);

  // Synchronize Playwright Code Script from Tab 3 into Visual Steps in Tab 1
  const syncCodeToVisualSteps = (code, type = 'e2e') => {
    if (!code || typeof code !== 'string') return;
    try {
      if (type === 'api') {
        const parsed = parseApiCodeToSteps(code);
        if (parsed && parsed.length > 0) {
          setApiSteps(parsed);
        }
      } else if (type === 'database') {
        const parsed = parseDatabaseCodeToSteps(code);
        if (parsed && parsed.length > 0) {
          setDatabaseSteps(parsed);
        }
      } else {
        const parsed = parseWebCodeToSteps(code);
        if (parsed && parsed.length > 0) {
          setVisualSteps(parsed);
        }
      }
    } catch (err) {
      console.warn('Failed to parse Playwright code into visual steps:', err);
    }
  };

  useEffect(() => {
    const activeProj =
      projects.find((p) => p.id === (selectedProjectId !== 'all' ? selectedProjectId : projects[0]?.id)) ||
      projects[0];
    const defaultUrl = activeProj?.base_url || 'http://localhost:3000';
    const initialProjectId =
      (suite?.projectId && projects.some((p) => p.id === suite.projectId))
        ? suite.projectId
        : (selectedProjectId !== 'all' && projects.some((p) => p.id === selectedProjectId))
        ? selectedProjectId
        : (projects[0]?.id || '');

    if (suite && suite.isNewWithDefaultType) {
      const initialType = suite.type || 'e2e';
      let defaultProject = 'chromium';
      let initialTargetUrl = defaultUrl;
      if (initialType === 'mobile') defaultProject = 'mobile-chrome';
      if (initialType === 'api') {
        defaultProject = 'api';
        initialTargetUrl = 'https://jsonplaceholder.typicode.com';
      }
      if (initialType === 'database') {
        defaultProject = 'database';
        initialTargetUrl = 'postgresql://qa_user:qa_password@localhost:5434/qa_dashboard';
      }
      const code = initialType === 'api'
        ? generateApiCodeFromSteps(apiSteps, initialTargetUrl)
        : initialType === 'database'
        ? generateDatabaseCodeFromSteps(databaseSteps, initialTargetUrl)
        : STARTER_TEMPLATES[initialType](initialTargetUrl);
      setFormData({
        name: initialType === 'api' ? 'REST API Endpoint Suite' : initialType === 'database' ? 'PostgreSQL Database Suite' : `New ${initialType.toUpperCase()} Test Suite`,
        type: initialType,
        project: defaultProject,
        projectId: initialProjectId,
        targetUrl: initialTargetUrl,
        description: `Automated test suite targeting ${initialType} verification.`,
        tags: `${initialType}, automated`,
        code: code,
        scheduleCron: '0 8 * * *',
        isScheduledEnabled: false,
        environmentProfile: 'default',
        workersCount: 1,
        retryCount: 1,
        testDataset: '',
      });
      syncCodeToVisualSteps(code, initialType);
      setActiveTab('nocode');
    } else if (suite) {
      const suiteCode = suite.code || STARTER_TEMPLATES[suite.type || 'e2e'](suite.targetUrl || defaultUrl);
      const suiteRetryCount = suite.retryCount !== undefined && suite.retryCount !== null
        ? Number(suite.retryCount)
        : 1;

      setFormData({
        name: suite.isDuplicate
          ? (suite.name || '')
          : suite.isTemplate
          ? `${suite.name} (Custom)`
          : (suite.name || ''),
        type: suite.type || 'e2e',
        project: suite.project || 'chromium',
        projectId: suite.projectId || initialProjectId,
        targetUrl: suite.targetUrl || defaultUrl,
        description: suite.description || '',
        tags: Array.isArray(suite.tags) ? suite.tags.join(', ') : '',
        code: suiteCode,
        scheduleCron: suite.scheduleCron || '0 8 * * *',
        isScheduledEnabled: !!suite.isScheduledEnabled,
        environmentProfile: suite.environmentProfile || 'default',
        workersCount: suite.workersCount || 1,
        retryCount: suiteRetryCount,
        testDataset: suite.testDataset ? (typeof suite.testDataset === 'string' ? suite.testDataset : JSON.stringify(suite.testDataset, null, 2)) : '',
      });
      syncCodeToVisualSteps(suiteCode, suite.type || 'e2e');
      setActiveTab('nocode');
    } else {
      const initialCode = generateCodeFromSteps(visualSteps, defaultUrl);
      setFormData({
        name: 'Login Verification Suite',
        type: 'e2e',
        project: 'chromium',
        projectId: initialProjectId,
        targetUrl: defaultUrl,
        description: 'Automated scenario validating authentication with visual verification.',
        tags: 'login, visual-builder, automated',
        code: initialCode,
        scheduleCron: '0 8 * * *',
        isScheduledEnabled: false,
        environmentProfile: 'default',
        workersCount: 1,
        retryCount: 1,
        testDataset: '',
      });
      syncCodeToVisualSteps(initialCode, 'e2e');
      setActiveTab('nocode');
    }
    setError(null);
    setCodegenStatus(null);
  }, [suite, isOpen, selectedProjectId, projects]);

  if (!isOpen) return null;

  // Add Step in Visual Builder (Web)
  const handleAddStep = (type) => {
    const newId = Date.now();
    let newStep = { id: newId, type, strategy: 'auto', target: '', value: '', label: '' };
    if (type === 'fill') {
      newStep.target = 'Email or #username';
      newStep.value = 'user@example.com';
    } else if (type === 'click') {
      newStep.target = 'Sign In';
    } else if (type === 'assert_url') {
      newStep.target = 'dashboard';
    } else if (type === 'assert_text') {
      newStep.target = 'Welcome back';
    } else if (type === 'select_option') {
      newStep.target = 'country';
      newStep.value = 'United States';
    } else if (type === 'upload_file') {
      newStep.target = 'avatar';
      newStep.value = 'tests/fixtures/sample.png';
    } else if (type === 'hover') {
      newStep.target = 'User Profile';
    } else if (type === 'check') {
      newStep.target = 'I agree to Terms';
    } else if (type === 'uncheck') {
      newStep.target = 'Newsletter';
    } else if (type === 'wait_for_selector') {
      newStep.target = '#success-notification';
    } else if (type === 'wait_for_response') {
      newStep.target = '/api/users';
    } else if (type === 'scroll_to') {
      newStep.target = '#footer-section';
    }

    const updated = [...visualSteps, newStep];
    setVisualSteps(updated);
    setFormData((prev) => ({
      ...prev,
      code: generateCodeFromSteps(updated, prev.targetUrl),
    }));
  };

  // Remove Step in Visual Builder (Web)
  const handleRemoveStep = (id) => {
    const updated = visualSteps.filter((s) => s.id !== id);
    setVisualSteps(updated);
    setFormData((prev) => ({
      ...prev,
      code: generateCodeFromSteps(updated, prev.targetUrl),
    }));
  };

  // Update Single Step (Web)
  const handleUpdateStep = (id, field, val) => {
    const updated = visualSteps.map((s) => (s.id === id ? { ...s, [field]: val } : s));
    setVisualSteps(updated);
    setFormData((prev) => ({
      ...prev,
      code: generateCodeFromSteps(updated, prev.targetUrl),
    }));
  };

  // Add Step in Visual API Request Builder
  const handleAddApiStep = (method = 'GET') => {
    const newId = Date.now();
    const newStep = {
      id: newId,
      method: method.toUpperCase(),
      path: method === 'POST' ? '/posts' : '/posts/1',
      expectedStatus: method === 'POST' ? 201 : 200,
      expectedKey: method === 'GET' ? 'id' : '',
      payload: ['POST', 'PUT', 'PATCH'].includes(method) ? '{\n  "title": "Automated QA Test",\n  "body": "Sample payload"\n}' : '',
      desc: '',
    };

    const updated = [...apiSteps, newStep];
    setApiSteps(updated);
    setFormData((prev) => ({
      ...prev,
      code: generateApiCodeFromSteps(updated, prev.targetUrl),
    }));
  };

  // Remove Step in Visual API Request Builder
  const handleRemoveApiStep = (id) => {
    const updated = apiSteps.filter((s) => s.id !== id);
    setApiSteps(updated);
    setFormData((prev) => ({
      ...prev,
      code: generateApiCodeFromSteps(updated, prev.targetUrl),
    }));
  };

  // Update Step in Visual API Request Builder
  const handleUpdateApiStep = (id, field, val) => {
    const updated = apiSteps.map((s) => (s.id === id ? { ...s, [field]: val } : s));
    setApiSteps(updated);
    setFormData((prev) => ({
      ...prev,
      code: generateApiCodeFromSteps(updated, prev.targetUrl),
    }));
  };

  // Add Step in Visual Database Step Builder
  const handleAddDbStep = (type = 'ping') => {
    const newId = Date.now();
    const newStep = {
      id: newId,
      type,
      targetTable: type === 'table_exists' ? 'test_results' : type === 'row_count' ? 'test_suites' : '',
      query: type === 'custom_sql' ? 'SELECT 1 AS status' : '',
      expectedRows: '1',
      assertCol: type === 'ping' ? 'ping' : '',
      assertVal: type === 'ping' ? '1' : '',
      desc:
        type === 'ping'
          ? 'PostgreSQL connection ping & database name check'
          : type === 'table_exists'
          ? 'Verify table exists in public schema'
          : type === 'row_count'
          ? 'Verify row count threshold on table'
          : 'Custom SQL query execution & assertion',
    };

    const updated = [...databaseSteps, newStep];
    setDatabaseSteps(updated);
    setFormData((prev) => ({
      ...prev,
      code: generateDatabaseCodeFromSteps(updated, prev.targetUrl),
    }));
  };

  // Remove Step in Visual Database Step Builder
  const handleRemoveDbStep = (id) => {
    const updated = databaseSteps.filter((s) => s.id !== id);
    setDatabaseSteps(updated);
    setFormData((prev) => ({
      ...prev,
      code: generateDatabaseCodeFromSteps(updated, prev.targetUrl),
    }));
  };

  // Update Step in Visual Database Step Builder
  const handleUpdateDbStep = (id, field, val) => {
    const updated = databaseSteps.map((s) => (s.id === id ? { ...s, [field]: val } : s));
    setDatabaseSteps(updated);
    setFormData((prev) => ({
      ...prev,
      code: generateDatabaseCodeFromSteps(updated, prev.targetUrl),
    }));
  };

  // Move Step Up/Down in Visual Web Builder
  const handleMoveStep = (idx, direction) => {
    const updated = [...visualSteps];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= updated.length) return;
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    setVisualSteps(updated);
    setFormData((prev) => ({
      ...prev,
      code: generateCodeFromSteps(updated, prev.targetUrl),
    }));
  };

  // Move Step Up/Down in Visual API Builder
  const handleMoveApiStep = (idx, direction) => {
    const updated = [...apiSteps];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= updated.length) return;
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    setApiSteps(updated);
    setFormData((prev) => ({
      ...prev,
      code: generateApiCodeFromSteps(updated, prev.targetUrl),
    }));
  };

  // Move Step Up/Down in Visual Database Builder
  const handleMoveDbStep = (idx, direction) => {
    const updated = [...databaseSteps];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= updated.length) return;
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    setDatabaseSteps(updated);
    setFormData((prev) => ({
      ...prev,
      code: generateDatabaseCodeFromSteps(updated, prev.targetUrl),
    }));
  };

  // Select Scenario Preset
  const handleSelectPreset = (preset) => {
    const code = preset.generate(formData.targetUrl || preset.targetUrl);
    setFormData((prev) => ({
      ...prev,
      name: preset.name,
      description: preset.desc,
      targetUrl: preset.targetUrl || prev.targetUrl,
      code,
    }));
    setActiveTab('code');
  };

  // Launch Playwright CodeGen
  const handleLaunchCodegen = async () => {
    setCodegenStatus('launching');
    try {
      const res = await fetch('/api/suites/codegen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formData.targetUrl || 'http://localhost:5175/login' }),
      });
      const data = await res.json();
      if (res.ok) {
        setCodegenStatus('success');
      } else {
        setCodegenStatus('error');
        setError(data.error || 'Failed to launch Playwright CodeGen');
      }
    } catch (err) {
      setCodegenStatus('error');
      setError(err.message || 'Failed to connect to backend server');
    }
  };

  const handleTypeChange = (newType) => {
    let defaultProject = 'chromium';
    let defaultUrl = formData.targetUrl;

    if (newType === 'mobile') {
      defaultProject = 'mobile-chrome';
    } else if (newType === 'api') {
      defaultProject = 'api';
      if (!defaultUrl || defaultUrl.includes('localhost:5175') || defaultUrl.includes('example.com') || defaultUrl.includes('postgresql:')) {
        defaultUrl = 'https://jsonplaceholder.typicode.com';
      }
    } else if (newType === 'database') {
      defaultProject = 'database';
      defaultUrl = 'postgresql://qa_user:qa_password@localhost:5434/qa_dashboard';
    } else {
      defaultProject = 'chromium';
      if (defaultUrl.includes('jsonplaceholder') || defaultUrl.includes('postgresql:')) {
        const activeProj = projects.find((p) => p.id === formData.projectId) || projects[0];
        defaultUrl = activeProj?.base_url || 'http://localhost:5175/login';
      }
    }

    let newCode = '';
    if (newType === 'api') {
      newCode = generateApiCodeFromSteps(apiSteps, defaultUrl);
    } else if (newType === 'database') {
      newCode = generateDatabaseCodeFromSteps(databaseSteps, defaultUrl);
    } else if (newType === 'e2e' || newType === 'mobile') {
      newCode = generateCodeFromSteps(visualSteps, defaultUrl);
    } else {
      newCode = STARTER_TEMPLATES[newType](defaultUrl);
    }

    setFormData((prev) => ({
      ...prev,
      type: newType,
      project: defaultProject,
      targetUrl: defaultUrl,
      code: newCode,
    }));
  };

  const handleLoadTemplate = () => {
    const template = STARTER_TEMPLATES[formData.type](formData.targetUrl);
    setFormData((prev) => ({ ...prev, code: template }));
  };

  // Automatically injects Start (before-action) and End (after-action) screenshot hooks into any Playwright script
  const handleAutoInjectScreenshots = () => {
    let currentCode = formData.code || '';
    if (!currentCode.trim()) return;

    // 1. Ensure testInfo is present in test function signature
    if (!currentCode.includes('testInfo')) {
      currentCode = currentCode.replace(
        /async\s*\(\s*\{\s*page\s*\}\s*\)/g,
        'async ({ page }, testInfo)'
      );
    }

    // 2. Insert start screenshot right after the first goto if not already present
    if (!currentCode.includes('before-action')) {
      const gotoMatch = currentCode.match(/await\s+page\.goto\([^)]+\);?/);
      if (gotoMatch) {
        const insertIndex = gotoMatch.index + gotoMatch[0].length;
        const startSnippet = `\n\n    // 1. Capture Start Screenshot (Initial State)\n    const beforeShot = testInfo.outputPath('before-action.png');\n    await page.screenshot({ path: beforeShot, fullPage: true });\n    await testInfo.attach('before-action', { path: beforeShot, contentType: 'image/png' });`;
        currentCode = currentCode.slice(0, insertIndex) + startSnippet + currentCode.slice(insertIndex);
      }
    }

    // 3. Insert end screenshot right before the last closing brace if not already present
    if (!currentCode.includes('after-action')) {
      const lastBraceIndex = currentCode.lastIndexOf('});');
      if (lastBraceIndex !== -1) {
        const endSnippet = `\n    // 2. Capture End Screenshot (Completion State)\n    const afterShot = testInfo.outputPath('after-action.png');\n    await page.screenshot({ path: afterShot, fullPage: true });\n    await testInfo.attach('after-action', { path: afterShot, contentType: 'image/png' });\n  `;
        currentCode = currentCode.slice(0, lastBraceIndex) + endSnippet + currentCode.slice(lastBraceIndex);
      }
    }

    setFormData((prev) => ({ ...prev, code: currentCode }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Suite Name is required');
      return;
    }

    if (!formData.code.trim()) {
      setError('Test code cannot be empty');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      type: formData.type,
      project: formData.project,
      projectId: formData.projectId && formData.projectId !== 'all' ? formData.projectId : null,
      targetUrl: formData.targetUrl.trim(),
      description: formData.description.trim(),
      tags: formData.tags
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean),
      code: formData.code,
      scheduleCron: formData.scheduleCron ? formData.scheduleCron.trim() : null,
      isScheduledEnabled: !!formData.isScheduledEnabled,
      environmentProfile: formData.environmentProfile || 'default',
      workersCount: Number(formData.workersCount) || 1,
      retryCount: Number(formData.retryCount) || 0,
      testDataset: formData.testDataset
        ? (() => {
            try {
              return JSON.parse(formData.testDataset);
            } catch (e) {
              return null;
            }
          })()
        : null,
    };

    setIsSubmitting(true);
    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save test suite');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  {suite?.isDuplicate
                    ? 'Duplicate Test Suite'
                    : suite?.isTemplate
                    ? 'Create Suite from Template'
                    : suite
                    ? 'Edit Test Suite'
                    : 'Create Automated Test Suite'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  No-Code Enabled
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Choose between Visual Step Builder (No-Code), Scenario Presets, or Direct Code Editor
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 transition shadow-2xs cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            type="button"
            onClick={() => {
              if (formData.code) {
                syncCodeToVisualSteps(formData.code, formData.type);
              }
              setActiveTab('nocode');
            }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'nocode'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wand2 className="w-4 h-4 text-indigo-600" />
            <span>1. Visual Step Builder (No-Code)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'presets'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>2. 1-Click Scenario Presets</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'code'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code className="w-4 h-4 text-slate-600" />
            <span>3. Playwright Code Script</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'schedule'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4 text-blue-600" />
            <span>4. Execution & Schedule</span>
            {formData.isScheduledEnabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Schedule active"></span>
            )}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Suite Type & Target Engine
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'e2e', label: 'Desktop Web', icon: Monitor, color: 'text-indigo-600', desc: 'Chromium / Desktop UI' },
                { id: 'mobile', label: 'Mobile Web', icon: Smartphone, color: 'text-purple-600', desc: 'Mobile Viewport / Touch' },
                { id: 'api', label: 'API Request', icon: Webhook, color: 'text-emerald-600', desc: 'REST / GraphQL Endpoints' },
                { id: 'database', label: 'Database Testing', icon: Database, color: 'text-amber-600', desc: 'PostgreSQL Direct Queries' },
              ].map((cat) => {
                const isSelected = formData.type === cat.id;
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleTypeChange(cat.id)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white shadow-2xs' : 'bg-slate-100'}`}>
                        <IconComponent className={`w-4 h-4 ${cat.color}`} />
                      </div>
                      <span className={`text-xs font-bold ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
                        {cat.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 font-medium">
                      {cat.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contextual Engine Banner */}
          {formData.type === 'api' ? (
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-white border border-emerald-200 text-emerald-600 shadow-2xs">
                  <Webhook className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950 flex items-center space-x-1.5">
                    <span>Playwright API Request Testing (Headless HTTP Engine)</span>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-200/70 text-emerald-900 font-semibold">
                      project: 'api'
                    </span>
                  </h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Direct HTTP execution via Playwright's built-in <code className="font-mono bg-white/80 px-1 py-0.5 rounded">request</code> fixture. Tests REST & GraphQL APIs with ultra-fast millisecond assertions without browser overhead.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition flex-shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Explore 1-Click API Presets</span>
              </button>
            </div>
          ) : formData.type === 'database' ? (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-white border border-amber-200 text-amber-600 shadow-2xs">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-950 flex items-center space-x-1.5">
                    <span>Direct Database Verification Engine (PostgreSQL)</span>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-amber-200/70 text-amber-900 font-semibold">
                      project: 'database'
                    </span>
                  </h4>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Executes SQL queries against PostgreSQL directly using <code className="font-mono bg-white/80 px-1 py-0.5 rounded">pg.Pool</code>. Validates schema tables, columns, transaction isolation, and query latency with zero browser overhead.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition flex-shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Explore 1-Click DB Presets</span>
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 border border-indigo-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-white border border-indigo-200 text-indigo-600 shadow-2xs">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-indigo-950 flex items-center space-x-1.5">
                    <span>Record Browser Actions (Playwright CodeGen)</span>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-indigo-200/70 text-indigo-900 font-semibold">
                      Auto-Recorder
                    </span>
                  </h4>
                  <p className="text-[11px] text-indigo-700 mt-0.5">
                    Click below to open a browser where you can click & type. Playwright records every action for you!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLaunchCodegen}
                disabled={codegenStatus === 'launching'}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition flex-shrink-0 cursor-pointer disabled:cursor-not-allowed"
              >
                {codegenStatus === 'launching' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Launching Browser...</span>
                  </>
                ) : (
                  <>
                    <Video className="w-3.5 h-3.5" />
                    <span>Launch Recorder</span>
                  </>
                )}
              </button>
            </div>
          )}

          {codegenStatus === 'success' && (formData.type === 'e2e' || formData.type === 'mobile') && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold">Chromium Browser & Playwright Inspector Launched!</div>
                <div className="text-emerald-700 text-[11px] leading-relaxed">
                  1. Click and type in the newly opened browser window to perform your test.
                  <br />
                  2. In the Playwright Inspector window, click the Copy button at the top.
                  <br />
                  3. Switch to the "3. Playwright Code Script" tab above and paste your code.
                </div>
              </div>
            </div>
          )}

          {/* Basic Suite Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Suite Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={formData.type === 'api' ? 'e.g. User REST API Suite' : 'e.g. Login Verification Suite'}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Target Project / Workspace</span>
                {formData.projectId && (
                  <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                    Linked to: {projects.find((p) => p.id === formData.projectId)?.name || formData.projectId}
                  </span>
                )}
              </label>
              <select
                value={formData.projectId || ''}
                onChange={(e) => {
                  const pid = e.target.value;
                  const proj = projects.find((p) => p.id === pid);
                  const newUrl = proj?.base_url || formData.targetUrl;
                  setFormData((prev) => ({
                    ...prev,
                    projectId: pid,
                    targetUrl: newUrl,
                    code: prev.type === 'api'
                      ? generateApiCodeFromSteps(apiSteps, newUrl)
                      : prev.type === 'database'
                      ? generateDatabaseCodeFromSteps(databaseSteps, newUrl)
                      : generateCodeFromSteps(visualSteps, newUrl),
                  }));
                }}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm font-medium"
              >
                <option value="">-- No Project (Global Suite) --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {formData.type === 'api'
                  ? 'API Base URL / Endpoint'
                  : formData.type === 'database'
                  ? 'Database Connection String'
                  : 'Target Web URL'}
                <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={formData.targetUrl}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, targetUrl: val });
                  setFormData((prev) => ({
                    ...prev,
                    code: prev.type === 'api'
                      ? generateApiCodeFromSteps(apiSteps, val)
                      : prev.type === 'database'
                      ? generateDatabaseCodeFromSteps(databaseSteps, val)
                      : generateCodeFromSteps(visualSteps, val),
                  }));
                }}
                placeholder={
                  formData.type === 'api'
                    ? 'https://jsonplaceholder.typicode.com'
                    : formData.type === 'database'
                    ? 'postgresql://qa_user:qa_password@localhost:5434/qa_dashboard'
                    : 'http://localhost:5175/login'
                }
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm font-mono"
              />
            </div>
          </div>

          {/* TAB 1: VISUAL STEP BUILDER (NO-CODE) - API REQUESTS */}
          {activeTab === 'nocode' && formData.type === 'api' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 border-b border-slate-200 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                      <Webhook className="w-4 h-4 text-emerald-600" />
                      <span>Visual API Request Steps (No-Code HTTP Builder)</span>
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Synced from Tab 3 Code
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Define REST endpoints, HTTP methods, expected status codes, and JSON response assertions.
                  </p>
                </div>

                {/* Add API Step Buttons */}
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                  <button
                    type="button"
                    onClick={() => syncCodeToVisualSteps(formData.code, formData.type)}
                    className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
                    title="Parse code in Tab 3 and update visual API steps"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Re-sync from Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddApiStep('GET')}
                    className="px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center space-x-1 transition border border-blue-200 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ GET</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddApiStep('POST')}
                    className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center space-x-1 transition border border-emerald-200 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ POST</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddApiStep('PUT')}
                    className="px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold flex items-center space-x-1 transition border border-amber-200 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ PUT</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddApiStep('DELETE')}
                    className="px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center space-x-1 transition border border-rose-200 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ DELETE</span>
                  </button>
                </div>
              </div>

              {/* API Steps List */}
              <div className="space-y-3">
                {apiSteps.map((step, idx) => (
                  <div
                    key={step.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition shadow-2xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>

                        {/* HTTP Method Selector */}
                        <select
                          value={step.method}
                          onChange={(e) => handleUpdateApiStep(step.id, 'method', e.target.value)}
                          className={`px-2 py-1 rounded-lg text-xs font-bold border focus:outline-none cursor-pointer ${
                            step.method === 'GET'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : step.method === 'POST'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : step.method === 'PUT'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                          <option value="PUT">PUT</option>
                          <option value="DELETE">DELETE</option>
                          <option value="PATCH">PATCH</option>
                        </select>

                        {/* Endpoint Path Input */}
                        <div className="flex-1 min-w-[200px]">
                          <input
                            type="text"
                            value={step.path}
                            onChange={(e) => handleUpdateApiStep(step.id, 'path', e.target.value)}
                            placeholder="/posts or /api/users"
                            className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Reorder API Step */}
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleMoveApiStep(idx, 'up')}
                            disabled={idx === 0}
                            className="p-0.5 rounded text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer"
                            title="Move step up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveApiStep(idx, 'down')}
                            disabled={idx === apiSteps.length - 1}
                            className="p-0.5 rounded text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer"
                            title="Move step down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Expected Status Code */}
                        <div className="flex items-center space-x-1">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">Status:</span>
                          <input
                            type="number"
                            value={step.expectedStatus}
                            onChange={(e) => handleUpdateApiStep(step.id, 'expectedStatus', e.target.value)}
                            placeholder="200"
                            className="w-16 px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-center font-bold"
                          />
                        </div>

                        {/* Expected Key in JSON Response */}
                        <div className="flex items-center space-x-1">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">Assert Key:</span>
                          <input
                            type="text"
                            value={step.expectedKey}
                            onChange={(e) => handleUpdateApiStep(step.id, 'expectedKey', e.target.value)}
                            placeholder="e.g. id, title"
                            className="w-24 px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveApiStep(step.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Remove API Step"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Step Description & JSON Payload */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-medium mb-1">
                          Step Description
                        </label>
                        <input
                          type="text"
                          value={step.desc || ''}
                          onChange={(e) => handleUpdateApiStep(step.id, 'desc', e.target.value)}
                          placeholder="e.g. Fetch single post and assert 200 OK"
                          className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      {['POST', 'PUT', 'PATCH'].includes(step.method) && (
                        <div>
                          <label className="block text-[10px] text-slate-500 font-medium mb-1">
                            Request Body JSON Payload
                          </label>
                          <textarea
                            rows={3}
                            value={step.payload || ''}
                            onChange={(e) => handleUpdateApiStep(step.id, 'payload', e.target.value)}
                            placeholder={'{\n  "title": "Post Title"\n}'}
                            className="w-full px-2.5 py-1 text-xs bg-slate-900 text-emerald-300 font-mono rounded-lg focus:outline-none border border-slate-700"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* API Testing Info Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-slate-50 border border-emerald-200/80 space-y-2 text-xs text-slate-700 shadow-2xs">
                <div className="font-bold text-emerald-950 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>How Playwright API Testing Works:</span>
                </div>
                <div className="text-[11px] text-slate-600 leading-relaxed grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs">
                    <strong className="text-slate-900 block font-semibold">1. HTTP Methods</strong>
                    <span className="text-slate-500">
                      Supports GET, POST, PUT, DELETE, and PATCH with custom URL query params and headers.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs">
                    <strong className="text-slate-900 block font-semibold">2. Status & JSON Assertions</strong>
                    <span className="text-slate-500">
                      Asserts response HTTP status codes (200, 201, 404) and parses JSON responses to check keys.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs">
                    <strong className="text-slate-900 block font-semibold">3. Ultra-Fast Execution</strong>
                    <span className="text-slate-500">
                      Runs headlessly via the Playwright <code>{`{ request }`}</code> fixture without loading browser DOM.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: VISUAL STEP BUILDER (NO-CODE) - DATABASE */}
          {activeTab === 'nocode' && formData.type === 'database' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 border-b border-slate-200 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                      <Database className="w-4 h-4 text-amber-600" />
                      <span>Visual Database Verification Steps (No-Code SQL Builder)</span>
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      Synced from Tab 3 Code
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Configure direct PostgreSQL queries, table existence checks, row count thresholds, and schema assertions.
                  </p>
                </div>

                {/* Add Database Step Buttons */}
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                  <button
                    type="button"
                    onClick={() => syncCodeToVisualSteps(formData.code, formData.type)}
                    className="px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
                    title="Parse code in Tab 3 and update visual database steps"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Re-sync from Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddDbStep('ping')}
                    className="px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center space-x-1 transition border border-blue-200 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Ping Engine</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddDbStep('table_exists')}
                    className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center space-x-1 transition border border-emerald-200 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Table Exists</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddDbStep('row_count')}
                    className="px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold flex items-center space-x-1 transition border border-amber-200 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Row Count</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddDbStep('custom_sql')}
                    className="px-2.5 py-1 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold flex items-center space-x-1 transition border border-purple-200 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Custom SQL</span>
                  </button>
                </div>
              </div>

              {/* Database Steps List */}
              <div className="space-y-3">
                {databaseSteps.map((step, idx) => (
                  <div
                    key={step.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-amber-300 transition shadow-2xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>

                        {/* Step Type Selector */}
                        <select
                          value={step.type}
                          onChange={(e) => handleUpdateDbStep(step.id, 'type', e.target.value)}
                          className={`px-2 py-1 rounded-lg text-xs font-bold border focus:outline-none cursor-pointer ${
                            step.type === 'ping'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : step.type === 'table_exists'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : step.type === 'row_count'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}
                        >
                          <option value="ping">Ping / Health</option>
                          <option value="table_exists">Table Exists</option>
                          <option value="row_count">Row Count</option>
                          <option value="custom_sql">Custom SQL</option>
                        </select>

                        {/* Target Table or SQL Query */}
                        {step.type === 'table_exists' || step.type === 'row_count' ? (
                          <div className="flex-1 min-w-[200px]">
                            <input
                              type="text"
                              value={step.targetTable}
                              onChange={(e) => handleUpdateDbStep(step.id, 'targetTable', e.target.value)}
                              placeholder="Table name (e.g. test_suites, test_runs)"
                              className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                            />
                          </div>
                        ) : step.type === 'custom_sql' ? (
                          <div className="flex-1 min-w-[200px]">
                            <input
                              type="text"
                              value={step.query || ''}
                              onChange={(e) => handleUpdateDbStep(step.id, 'query', e.target.value)}
                              placeholder="SELECT status FROM test_runs LIMIT 1"
                              className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                            />
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 italic px-2">
                            SELECT 1 AS ping, current_database() AS db_name
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {step.type === 'row_count' && (
                          <div className="flex items-center space-x-1">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">Min Rows:</span>
                            <input
                              type="number"
                              value={step.expectedRows}
                              onChange={(e) => handleUpdateDbStep(step.id, 'expectedRows', e.target.value)}
                              placeholder="0"
                              className="w-16 px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono text-center font-bold"
                            />
                          </div>
                        )}

                        {step.type === 'custom_sql' && (
                          <>
                            <div className="flex items-center space-x-1">
                              <span className="text-[10px] text-slate-400 font-semibold uppercase">Col:</span>
                              <input
                                type="text"
                                value={step.assertCol || ''}
                                onChange={(e) => handleUpdateDbStep(step.id, 'assertCol', e.target.value)}
                                placeholder="col_name"
                                className="w-20 px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                              />
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-[10px] text-slate-400 font-semibold uppercase">Val:</span>
                              <input
                                type="text"
                                value={step.assertVal || ''}
                                onChange={(e) => handleUpdateDbStep(step.id, 'assertVal', e.target.value)}
                                placeholder="val"
                                className="w-20 px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                              />
                            </div>
                          </>
                        )}

                        {/* Reorder DB Step */}
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleMoveDbStep(idx, 'up')}
                            disabled={idx === 0}
                            className="p-0.5 rounded text-slate-300 hover:text-amber-600 hover:bg-amber-50 disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer"
                            title="Move step up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveDbStep(idx, 'down')}
                            disabled={idx === databaseSteps.length - 1}
                            className="p-0.5 rounded text-slate-300 hover:text-amber-600 hover:bg-amber-50 disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer"
                            title="Move step down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveDbStep(step.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Remove Step"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <label className="block text-[10px] text-slate-500 font-medium mb-1">
                        Step Description
                      </label>
                      <input
                        type="text"
                        value={step.desc || ''}
                        onChange={(e) => handleUpdateDbStep(step.id, 'desc', e.target.value)}
                        placeholder="e.g. Verify core table test_suites exists in public schema"
                        className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Database Guide Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-slate-50 border border-amber-200/80 space-y-2 text-xs text-slate-700 shadow-2xs">
                <div className="font-bold text-amber-950 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>How Playwright Database Testing Works:</span>
                </div>
                <div className="text-[11px] text-slate-600 leading-relaxed grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs">
                    <strong className="text-slate-900 block font-semibold">1. Direct Connection</strong>
                    <span className="text-slate-500">
                      Connects directly to PostgreSQL via <code>pg.Pool</code> without browser or REST overhead.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs">
                    <strong className="text-slate-900 block font-semibold">2. Schema & Integrity</strong>
                    <span className="text-slate-500">
                      Asserts table presence, column nullability, and foreign key constraint violations.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs">
                    <strong className="text-slate-900 block font-semibold">3. Zero-Pollution ACID</strong>
                    <span className="text-slate-500">
                      Executes transactional tests with <code>BEGIN ... ROLLBACK</code> to keep testing environments clean.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: VISUAL STEP BUILDER (NO-CODE) - WEB UI */}
          {activeTab === 'nocode' && (formData.type === 'e2e' || formData.type === 'mobile') && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                      <Wand2 className="w-4 h-4 text-indigo-600" />
                      <span>Visual Scenario Steps (No Coding Required)</span>
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Synced from Tab 3 Code
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Configure actions by filling inputs, clicking buttons, and asserting expected results.
                  </p>
                </div>

                {/* Add Step Buttons */}
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                  <button
                    type="button"
                    onClick={() => syncCodeToVisualSteps(formData.code, formData.type)}
                    className="px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
                    title="Parse code in Tab 3 and update these visual steps"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Re-sync from Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddStep('fill')}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1 transition border border-slate-200 cursor-pointer"
                  >
                    <Type className="w-3 h-3 text-blue-600" />
                    <span>+ Fill</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddStep('click')}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1 transition border border-slate-200 cursor-pointer"
                  >
                    <MousePointer className="w-3 h-3 text-emerald-600" />
                    <span>+ Click</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddStep('select_option')}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1 transition border border-slate-200 cursor-pointer"
                  >
                    <Sliders className="w-3 h-3 text-cyan-600" />
                    <span>+ Select</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddStep('check')}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1 transition border border-slate-200 cursor-pointer"
                  >
                    <CheckSquare className="w-3 h-3 text-teal-600" />
                    <span>+ Check</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddStep('hover')}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1 transition border border-slate-200 cursor-pointer"
                  >
                    <Eye className="w-3 h-3 text-indigo-600" />
                    <span>+ Hover</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddStep('upload_file')}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1 transition border border-slate-200 cursor-pointer"
                  >
                    <Upload className="w-3 h-3 text-orange-600" />
                    <span>+ Upload</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddStep('wait_for_selector')}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1 transition border border-slate-200 cursor-pointer"
                  >
                    <Clock className="w-3 h-3 text-purple-600" />
                    <span>+ Wait</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddStep('assert_url')}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1 transition border border-slate-200 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3 h-3 text-purple-600" />
                    <span>+ URL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddStep('assert_text')}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1 transition border border-slate-200 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3 h-3 text-amber-600" />
                    <span>+ Text</span>
                  </button>
                </div>
              </div>

              {/* Steps List */}
              <div className="space-y-2.5">
                {visualSteps.map((step, idx) => (
                  <div
                    key={step.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs hover:border-indigo-300 transition"
                  >
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 flex-1 w-full sm:w-auto">
                      {/* Grip + reorder buttons */}
                      <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveStep(idx, 'up')}
                          disabled={idx === 0}
                          className="p-0.5 rounded text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer"
                          title="Move step up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <GripVertical className="w-3.5 h-3.5 text-slate-300" />
                        <button
                          type="button"
                          onClick={() => handleMoveStep(idx, 'down')}
                          disabled={idx === visualSteps.length - 1}
                          className="p-0.5 rounded text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer"
                          title="Move step down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold font-mono text-xs flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>

                      {/* Step Type Badge */}
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 text-slate-700 flex-shrink-0">
                        {step.type === 'fill' && 'Fill Input'}
                        {step.type === 'click' && 'Click Button'}
                        {step.type === 'select_option' && 'Select Dropdown'}
                        {step.type === 'check' && 'Check Box/Radio'}
                        {step.type === 'uncheck' && 'Uncheck Box'}
                        {step.type === 'hover' && 'Mouse Hover'}
                        {step.type === 'upload_file' && 'Upload File'}
                        {step.type === 'wait_for_selector' && 'Wait for Element'}
                        {step.type === 'wait_for_response' && 'Wait for API'}
                        {step.type === 'scroll_to' && 'Scroll to View'}
                        {step.type === 'assert_url' && 'Assert URL'}
                        {step.type === 'assert_text' && 'Assert Text'}
                      </span>

                      {/* Locator Strategy Selector for Inputs */}
                      {step.type === 'fill' && (
                        <select
                          value={step.strategy || 'auto'}
                          onChange={(e) => handleUpdateStep(step.id, 'strategy', e.target.value)}
                          className="px-2 py-1 text-[11px] bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs flex-shrink-0"
                          title="Choose how Playwright finds this input on the page"
                        >
                          <option value="auto">Auto (Smart Match)</option>
                          <option value="label">By Label Text</option>
                          <option value="placeholder">By Placeholder</option>
                          <option value="css">By CSS / ID / Name</option>
                          <option value="testid">By data-testid</option>
                        </select>
                      )}

                      {/* Locator Strategy Selector for Clicks */}
                      {step.type === 'click' && (
                        <select
                          value={step.strategy || 'auto'}
                          onChange={(e) => handleUpdateStep(step.id, 'strategy', e.target.value)}
                          className="px-2 py-1 text-[11px] bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs flex-shrink-0"
                          title="Choose how Playwright finds this button/link"
                        >
                          <option value="auto">Button / Link Name</option>
                          <option value="css">By CSS / ID (#btn)</option>
                          <option value="testid">By data-testid</option>
                        </select>
                      )}

                      {/* Step Target & Value Inputs */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                        <input
                          type="text"
                          value={step.target}
                          onChange={(e) => handleUpdateStep(step.id, 'target', e.target.value)}
                          placeholder={
                            step.type === 'fill'
                              ? step.strategy === 'label'
                                ? 'Label text (e.g. Email Address)'
                                : step.strategy === 'placeholder'
                                ? 'Placeholder (e.g. name@hrmn.local)'
                                : step.strategy === 'css'
                                ? 'CSS or Name (e.g. #email, [name="email"])'
                                : step.strategy === 'testid'
                                ? 'data-testid value (e.g. user-email)'
                                : 'Label, placeholder, or name (e.g. Email)'
                              : step.type === 'click'
                              ? step.strategy === 'css'
                                ? 'CSS/ID (e.g. #submit-btn or .btn-login)'
                                : step.strategy === 'testid'
                                ? 'data-testid value (e.g. submit-button)'
                                : 'Button text (e.g. Sign In)'
                              : step.type === 'select_option'
                              ? 'Dropdown label, name, or #id'
                              : step.type === 'upload_file'
                              ? 'File input (e.g. input[type="file"])'
                              : step.type === 'hover'
                              ? 'Element selector or text'
                              : step.type === 'check' || step.type === 'uncheck'
                              ? 'Checkbox label or selector'
                              : step.type === 'wait_for_selector'
                              ? 'Selector to wait for (e.g. #modal)'
                              : step.type === 'assert_url'
                              ? 'URL contains (e.g. dashboard)'
                              : 'Field, button, or text (e.g. Branch, Search, + Create)'
                          }
                          className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                        />

                        {['fill', 'select_option', 'upload_file', 'assert_text'].includes(step.type) && (
                          <input
                            type="text"
                            value={step.value}
                            onChange={(e) => handleUpdateStep(step.id, 'value', e.target.value)}
                            placeholder={
                              step.type === 'fill'
                                ? 'Value to type (e.g. admin@hrmn.local)'
                                : step.type === 'select_option'
                                ? 'Option value or label to select'
                                : step.type === 'upload_file'
                                ? 'Path to file (e.g. tests/fixtures/doc.pdf)'
                                : 'Expected value (optional, e.g. All)'
                            }
                            className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                          />
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveStep(step.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer self-end sm:self-center"
                      title="Remove Step"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>


              {/* Helpful Guide on Locating Inputs Without Placeholders */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-slate-50 border border-indigo-200/80 space-y-2 text-xs text-slate-700 shadow-2xs">
                <div className="font-bold text-indigo-950 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>How to locate inputs when there is NO placeholder:</span>
                </div>
                <div className="text-[11px] text-slate-600 leading-relaxed grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs">
                    <strong className="text-slate-900 block font-semibold">1. By Label Text</strong>
                    <span className="text-slate-500">
                      Select <strong>By Label Text</strong> and type the visible label on the page (e.g. <code>Email</code>, <code>Password</code>, or <code>Username</code>).
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs">
                    <strong className="text-slate-900 block font-semibold">2. By CSS / ID / Name</strong>
                    <span className="text-slate-500">
                      Select <strong>By CSS / ID / Name</strong> and enter the input ID or name (e.g. <code>#email</code>, <code>[name="user"]</code>, or <code>input[type="email"]</code>).
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs">
                    <strong className="text-slate-900 block font-semibold">3. Auto (Smart Match)</strong>
                    <span className="text-slate-500">
                      Keep <strong>Auto (Smart Match)</strong>. Playwright will automatically check label, placeholder, ID, and name attributes for you!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 1-CLICK SCENARIO PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>
                    {formData.type === 'api'
                      ? 'Choose a Pre-built API Test Scenario'
                      : formData.type === 'database'
                      ? 'Choose a Pre-built Database Test Scenario'
                      : 'Choose a Pre-built Test Scenario'}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Select any scenario below to immediately load a verified, production-ready test suite.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(formData.type === 'api' ? API_PRESETS : formData.type === 'database' ? DATABASE_PRESETS : SCENARIO_PRESETS).map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-500 hover:bg-indigo-50/20 transition cursor-pointer group shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition">
                          {preset.name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-700">
                          1-Click Load
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {preset.desc}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span className="truncate max-w-[280px]">Target: {preset.targetUrl}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DIRECT PLAYWRIGHT CODE SCRIPT */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                  <Code className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Playwright Test Script (.spec.ts)</span>
                </label>
                <div className="flex items-center space-x-2">
                  {formData.type === 'api' ? (
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md font-medium flex items-center space-x-1 shadow-2xs">
                      <Webhook className="w-3 h-3 text-emerald-600" />
                      <span>Headless API Runner ({`{ request }`})</span>
                    </span>
                  ) : formData.type === 'database' ? (
                    <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md font-medium flex items-center space-x-1 shadow-2xs">
                      <Database className="w-3 h-3 text-amber-600" />
                      <span>PostgreSQL Client (pg.Pool)</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAutoInjectScreenshots}
                      title="Automatically wrap script with start and end screenshot capture for audit logs"
                      className="px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-2xs"
                    >
                      <Camera className="w-3 h-3 text-indigo-600" />
                      <span>Auto-Add Start & End Screenshots</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      syncCodeToVisualSteps(formData.code, formData.type);
                      setActiveTab('nocode');
                    }}
                    title="Parse current Playwright code and reflect steps in Visual Step Builder"
                    className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <Wand2 className="w-3 h-3 text-white" />
                    <span>Sync to Visual Builder (Tab 1)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadTemplate}
                    className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center space-x-1.5 font-semibold transition cursor-pointer px-2 py-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
              <div className="rounded-xl border border-slate-300 overflow-hidden shadow-2xs">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 text-[11px] font-mono text-slate-600 flex items-center justify-between">
                  <span>TypeScript / Playwright Test</span>
                  <span className="text-slate-500">
                    {formData.type === 'api'
                      ? 'Headless API request fixture ({ request })'
                      : formData.type === 'database'
                      ? 'Direct PostgreSQL client'
                      : 'Auto Before & After screenshot hooks enabled'}
                  </span>
                </div>
                <textarea
                  rows={13}
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full p-4 bg-[#0f172a] text-slate-100 font-mono text-xs focus:outline-none leading-relaxed"
                  spellCheck={false}
                />
              </div>
            </div>
          )}

          {/* TAB 4: EXECUTION & SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              {/* 1. Automated Scheduling (Cron) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Automated Scheduled Execution (Cron Triggers)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Trigger this test suite on a recurring timetable via the background runner service.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isScheduledEnabled}
                      onChange={(e) => setFormData({ ...formData, isScheduledEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-2.5 text-xs font-semibold text-slate-700">
                      {formData.isScheduledEnabled ? 'Active' : 'Disabled'}
                    </span>
                  </label>
                </div>

                {formData.isScheduledEnabled && (
                  <div className="space-y-3 pt-1">
                    {/* Quick Presets */}
                    <div>
                      <span className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                        Schedule Presets (1-Click):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: 'Every 15 Minutes', cron: '*/15 * * * *' },
                          { label: 'Every Hour', cron: '0 * * * *' },
                          { label: 'Daily at 08:00 AM', cron: '0 8 * * *' },
                          { label: 'Daily at Midnight', cron: '0 0 * * *' },
                          { label: 'Monday 09:00 AM', cron: '0 9 * * 1' },
                        ].map((pr) => (
                          <button
                            key={pr.cron}
                            type="button"
                            onClick={() => setFormData({ ...formData, scheduleCron: pr.cron })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                              formData.scheduleCron === pr.cron
                                ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {pr.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Cron Expression <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.scheduleCron}
                          onChange={(e) => setFormData({ ...formData, scheduleCron: e.target.value })}
                          placeholder="e.g. 0 8 * * *"
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex flex-col justify-end">
                        <div className="text-[11px] p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
                          <strong>Format:</strong> <code>minute hour day month day-of-week</code>
                          <br />
                          <strong>Active Setting:</strong> {formData.scheduleCron || 'None'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Environment Profile & Variables */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
                <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Environment Profile & Target Override
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Execute this test suite against specific development, staging, or production environments.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'default', label: 'Default', desc: 'Use Project Target URL' },
                    { id: 'development', label: 'Development', desc: 'Local dev branch (localhost)' },
                    { id: 'staging', label: 'Staging / UAT', desc: 'Pre-release QA environment' },
                    { id: 'production', label: 'Production', desc: 'Live system verification' },
                  ].map((env) => (
                    <button
                      key={env.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, environmentProfile: env.id })}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        formData.environmentProfile === env.id
                          ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`text-xs font-bold ${formData.environmentProfile === env.id ? 'text-blue-900' : 'text-slate-800'}`}>
                        {env.label}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1 font-medium">
                        {env.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Parallel Execution & Auto-Retry Logic */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
                <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Parallel Execution & Auto-Retry on Failure
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Configure worker thread concurrency and automatic retry attempts for flaky test mitigation.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Concurrency Workers (--workers)</span>
                      <span className="font-mono text-blue-600 font-bold">{formData.workersCount} Worker(s)</span>
                    </label>
                    <select
                      value={formData.workersCount}
                      onChange={(e) => setFormData({ ...formData, workersCount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value={1}>1 Worker (Sequential - Safe)</option>
                      <option value={2}>2 Workers (Parallel - Fast)</option>
                      <option value={4}>4 Workers (Parallel - High Throughput)</option>
                      <option value={8}>8 Workers (Parallel - Enterprise)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Auto-Retry on Failure (--retries)</span>
                      <span className="font-mono text-amber-600 font-bold">{formData.retryCount} Attempt(s)</span>
                    </label>
                    <select
                      value={formData.retryCount}
                      onChange={(e) => setFormData({ ...formData, retryCount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value={0}>0 Retries (Fail fast)</option>
                      <option value={1}>1 Retry on Failure (Recommended)</option>
                      <option value={2}>2 Retries on Failure</option>
                      <option value={3}>3 Retries on Failure</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 4. Data-Driven Testing (Datasets) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Data-Driven Testing (JSON Dataset Parameterization)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Execute tests iteratively across multiple rows of test data.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const sample = [
                        { user: 'admin@hrmn.local', role: 'admin', expectedStatus: 200 },
                        { user: 'manager.tech@hrmn.local', role: 'manager', expectedStatus: 200 },
                        { user: 'staff@hrmn.local', role: 'employee', expectedStatus: 200 }
                      ];
                      setFormData({ ...formData, testDataset: JSON.stringify(sample, null, 2) });
                    }}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                  >
                    Insert Sample Dataset
                  </button>
                </div>

                <div>
                  <textarea
                    rows={4}
                    value={formData.testDataset}
                    onChange={(e) => setFormData({ ...formData, testDataset: e.target.value })}
                    placeholder={'[\n  { "username": "admin", "role": "admin" },\n  { "username": "guest", "role": "viewer" }\n]'}
                    className="w-full p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl focus:outline-none border border-slate-700"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Injected into Playwright runner via <code>process.env.PLAYWRIGHT_TEST_DATASET</code>.
                  </span>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 hidden sm:block">
            Supports non-code test building, record & playback, and TypeScript scripts.
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center space-x-1 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {suite && !suite.isTemplate && !suite.isDuplicate
                      ? 'Save Changes'
                      : suite?.isDuplicate
                      ? 'Duplicate & Save Suite'
                      : 'Create Suite'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
