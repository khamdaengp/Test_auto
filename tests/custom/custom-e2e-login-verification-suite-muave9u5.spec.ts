import { test, expect } from '@playwright/test';

test.describe('Automated Test Suite: Login - MBCCS', () => {
  test('recorded user scenario', async ({ page }, testInfo) => {
    // 1. Extend timeout for remote environments / backend latency
    test.setTimeout(60_000);

    // 2. Navigate to target URL (domcontentloaded avoids external asset hang)
    await page.goto('http://10.120.44.76:8441/#console/passport/login', { waitUntil: 'domcontentloaded' });

    // Capture Start Screenshot (Before Action)
    const beforeShot = testInfo.outputPath('before-action.png');
    await page.screenshot({ path: beforeShot, fullPage: true }).catch(() => {});
    await testInfo.attach('before-action', { path: beforeShot, contentType: 'image/png' }).catch(() => {});

    // 3. User Interactions
    // Step 1: Fill <input> with "BCCS3_FULL"
    await page.getByPlaceholder('Username').fill('BCCS3_FULL');

    // Step 2: Fill <input> with "654321a@"
    await page.getByPlaceholder('Password').fill('654321a@');

    // Step 3: Click <button>
    const loginButton = page.getByRole('button', { name: 'Login' });
    await loginButton.click();

    // 4. Verify Dashboard / Login Success
    // Step 4: Verify Login button is no longer visible
    await expect(loginButton).toBeHidden({ timeout: 20_000 });

    // Step 5: Verify URL navigates away from login page
    await expect(page).not.toHaveURL(/.*#console\/passport\/login/, { timeout: 20_000 });

    // Step 6: Wait for DOM to finish loading
    await page.waitForLoadState('domcontentloaded');

    // Step 7: Verify Dashboard content or element is visible
    await expect(
      page.getByText(/dashboard/i)
        .or(page.getByRole('heading', { name: /dashboard/i }))
        .or(page.locator('.dashboard, #dashboard, .ant-layout, .el-container, main'))
        .first()
    ).toBeVisible({ timeout: 20_000 });

    // Capture End Screenshot (After Action)
    const afterShot = testInfo.outputPath('after-action.png');
    await page.screenshot({ path: afterShot, fullPage: true }).catch(() => {});
    await testInfo.attach('after-action', { path: afterShot, contentType: 'image/png' }).catch(() => {});
  });
});
