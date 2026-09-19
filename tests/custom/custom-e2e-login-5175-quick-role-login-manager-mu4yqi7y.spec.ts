import { test, expect } from '@playwright/test';

test.describe('Automated Test Suite: HRMN - HR & Workspace Management Platform', () => {
  test('verify quick role login for manager', async ({ page }, testInfo) => {
    test.setTimeout(60_000);

    // 1. Navigate to target URL
    await page.goto('http://localhost:5175/login', { waitUntil: 'domcontentloaded' });

    // Capture Before Action screenshot (Start: initial page state)
    const beforeShot = testInfo.outputPath('before-action.png');
    await page.screenshot({ path: beforeShot, fullPage: true });
    await testInfo.attach('before-action', { path: beforeShot, contentType: 'image/png' });

    // 2. Click Quick Role button "Manager"
    await page.getByRole('button', { name: 'Manager' }).click();

    // Verify email field auto-filled with manager email
    await expect(page.getByPlaceholder('name@hrmn.local')).toHaveValue('manager.tech@hrmn.local');

    // 3. Click Sign In to Workspace button
    await page.getByRole('button', { name: 'Sign In to Workspace' }).click();

    // 4. Assert redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15_000 });

    // Capture After Action screenshot (End: dashboard view)
    const afterShot = testInfo.outputPath('after-action.png');
    await page.screenshot({ path: afterShot, fullPage: true });
    await testInfo.attach('after-action', { path: afterShot, contentType: 'image/png' });
  });
});
