import { test, expect } from '@playwright/test';

test.describe('Automated Test Suite: HRMN - HR & Workspace Management Platform', () => {
  test('verify invalid password error notification', async ({ page }, testInfo) => {
    test.setTimeout(60_000);

    // 1. Navigate to target URL
    await page.goto('http://localhost:5175/login', { waitUntil: 'domcontentloaded' });

    // Capture Before Action screenshot (Start: initial page state)
    const beforeShot = testInfo.outputPath('before-action.png');
    await page.screenshot({ path: beforeShot, fullPage: true });
    await testInfo.attach('before-action', { path: beforeShot, contentType: 'image/png' });

    // 2. User Interactions with invalid password
    await page.getByPlaceholder('name@hrmn.local').fill('admin@hrmn.local');
    await page.getByPlaceholder('••••••••••••').fill('WrongPassword999!');
    await page.getByRole('button', { name: 'Sign In to Workspace' }).click();

    // 3. Assertions: Error alert must appear and stay on /login
    const errorAlert = page.locator('text=Invalid email or password');
    await expect(errorAlert).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/.*login/);

    // Capture After Action screenshot (End: error state displayed)
    const afterShot = testInfo.outputPath('after-action.png');
    await page.screenshot({ path: afterShot, fullPage: true });
    await testInfo.attach('after-action', { path: afterShot, contentType: 'image/png' });
  });
});
