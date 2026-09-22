import { test, expect } from '@playwright/test';

test.describe('Automated Test Suite: Map connector code with sale staff - MBCCS', () => {
  test('Create map connector code with sale staff flow', async ({ page }, testInfo) => {
    test.setTimeout(90_000);

    // 1. Navigate to target URL
    await page.goto('http://10.120.44.76:8441/#console/dashboard/v1', { waitUntil: 'domcontentloaded' });

    // Capture Start Screenshot (Before Action)
    const beforeShot = testInfo.outputPath('before-action.png');
    await page.screenshot({ path: beforeShot, fullPage: true });
    await testInfo.attach('before-action', { path: beforeShot, contentType: 'image/png' });

    // Step 1: Login
    await page.getByPlaceholder('Username').fill('BCCS3_FULL');
    await page.getByPlaceholder('Password').fill('654321a@');
    await (page.getByRole('button', { name: 'Login' }).or(page.locator('button:has-text("Login")')).first()).click();
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15_000 });

    // Step 2: Navigate to Map connector code with sale staff page
    await (page.getByRole('button', { name: 'Assign FTTH subscriber managem' }).or(page.getByRole('link', { name: 'Assign FTTH subscriber managem' })).or(page.locator('button:has-text("Assign FTTH subscriber managem"), a:has-text("Assign FTTH subscriber managem")')).first()).click();
    await (page.getByRole('button', { name: 'Map connector code with sale staff' }).or(page.getByRole('link', { name: 'Map connector code with sale staff' })).or(page.locator('button:has-text("Map connector code with sale staff"), a:has-text("Map connector code with sale staff")')).first()).click();
    await expect(page).toHaveURL(/.*map-conn-with-sale-staff/, { timeout: 15_000 });

    // Close AI Assistant floating card if present to prevent click interception
    const closeAssistant = page.locator('.ai-assistant__card button, .ai-assistant__card .anticon-close, .ai-assistant__card [class*="close"], .ai-assistant__card svg').first();
    if (await closeAssistant.isVisible().catch(() => false)) {
      await closeAssistant.click().catch(() => {});
      await page.waitForTimeout(500);
    }

    // Step 3: Click "+ Create" button to open the Drawer
    const createButton = page.locator('button').filter({ hasText: 'Create' }).or(page.getByRole('button', { name: 'Create' })).first();
    await createButton.click();
    await page.waitForTimeout(1000);

    const drawer = page.locator('.ant-drawer, .ant-modal').first();
    await expect(drawer).toBeVisible({ timeout: 10_000 });

    // Helper to select dropdown option reliably in Angular Formly
    async function selectOption(selectorPattern: string, optionIndex: number = 0) {
      const select = drawer.locator(selectorPattern).locator('.ant-select-selector, nz-select-arrow').first();
      await select.click({ force: true });
      await page.waitForTimeout(600);

      const option = page.locator('.cdk-overlay-container nz-option-item:not(.ant-select-item-option-disabled)').nth(optionIndex);
      await option.waitFor({ state: 'attached', timeout: 5000 });
      await option.click({ force: true });
      await page.waitForTimeout(800);
    }

    // Step 4: Select Branch (Option 1)
    await selectOption('[id*="formly-select_branch"]', 0);

    // Step 5: Select Business center (Option 4)
    await selectOption('[id*="formly-select_businessCenter"]', 3);

    // Step 6: Select Sales staff (Option 1)
    await selectOption('[id*="formly-select_saleStaff"]', 0);

    // Step 7: Select Station code (Option 1)
    await selectOption('[id*="formly-select_stationCode"]', 0);

    // Step 8: Select Cablebox code (Option 1)
    await selectOption('[id*="formly-select_cableBoxCode"]', 0);

    // Step 9: Click Submit button in the Drawer
    const submitButton = drawer.locator('button').filter({ hasText: 'Submit' }).first();
    await submitButton.click();
    await page.waitForTimeout(1000);

    // Step 10: Confirm modal dialog "Ok"
    const confirmModal = page.locator('.ant-modal-confirm, .ant-modal, nz-modal-container');
    if (await confirmModal.isVisible().catch(() => false)) {
      const okButton = confirmModal.locator('button').filter({ hasText: /Ok|OK|Confirm|Yes/i }).first();
      await okButton.click();
      await page.waitForTimeout(2000);
    }

    // Step 11: Assert Success Notification / Toast
    const successToast = page.locator('.ant-message-success, .ant-notification-notice-success, .ant-message, nz-notification');
    await expect(successToast.first()).toBeVisible({ timeout: 15_000 });

    // Capture End Screenshot (After Action)
    const afterShot = testInfo.outputPath('after-action.png');
    await page.screenshot({ path: afterShot, fullPage: true });
    await testInfo.attach('after-action', { path: afterShot, contentType: 'image/png' });
  });
});
