import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Playwright configuration for QA Automation Dashboard.
 * Includes:
 * 1. Desktop Web testing (Chromium)
 * 2. Mobile Emulation (Pixel 7 and iPhone 14)
 * 3. API testing project
 * 4. Screenshots and videos captured ONLY on failure
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/report.json' }],
    ['html', { open: 'never', outputFolder: 'test-results/html-report' }]
  ],
  outputDir: 'test-results/artifacts',
  use: {
    /* Base URL for web and API requests */
    baseURL: process.env.BASE_URL || 'https://reqres.in',

    /* Capture screenshot: override via PLAYWRIGHT_SCREENSHOT ('on' | 'off' | 'only-on-failure') */
    screenshot: (process.env.PLAYWRIGHT_SCREENSHOT as any) || 'only-on-failure',

    /* Record video: override via PLAYWRIGHT_VIDEO ('on' | 'off' | 'retain-on-failure' | 'on-first-retry') */
    video: (process.env.PLAYWRIGHT_VIDEO as any) || 'retain-on-failure',

    /* Retain trace only on failure */
    trace: 'retain-on-failure',

    /* Ignore HTTPs errors for local testing if needed */
    ignoreHTTPSErrors: true,
  },

  projects: [
    /* Desktop Web Testing (includes standard e2e and custom web suites) */
    {
      name: 'chromium',
      testMatch: /.*(e2e|custom).*\.spec\.ts/,
      testIgnore: [/.*api.*\.spec\.ts/, /.*database.*\.spec\.ts/, /.*mobile.*\.spec\.ts/],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },

    /* Mobile Web Testing: Android (Pixel 7) */
    {
      name: 'mobile-chrome',
      testMatch: /.*mobile.*\.spec\.ts/,
      use: {
        ...devices['Pixel 7'],
      },
    },

    /* Mobile Web Testing: iOS (iPhone 14) */
    {
      name: 'mobile-safari',
      testMatch: /.*mobile.*\.spec\.ts/,
      use: {
        ...devices['iPhone 14'],
      },
    },

    /* API Testing Project (Playwright Request feature) */
    {
      name: 'api',
      testMatch: /.*api.*\.spec\.ts/,
      use: {
        baseURL: 'https://reqres.in',
        extraHTTPHeaders: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      },
    },

    /* Database Automated Testing Project */
    {
      name: 'database',
      testMatch: /.*database.*\.spec\.ts/,
    },
  ],
});
