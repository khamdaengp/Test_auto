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

    // Step 8: Verify dropdown "Branch" contains "All"
    await expect(page.locator('form formly-field, form .ant-form-item, form nz-form-item, form .ant-col').filter({ has: page.getByText('Branch', { exact: true }) }).locator('nz-select:not(.ant-pagination-options-size-changer), .ant-select:not(.ant-pagination-options-size-changer)').first()).toContainText('All', { timeout: 10_000 });

    // Step 9: Verify dropdown "Business center" contains "All"
    await expect(page.locator('form formly-field, form .ant-form-item, form nz-form-item, form .ant-col').filter({ has: page.getByText('Business center', { exact: true }) }).locator('nz-select:not(.ant-pagination-options-size-changer), .ant-select:not(.ant-pagination-options-size-changer)').first()).toContainText('All', { timeout: 10_000 });

    // Step 10: Verify dropdown "Sales staff" contains "All"
    await expect(page.locator('form formly-field, form .ant-form-item, form nz-form-item, form .ant-col').filter({ has: page.getByText('Sales staff', { exact: true }) }).locator('nz-select:not(.ant-pagination-options-size-changer), .ant-select:not(.ant-pagination-options-size-changer)').first()).toContainText('All', { timeout: 10_000 });

    // Step 11: Verify dropdown "Station code" contains "All"
    await expect(page.locator('form formly-field, form .ant-form-item, form nz-form-item, form .ant-col').filter({ has: page.getByText('Station code', { exact: true }) }).locator('nz-select:not(.ant-pagination-options-size-changer), .ant-select:not(.ant-pagination-options-size-changer)').first()).toContainText('All', { timeout: 10_000 });

    // Step 12: Verify dropdown "Cablebox code" contains "All"
    await expect(page.locator('form formly-field, form .ant-form-item, form nz-form-item, form .ant-col').filter({ has: page.getByText('Cablebox code', { exact: true }) }).locator('nz-select:not(.ant-pagination-options-size-changer), .ant-select:not(.ant-pagination-options-size-changer)').first()).toContainText('All', { timeout: 10_000 });

    // Step 13: Verify dropdown "Status" contains "All"
    await expect(page.locator('form formly-field, form .ant-form-item, form nz-form-item, form .ant-col').filter({ has: page.getByText('Status', { exact: true }) }).locator('nz-select:not(.ant-pagination-options-size-changer), .ant-select:not(.ant-pagination-options-size-changer)').first()).toContainText('All', { timeout: 10_000 });

    // Step 14: Verify text "Search" is visible
    await expect(page.getByRole('button', { name: 'Search' }).or(page.getByText('Search')).or(page.locator('button:has-text("Search"), a:has-text("Search")')).first()).toBeVisible({ timeout: 10_000 });

    // Step 15: Verify text "Reset" is visible
    await expect(page.getByRole('button', { name: 'Reset' }).or(page.getByText('Reset')).or(page.locator('button:has-text("Reset"), a:has-text("Reset")')).first()).toBeVisible({ timeout: 10_000 });

    // Step 16: Verify text "+ Create" is visible
    await expect(page.getByRole('button', { name: 'Create', exact: true }).or(page.locator('button:has-text("Create")')).or(page.getByRole('button', { name: '+ Create' })).first()).toBeVisible({ timeout: 10_000 });

    // Step 17: Verify text "Import files" is visible
    await expect(page.getByRole('button', { name: 'Import files' }).or(page.getByText('Import files')).or(page.locator('button:has-text("Import files"), a:has-text("Import files")')).first()).toBeVisible({ timeout: 10_000 });

    // Step 18: Verify text "Export files" is visible
    await expect(page.getByRole('button', { name: 'Export files' }).or(page.getByText('Export files')).or(page.locator('button:has-text("Export files"), a:has-text("Export files")')).first()).toBeVisible({ timeout: 10_000 });


    // Capture End Screenshot (After Action)
    const afterShot = testInfo.outputPath('after-action.png');
    await page.screenshot({ path: afterShot, fullPage: true });
    await testInfo.attach('after-action', { path: afterShot, contentType: 'image/png' });
  });
});