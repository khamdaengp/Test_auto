# 🚀 All-in-One QA Automation Dashboard

An enterprise-ready, all-in-one QA Automation Dashboard system for automated test execution, live monitoring, test result analytics, and failure artifact management built with **React**, **Tailwind CSS**, **Node.js**, **PostgreSQL**, and **Playwright**.

---

## 📋 Table of Contents

- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Quick Start (1-Click)](#-quick-start-1-click)
- [Manual Setup & Installation](#-manual-setup--installation)
- [Database Guidelines & PostgreSQL Schema](#-database-guidelines--postgresql-schema)
- [Playwright Test Suites](#-playwright-test-suites)
  - [Desktop Web E2E Testing](#1-desktop-web-e2e-testing)
  - [Mobile Web Emulation](#2-mobile-web-emulation)
  - [API Testing with Playwright Request](#3-api-testing-with-playwright-request)
  - [Database Automated Testing (PostgreSQL)](#4-database-automated-testing-postgresql)
  - [Failure-Only Screenshot & Video Retention](#5-failure-only-screenshot--video-retention)
- [How to Add a New Test Suite](#-how-to-add-a-new-test-suite)
- [REST API & WebSocket Reference](#-rest-api--websocket-reference)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🏛 System Architecture

```
+-------------------------------------------------------------------------------+
|                               FRONTEND (React + Tailwind)                     |
|  - KPI Overview Cards (Pass Rate %, Total Runs, Avg Duration)                |
|  - Interactive Recharts (Pass/Fail Breakdown, Run Duration Trends)            |
|  - Test Suites Catalog Table with 1-Click "Start Suite" Triggers              |
|  - Real-Time Progress Bar & Streaming Terminal Console                        |
|  - Run Detail Modal (Test Steps, Tracebacks, Failure Screenshots & Videos)     |
+-------------------------------------------------------------------------------+
                                 ▲                          ▲
                                 │ REST API                 │ WebSockets (Socket.io)
                                 ▼                          ▼
+-------------------------------------------------------------------------------+
|                               BACKEND (Node.js + Express)                     |
|  - Express Server & Socket.io Event Broadcaster                               |
|  - Test Runner Service (spawns Playwright CLI as child process)               |
|  - Real-time Log Streamer (captures stdout/stderr line-by-line)               |
|  - JSON Reporter Parser (extracts failure attachments & run metadata)         |
|  - Static File Server (exposes failure media at /artifacts/*)                 |
+-------------------------------------------------------------------------------+
                 │                                                │
                 ▼                                                ▼
+------------------------------------+          +------------------------------------+
|       DATABASE (PostgreSQL 16)     |          |       PLAYWRIGHT AUTOMATION        |
|  - test_runs (execution history)   |          |  - Desktop Web E2E (Chromium)      |
|  - test_results (case outcomes)    |          |  - Mobile Emulation (Pixel/iPhone) |
|  - test_logs (real-time stream)    |          |  - API Testing (request fixture)   |
+------------------------------------+          |  - Retains Media ONLY on Failure   |
                                                +------------------------------------+
```

---

## 🌟 Key Features

1. **Modern Frontend (React + Tailwind CSS)**:
   - **Metrics Overview**: Summary KPI cards (Total Runs, Pass Rate %, Passed vs Failed, Average Duration).
   - **Analytics Charts**: Interactive Pass/Fail distribution donut chart and execution duration trends powered by **Recharts**.
   - **Full GUI CRUD for Test Suites**: **Create**, **Edit**, and **Delete** test suites directly in the browser with an interactive code editor and pre-loaded starter templates.
   - **Test Suite Catalog**: Table of automated test suites with project types, test file paths, tags, and individual "Start Suite" buttons.
   - **Live Execution Console**: Real-time progress bar (0–100%) and terminal log viewer with auto-scroll, search filter, and abort execution control via **Socket.io**.
   - **Inspection Modal**: Step-by-step test cases, error traceback boxes, inline **failure video player (`.webm`)**, and **failure screenshot viewer (`.png`)** with zoom lightbox.

2. **Backend Execution Engine (Node.js + Express + Socket.io)**:
   - Child process execution of Playwright CLI (`playwright test`).
   - Line-by-line streaming of standard output, standard error, and system logs to connected browser clients.
   - Automatic JSON test report parsing that maps test status, execution time, error stacks, and failure media.
   - Static file server serving failure artifacts (`/artifacts/*`).

3. **Database Architecture (PostgreSQL via `pg`)**:
   - Connection pool using the official `pg` (node-postgres) driver.
   - Automatic table provisioning and schema migration on server startup (`initDb()`).
   - Tables: `test_runs`, `test_results`, and `test_logs`.

4. **Mobile Web Testing (Playwright Mobile Emulation)**:
   - Built-in projects for **Google Pixel 7** (`mobile-chrome`) and **Apple iPhone 14** (`mobile-safari`).
   - Validates responsive mobile viewports, touch gestures (`link.tap()`), and mobile user-agent headers.

5. **Failure-Only Media Retention**:
   - Playwright is configured with `screenshot: 'only-on-failure'` and `video: 'retain-on-failure'`.
   - Successful tests produce no disk clutter; failed tests automatically record full-motion `.webm` videos and `.png` screenshots attached directly to the dashboard.

---

## 📁 Project Structure

```
Test_auto/
├── docker-compose.yml              # PostgreSQL Docker container definition (port 5434)
├── run.bat                         # 1-Click launcher (Starts DB, builds frontend, launches server & browser)
├── run-dev.bat                     # Concurrent dev-mode launcher with HMR (Vite + Node watch)
├── package.json                    # Root test runner dependencies & scripts
├── playwright.config.ts            # Playwright config (Mobile emulation, API, failure-only media)
│
├── tests/
│   ├── e2e/
│   │   ├── web-app.spec.ts         # Desktop Chromium Web E2E tests
│   │   └── failing-demo.spec.ts    # Intentional failure test demonstrating screenshot & video capture
│   ├── mobile/
│   │   └── mobile-web.spec.ts      # Mobile Emulation tests (Pixel 7 / iPhone 14)
│   └── api/
│       └── api-integration.spec.ts # REST API integration tests using Playwright's request fixture
│
├── backend/
│   ├── package.json
│   ├── .env                        # Environment variables (Database URL, Port, CORS)
│   ├── .env.example
│   └── src/
│       ├── server.js               # Express & Socket.io server entry
│       ├── config.js               # Configuration and root directory paths
│       ├── db/
│       │   ├── index.js            # PostgreSQL connection pool & auto-migration
│       │   └── schema.sql          # PostgreSQL DDL table schemas
│       ├── services/
│       │   ├── testRunner.js       # Child process CLI execution & live log broadcaster
│       │   └── testParser.js       # Playwright JSON report & artifact mapper
│       └── routes/
│           ├── suites.js           # GET /api/suites
│           ├── runs.js             # GET /api/runs, GET /api/runs/:id, POST /api/tests/run, POST /api/tests/stop/:id
│           └── stats.js            # GET /api/stats (KPI metrics & trend analytics)
│
└── frontend/
    ├── package.json
    ├── vite.config.js              # Vite config (proxy to backend port 4000)
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx                 # Central dashboard coordinator
        ├── components/
        │   ├── Navbar.jsx          # Header with live WebSocket & DB status
        │   ├── StatsOverview.jsx   # KPI cards and Recharts analytics
        │   ├── TestSuitesTable.jsx # Available suites table with Run buttons
        │   ├── LiveConsole.jsx     # Real-time progress bar & terminal log streamer
        │   ├── RunHistoryTable.jsx # Recent runs history table
        │   └── RunDetailModal.jsx  # Test cases with failure screenshot & video player
        └── services/
            ├── api.js              # REST client
            └── socket.js           # WebSocket connection
```

---

## ⚙️ Prerequisites

- **Node.js**: v18.0.0 or higher (`node -v`)
- **NPM**: v9.0.0 or higher (`npm -v`)
- **Docker**: Docker Desktop or Docker Engine running for PostgreSQL (`docker -v`)

---

## ⚡ Quick Start (1-Click)

Simply double-click **`run.bat`** in the project folder or execute in PowerShell / Command Prompt:

```cmd
.\run.bat
```

This automated script will:
1. Start the PostgreSQL Docker container (`localhost:5434`).
2. Verify and install any missing npm dependencies.
3. Build the frontend production bundle (`frontend/dist`).
4. Start the backend server on **`http://localhost:4000`**.
5. Automatically open the Dashboard in your default browser.

### Development Mode (with Live Hot-Module Reloading):

```cmd
.\run-dev.bat
```
- **Frontend dev server**: `http://localhost:5180` (with instant React HMR)
- **Backend API server**: `http://localhost:4000`

---

## 🛠 Manual Setup & Installation

If you prefer to configure and run the services step-by-step:

### Step 1: Start PostgreSQL via Docker

```bash
docker compose up -d
```
*Spins up PostgreSQL 16 on port `5434` with user `qa_user`, password `qa_password`, database `qa_dashboard`.*

### Step 2: Install Root & Playwright Dependencies

```bash
npm install
npx playwright install chromium
```

### Step 3: Install & Start Backend

```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:4000` and automatically connects to PostgreSQL and creates the database schema.*

### Step 4: Install & Start Frontend

In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
*Frontend dev server starts on `http://localhost:5180`.*

---

## 🗄 Database Guidelines & PostgreSQL Schema

### Connection Parameters
- **Host**: `localhost`
- **Port**: `5434` *(custom port to avoid collisions with other PostgreSQL containers on 5432/5433)*
- **User**: `qa_user`
- **Password**: `qa_password`
- **Database**: `qa_dashboard`
- **Connection URL**: `postgresql://qa_user:qa_password@localhost:5434/qa_dashboard`

### Schema Details (`backend/src/db/schema.sql`)

#### 1. Table `test_runs`
Stores overall execution runs triggered from the dashboard or CLI:
```sql
CREATE TABLE IF NOT EXISTS test_runs (
    id VARCHAR(64) PRIMARY KEY,
    suite_id VARCHAR(128) NOT NULL,
    suite_name VARCHAR(255) NOT NULL,
    type VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'running',
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    duration_ms INTEGER DEFAULT 0,
    total_tests INTEGER DEFAULT 0,
    passed_tests INTEGER DEFAULT 0,
    failed_tests INTEGER DEFAULT 0,
    skipped_tests INTEGER DEFAULT 0,
    triggered_by VARCHAR(64) DEFAULT 'manual',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. Table `test_results`
Stores individual test case outcomes and attached media URLs:
```sql
CREATE TABLE IF NOT EXISTS test_results (
    id VARCHAR(64) PRIMARY KEY,
    run_id VARCHAR(64) NOT NULL REFERENCES test_runs(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    project VARCHAR(128) NOT NULL,
    file VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL,
    duration_ms INTEGER DEFAULT 0,
    error_message TEXT,
    error_stack TEXT,
    screenshot_url TEXT,
    video_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. Table `test_logs`
Stores real-time streamed logs:
```sql
CREATE TABLE IF NOT EXISTS test_logs (
    id SERIAL PRIMARY KEY,
    run_id VARCHAR(64) NOT NULL REFERENCES test_runs(id) ON DELETE CASCADE,
    stream VARCHAR(16) NOT NULL DEFAULT 'stdout',
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🧪 Playwright Test Suites

### 1. Desktop Web E2E Testing
Located at `tests/e2e/web-app.spec.ts`.
- Validates page title, header existence, and link navigation on desktop viewports (1280x720).
- Run via CLI:
  ```bash
  npx playwright test tests/e2e/web-app.spec.ts --project=chromium
  ```

### 2. Mobile Web Emulation
Located at `tests/mobile/mobile-web.spec.ts`.
- Uses Playwright's device descriptors:
  - `devices['Pixel 7']` (Android Chrome emulation, 412x915 viewport, touch enabled)
  - `devices['iPhone 14']` (iOS Safari emulation, 390x844 viewport, touch enabled)
- Validates responsive mobile viewports, touch tapping (`link.tap()`), and mobile user-agent strings.
- Run via CLI:
  ```bash
  npx playwright test tests/mobile/mobile-web.spec.ts --project=mobile-chrome
  ```

### 3. API Testing with Playwright Request
Located at `tests/api/api-integration.spec.ts`.
- Uses Playwright's built-in `request` fixture to test REST APIs without launching a browser:
  - `GET /posts/1`: Verifies HTTP 200, JSON content-type, and payload schema.
  - `POST /posts`: Verifies HTTP 201 Created and response attributes.
  - `GET /posts/999999`: Verifies clean HTTP 404 Not Found handling.
- Run via CLI:
  ```bash
  npx playwright test tests/api/api-integration.spec.ts --project=api
  ```

### 4. Database Automated Testing (PostgreSQL)
Located at `tests/database/db-integration.spec.ts`.
- Automated tests verifying database integrity, relational constraints, transaction safety, and performance benchmarks:
  - `TC-DB-01`: Connects to PostgreSQL, checks engine version and ping response.
  - `TC-DB-02`: Validates all required schema tables (`test_suites`, `test_runs`, `test_results`, `test_logs`) exist.
  - `TC-DB-03`: Checks critical table columns, primary keys, and types.
  - `TC-DB-04`: Validates transaction isolation and rollback integrity (`BEGIN -> INSERT -> ROLLBACK`).
  - `TC-DB-05`: Tests PostgreSQL foreign key constraints on `test_results.run_id`.
  - `TC-DB-06`: Measures SQL query execution latency (benchmark under 100ms).
- Run via CLI:
  ```bash
  npm run test:db
  # or
  npx playwright test tests/database/db-integration.spec.ts --project=database
  ```

### 5. Failure-Only Screenshot & Video Retention
Configured in `playwright.config.ts`:
```typescript
use: {
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
}
```
- **Passing tests**: Complete with zero media overhead.
- **Failing tests**: Playwright automatically saves a `.png` screenshot and records a full `.webm` video of the failing interaction.
- The demonstration test `tests/e2e/failing-demo.spec.ts` triggers an intentional failure to showcase this functionality. The artifacts appear directly inside the **Run Details Modal** on the dashboard.

---

## ➕ How to Add a New Test Suite

1. **Create your test file** under `tests/<folder>/<name>.spec.ts`:
   ```typescript
   import { test, expect } from '@playwright/test';

   test('my new test case', async ({ page }) => {
     await page.goto('https://my-app.com');
     await expect(page).toHaveTitle(/My App/);
   });
   ```

2. **Register the suite in `backend/src/services/testRunner.js`**:
   Add an entry to the `TEST_SUITES` array:
   ```javascript
   {
     id: 'my-custom-suite',
     name: 'My Custom App Suite',
     type: 'e2e',
     description: 'Validates critical end-to-end user workflows',
     testFile: 'tests/my-folder/my-custom-suite.spec.ts',
     project: 'chromium',
     tags: ['custom', 'e2e', 'checkout'],
   }
   ```
3. The new suite will instantly appear in the **Test Suites Catalog Table** on the dashboard with a dedicated "Start Suite" button!

---

## 📡 REST API & WebSocket Reference

### REST Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/suites` | List all available test suites and metadata |
| `POST` | `/api/tests/run` | Trigger test suite execution (`{ suiteId: 'e2e-web' }`) |
| `POST` | `/api/tests/stop/:id` | Abort/terminate a running test process |
| `GET` | `/api/runs` | Get paginated execution history (`?limit=25&offset=0`) |
| `GET` | `/api/runs/:id` | Get detailed test run results, traces, and logs |
| `GET` | `/api/stats` | Retrieve aggregate metrics (pass rate, duration, trends) |
| `GET` | `/artifacts/*` | Serve failure screenshot images and video files |
| `GET` | `/api/health` | Healthcheck and server uptime |

### WebSocket Events (`Socket.io`)
| Event Name | Direction | Description |
|---|---|---|
| `test:started` | Server ➔ Client | Fired when test runner spawns (`{ runId, suiteId, suiteName }`) |
| `test:progress` | Server ➔ Client | Progress updates (`{ runId, percent, status, text }`) |
| `test:log` | Server ➔ Client | Streamed log line (`{ runId, stream, message, timestamp }`) |
| `test:completed` | Server ➔ Client | Execution finished (`{ runId, status, durationMs, passCount }`) |

---

## ❓ Troubleshooting & FAQs

### Q1: `psql` or `docker` command not recognized
- **Solution**: Ensure Docker Desktop is installed and running. If PostgreSQL is already installed natively, update the `DATABASE_URL` in `backend/.env` with your native credentials.

### Q2: Port 5434 is already in use
- **Solution**: Open `docker-compose.yml` and `backend/.env`, change `5434:5432` to another available port (e.g. `5435:5432`), and restart via `run.bat`.

### Q3: Playwright complains about missing browsers
- **Solution**: Run the following command from the project root:
  ```bash
  npx playwright install chromium
  ```

### Q4: PowerShell script execution disabled (`npm.ps1 cannot be loaded`)
- **Solution**: Use `npm.cmd` directly, or run `run.bat` which automatically uses `npm.cmd`.

---

## 📄 License
This project is licensed under the MIT License.
