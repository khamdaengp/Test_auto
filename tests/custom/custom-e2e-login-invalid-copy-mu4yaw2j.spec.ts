import { test, expect } from '@playwright/test';

test.describe('Automated Test Suite: HRMN - HR & Workspace Management Platform', () => {
  test('recorded user scenario', async ({ page }, testInfo) => {
    // 1. Extend timeout for remote environments / backend latency
    test.setTimeout(60_000);

    // 2. Navigate to target URL (domcontentloaded avoids external asset hang)
    await page.goto('http://localhost:5175/login', { waitUntil: 'domcontentloaded' });

    // Capture Before Action screenshot (Start: initial page state)
    const beforeShot = testInfo.outputPath('before-action.png');
    await page.screenshot({ path: beforeShot, fullPage: true });
    await testInfo.attach('before-action', { path: beforeShot, contentType: 'image/png' });

    // 3. User Interactions & Assertions
    // Step 1: Fill <input> with "admin@hrmn.local"
    await page.getByPlaceholder('name@hrmn.local').fill('admin@hrmn.local');

    // Step 2: Fill <input> with "Password123!"
    await page.getByPlaceholder('••••••••••••').fill('Password123!');

    // Step 3: Click <button>
    await page.getByRole('button', { name: 'Sign In to Workspace' }).click();

    // Step 4: Verify URL redirected to: /dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15_000 });

    // Capture After Action screenshot (End: target state after actions)
    const afterShot = testInfo.outputPath('after-action.png');
    await page.screenshot({ path: afterShot, fullPage: true });
    await testInfo.attach('after-action', { path: afterShot, contentType: 'image/png' });
  });
});
