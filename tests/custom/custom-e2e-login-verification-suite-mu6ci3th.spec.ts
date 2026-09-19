import { test, expect } from '@playwright/test';

test.describe('Automated Test Suite: Login - MBCCS', () => {
  test('recorded user scenario - verify login success', async ({ page }, testInfo) => {
    // 1. Extend timeout
    test.setTimeout(60_000);

    // 2. Navigate to target URL
    await page.goto('http://10.120.44.76:8441/#console/passport/login', {
      waitUntil: 'domcontentloaded',
    });

    const usernameInput = page.getByPlaceholder('Username');
    await usernameInput.waitFor({ state: 'visible', timeout: 15_000 });

    // ==========================================
    // 📸 BEFORE ACTION: Login Page (Initial State)
    // ==========================================
    await page.screenshot({
      path: 'test-results/screenshots/login-before.png',
      fullPage: true,
    });

    // ⚠️ Name MUST include "before" so the system displays it under "BEFORE ACTION"
    await testInfo.attach('before-action-login', {
      path: 'test-results/screenshots/login-before.png',
      contentType: 'image/png',
    });

    // 3. Perform Login
    await usernameInput.fill('BCCS3_FULL');
    await page.getByPlaceholder('Password').fill('654321a@ ');

    const loginButton = page.getByRole('button', { name: 'Login' });
    await loginButton.click();

    // 4. Verify Login Success
    await expect(loginButton).toBeHidden({ timeout: 20_000 });
    await expect(page).not.toHaveURL(/.*#console\/passport\/login/, { timeout: 20_000 });
    await page.waitForLoadState('domcontentloaded');

    // ==========================================
    // 📸 AFTER ACTION: Dashboard (Target State)
    // ==========================================
    await page.screenshot({
      path: 'test-results/screenshots/login-after.png',
      fullPage: true,
    });

    // ⚠️ Name MUST include "after" so the system displays it under "AFTER ACTION"
    await testInfo.attach('after-action-dashboard', {
      path: 'test-results/screenshots/login-after.png',
      contentType: 'image/png',
    });
  });
});