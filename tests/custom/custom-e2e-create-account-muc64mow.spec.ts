import { test, expect } from '@playwright/test';

test.describe('Automated Visual Scenario', () => {
  test('execute visual no-code test flow', async ({ page }, testInfo) => {
    test.setTimeout(90_000);

    // 1. Navigate to target URL
    await page.goto('http://10.120.44.76:8441/#console/dashboard/v1', { waitUntil: 'domcontentloaded' });

    // Capture Start Screenshot (Before Action)
    const beforeShot = testInfo.outputPath('before-action.png');
    await page.screenshot({ path: beforeShot, fullPage: true });
    await testInfo.attach('before-action', { path: beforeShot, contentType: 'image/png' });

    // Step 1: Fill Username
    await page.getByPlaceholder('Username').fill('BCCS3_FULL');

    // Step 2: Fill Password
    await page.getByPlaceholder('Password').fill('654321a@');

    // Step 3: Click Login
    await (page.getByRole('button', { name: 'Login' }).or(page.locator('button:has-text("Login")')).first()).click();
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15_000 });

    // Step 4: Click Assign FTTH subscriber managem
    await (page.getByRole('button', { name: 'Assign FTTH subscriber managem' }).or(page.getByRole('link', { name: 'Assign FTTH subscriber managem' })).or(page.locator('button:has-text("Assign FTTH subscriber managem"), a:has-text("Assign FTTH subscriber managem")')).first()).click();

    // Step 5: Click Map connector code with sale staff
    await (page.getByRole('button', { name: 'Map connector code with sale staff' }).or(page.getByRole('link', { name: 'Map connector code with sale staff' })).or(page.locator('button:has-text("Map connector code with sale staff"), a:has-text("Map connector code with sale staff")')).first()).click();
    await expect(page).toHaveURL(/.*map-conn-with-sale-staff/, { timeout: 15_000 });

    // Step 6: Close AI Assistant if open
    const closeBtn = page.locator('.ai-assistant__card svg, .ai-assistant__card button').first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
    }

    // Step 7: Click Create button to open drawer
    await (page.locator('button').filter({ hasText: 'Create' }).or(page.getByRole('button', { name: 'Create' })).first()).click();
    await page.waitForTimeout(1000);

    const drawer = page.locator('.ant-drawer, .ant-modal').first();
    await expect(drawer).toBeVisible({ timeout: 10_000 });

    // Step 8: Select Type mapping "Account" radio button
    await drawer.locator('label').filter({ hasText: 'Account' }).locator('input[type="radio"], .ant-radio-input, .ant-radio').first().click({ force: true });
    await page.waitForTimeout(800);

    // Step 9: Select Branch (Option 1)
    await drawer.locator('[id*="formly-select_branch"]').locator('.ant-select-selector, nz-select-arrow').first().click({ force: true });
    await page.waitForTimeout(600);
    await page.locator('.cdk-overlay-container nz-option-item').first().click({ force: true });
    await page.waitForTimeout(800);

    // Step 10: Select Business center (Option 4)
    await drawer.locator('[id*="formly-select_businessCenter"]').locator('.ant-select-selector, nz-select-arrow').first().click({ force: true });
    await page.waitForTimeout(600);
    await page.locator('.cdk-overlay-container nz-option-item').nth(3).click({ force: true });
    await page.waitForTimeout(800);

    // Step 11: Select Sales staff (Option 1)
    await drawer.locator('[id*="formly-select_saleStaff"]').locator('.ant-select-selector, nz-select-arrow').first().click({ force: true });
    await page.waitForTimeout(600);
    await page.locator('.cdk-overlay-container nz-option-item').first().click({ force: true });
    await page.waitForTimeout(800);

    // Step 12: Fill Account input "2097181355"
    const accountInput = drawer.locator('#account, input[placeholder="Account"], input[id*="account"]').first();
    await accountInput.fill('2097181355');
    await page.waitForTimeout(500);

    // Step 13: Click Submit button in the Drawer
    await drawer.locator('button').filter({ hasText: 'Submit' }).first().click();
    await page.waitForTimeout(1000);

    // Step 14: Confirm modal dialog "Ok"
    const confirmModal = page.locator('.ant-modal-confirm, .ant-modal, nz-modal-container');
    if (await confirmModal.isVisible().catch(() => false)) {
      const okBtn = confirmModal.locator('button').filter({ hasText: /Ok|OK|Confirm|Yes/i }).first();
      await okBtn.click();
      await page.waitForTimeout(2000);
    }

    // Step 15: Assert Success Notification / Toast
    const successToast = page.locator('.ant-message-success, .ant-notification-notice-success, .ant-message, nz-notification');
    await expect(successToast.first()).toBeVisible({ timeout: 15_000 });

    // Capture End Screenshot (After Action)
    const afterShot = testInfo.outputPath('after-action.png');
    await page.screenshot({ path: afterShot, fullPage: true });
    await testInfo.attach('after-action', { path: afterShot, contentType: 'image/png' });
  });
});