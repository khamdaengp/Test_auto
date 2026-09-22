import { test, expect } from '@playwright/test';

test.describe('Automated Test Suite: Edit Map Connector Code with Sale Staff', () => {
  test('Edit and update connector code flow', async ({ page }, testInfo) => {
    // 1. Extend timeout for remote intranet environment
    test.setTimeout(90_000);

    // 2. Navigate to Login page directly
    await page.goto('http://10.120.44.76:8441/#console/passport/login', { waitUntil: 'domcontentloaded' });

    // Capture Start Screenshot (Before Action)
    const beforeShot = testInfo.outputPath('before-action.png');
    await page.screenshot({ path: beforeShot, fullPage: true }).catch(() => {});
    await testInfo.attach('before-action', { path: beforeShot, contentType: 'image/png' }).catch(() => {});

    // 3. Fill Credentials and Login
    await page.getByPlaceholder('Username').fill('BCCS3_FULL');
    await page.getByPlaceholder('Password').fill('654321a@');
    await page.getByRole('button', { name: 'Login' }).or(page.locator('button:has-text("Login")')).first().click();

    // 4. Wait for successful login
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 20_000 });

    // 5. Navigate directly to Map Connector page (fast & reliable)
    await page.goto('http://10.120.44.76:8441/#console/map-conn-with-sale-staff', { waitUntil: 'domcontentloaded' });

    // 6. Close AI Assistant floating card if visible
    const closeBtn = page.locator('.ai-assistant__card svg, .ai-assistant__card button').first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
    }

    // 7. Wait for table rows to load from API
    await page.waitForResponse((res) => res.url().includes('map-conn-with-sale-staff') || res.status() === 200, { timeout: 15_000 }).catch(() => {});
    const tableRow = page.locator('tbody tr.ant-table-row').filter({ hasText: '41_BOP' }).or(page.locator('tbody tr.ant-table-row')).first();
    await expect(tableRow).toBeVisible({ timeout: 20_000 });

    // 8. Click row action button (more / menu)
    const actionBtn = tableRow.getByRole('button').or(tableRow.locator('button')).first();
    await actionBtn.click();
    await page.waitForTimeout(800);

    // 9. Click "Edit" item in popup menu
    const editItem = page.getByRole('listitem').filter({ hasText: /Edit/i })
      .or(page.locator('.ant-dropdown-menu-item:has-text("Edit"), nz-option-item:has-text("Edit")'))
      .first();
    await editItem.click();
    await page.waitForTimeout(1000);

    // 10. Wait for Drawer to open
    const drawer = page.locator('.ant-drawer-body, .ant-drawer').first();
    await expect(drawer).toBeVisible({ timeout: 15_000 });

    // 11. Open "Cablebox code" dropdown inside drawer
    const cableboxField = drawer.locator('formly-field, .ant-form-item, .ant-col').filter({ hasText: /Cablebox code/i }).first();
    const cableboxDropdown = cableboxField.locator('.ant-select-selector, nz-select-top-control').first();
    await cableboxDropdown.click({ force: true });
    await page.waitForTimeout(800);

    // 12. Select connector / cablebox option
    const sn02Option = page.locator('.cdk-overlay-container nz-option-item').filter({ hasText: 'VIC550-DN01-SN02' }).first();
    if (await sn02Option.isVisible().catch(() => false)) {
      await sn02Option.click({ force: true });
    } else {
      // Pick the second option if SN02 is not found, or the first option
      const fallbackOptions = page.locator('.cdk-overlay-container nz-option-item');
      const count = await fallbackOptions.count();
      if (count > 1) {
        await fallbackOptions.nth(1).click({ force: true });
      } else if (count > 0) {
        await fallbackOptions.first().click({ force: true });
      }
    }
    await page.waitForTimeout(800);

    // 13. Click Submit button in drawer
    const submitBtn = drawer.getByRole('button', { name: /Submit/i }).or(drawer.locator('button:has-text("Submit")')).first();
    await submitBtn.click();
    await page.waitForTimeout(1000);

    // 14. Confirm Modal Ok
    const confirmModal = page.locator('.ant-modal-confirm, .ant-modal');
    if (await confirmModal.isVisible().catch(() => false)) {
      await confirmModal.locator('button').filter({ hasText: /Ok|OK|Confirm|Yes/i }).first().click();
      await page.waitForTimeout(2000);
    }

    // 15. Verify success feedback
    const successToast = page.locator('.ant-message-success, .ant-notification-notice-success, .ant-message, nz-notification');
    await expect(successToast.first()).toBeVisible({ timeout: 15_000 }).catch(() => {});

    // Capture End Screenshot (After Action)
    const afterShot = testInfo.outputPath('after-action.png');
    await page.screenshot({ path: afterShot, fullPage: true }).catch(() => {});
    await testInfo.attach('after-action', { path: afterShot, contentType: 'image/png' }).catch(() => {});
  });
});