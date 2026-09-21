import { test, expect } from '@playwright/test';

test.describe('Automated Visual Scenario', () => {
  test('execute visual no-code test flow', async ({ page }, testInfo) => {
    test.setTimeout(60_000);

    // 1. Navigate to target URL
    await page.goto('http://10.120.44.76:8441/#console/dashboard/v1', { waitUntil: 'domcontentloaded' });

    // Capture Start Screenshot (Before Action)
    const beforeShot = testInfo.outputPath('before-action.png');
    await page.screenshot({ path: beforeShot, fullPage: true });
    await testInfo.attach('before-action', { path: beforeShot, contentType: 'image/png' });

    // 2. User Defined Action Steps
    // Step 1: Fill input located by placeholder "Username"
    await page.getByPlaceholder('Username').fill('BCCS3_FULL');

    // Step 2: Fill input located by placeholder "Password"
    await page.getByPlaceholder('Password').fill('654321a@');

    // Step 3: Click button or link "Login"
    await (page.getByRole('button', { name: 'Login' }).or(page.getByRole('link', { name: 'Login' })).or(page.locator('button:has-text("Login"), a:has-text("Login")')).first()).click();

    // Step 4: Verify text "Login" is visible
    await expect(page.locator('text=Login').first()).toBeVisible({ timeout: 10_000 });

    // Step 5: Verify URL contains "#console/passport/login"
    await expect(page).toHaveURL(/.*#console\/passport\/login/, { timeout: 15_000 });

    // Step 6: Verify text "dashboard" is visible
    await expect(page.locator('text=dashboard').first()).toBeVisible({ timeout: 10_000 });


    // Capture End Screenshot (After Action)
    const afterShot = testInfo.outputPath('after-action.png');
    await page.screenshot({ path: afterShot, fullPage: true });
    await testInfo.attach('after-action', { path: afterShot, contentType: 'image/png' });
  });
});