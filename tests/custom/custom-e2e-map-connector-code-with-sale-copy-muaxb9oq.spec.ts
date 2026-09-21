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

    // Step 4: Verify URL contains "dashboard"
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15_000 });

    // Step 5: Click button or link "Assign FTTH subscriber managem"
    await (page.getByRole('button', { name: 'Assign FTTH subscriber managem' }).or(page.getByRole('link', { name: 'Assign FTTH subscriber managem' })).or(page.locator('button:has-text("Assign FTTH subscriber managem"), a:has-text("Assign FTTH subscriber managem")')).first()).click();

    // Step 6: Click button or link "Map connector code with sale staff"
    await (page.getByRole('button', { name: 'Map connector code with sale staff' }).or(page.getByRole('link', { name: 'Map connector code with sale staff' })).or(page.locator('button:has-text("Map connector code with sale staff"), a:has-text("Map connector code with sale staff")')).first()).click();

    // Step 7: Verify URL contains "map-conn-with-sale-staff"
    await expect(page).toHaveURL(/.*map-conn-with-sale-staff/, { timeout: 15_000 });

    // ---------------------------------------------------------------
    // 1. Verify Default Dropdown Values (Branch, Business center, Sales staff, Station code, Cablebox code, Status = "All")
    // ---------------------------------------------------------------
    const dropdownFields = [
      'Branch',
      'Business center',
      'Sales staff',
      'Station code',
      'Cablebox code',
      'Status'
    ];

    for (const fieldName of dropdownFields) {
      const fieldContainer = page.locator('form formly-field, form .ant-form-item, form nz-form-item, form .ant-col')
        .filter({ has: page.getByText(fieldName, { exact: true }) })
        .first();

      const targetSelect = fieldContainer.locator('nz-select:not(.ant-pagination-options-size-changer), .ant-select:not(.ant-pagination-options-size-changer)').first();

      await expect(targetSelect).toBeVisible({ timeout: 10_000 });
      await expect(targetSelect).toContainText('All');
    }

    // ---------------------------------------------------------------
    // 2. Verify Extra Buttons: Search & Reset
    // ---------------------------------------------------------------
    const searchBtn = page.getByRole('button', { name: /search/i }).or(page.locator('button:has-text("Search")')).first();
    await expect(searchBtn).toBeVisible({ timeout: 10_000 });

    const resetBtn = page.getByRole('button', { name: /reset/i }).or(page.locator('button:has-text("Reset")')).first();
    await expect(resetBtn).toBeVisible({ timeout: 10_000 });

    // ---------------------------------------------------------------
    // 3. Verify Other Functions: + Create, Import files, Export files
    // ---------------------------------------------------------------
    const createBtn = page.getByRole('button', { name: /\+?\s*create/i }).or(page.locator('button:has-text("+ Create"), button:has-text("Create")')).first();
    await expect(createBtn).toBeVisible({ timeout: 10_000 });

    const importBtn = page.getByRole('button', { name: /import files/i }).or(page.locator('button:has-text("Import files"), a:has-text("Import files")')).first();
    await expect(importBtn).toBeVisible({ timeout: 10_000 });

    const exportBtn = page.getByRole('button', { name: /export files/i }).or(page.locator('button:has-text("Export files"), a:has-text("Export files")')).first();
    await expect(exportBtn).toBeVisible({ timeout: 10_000 });


    // Capture End Screenshot (After Action)
    const afterShot = testInfo.outputPath('after-action.png');
    await page.screenshot({ path: afterShot, fullPage: true });
    await testInfo.attach('after-action', { path: afterShot, contentType: 'image/png' });
  });
});