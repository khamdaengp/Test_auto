import { test, expect } from '@playwright/test';

test.describe('Search with all empty fields', () => {
  test('execute search with blank criteria and verify data table with pagination', async ({ page }, testInfo) => {
    test.setTimeout(60_000);

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

    // Step 4: Verify URL contains dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15_000 });

    // Step 5: Click "Assign FTTH subscriber managem"
    await (page.getByRole('button', { name: 'Assign FTTH subscriber managem' }).or(page.getByRole('link', { name: 'Assign FTTH subscriber managem' })).or(page.locator('button:has-text("Assign FTTH subscriber managem"), a:has-text("Assign FTTH subscriber managem")')).first()).click();

    // Step 6: Click "Map connector code with sale staff"
    await (page.getByRole('button', { name: 'Map connector code with sale staff' }).or(page.getByRole('link', { name: 'Map connector code with sale staff' })).or(page.locator('button:has-text("Map connector code with sale staff"), a:has-text("Map connector code with sale staff")')).first()).click();

    // Step 7: Verify URL contains map-conn-with-sale-staff
    await expect(page).toHaveURL(/.*map-conn-with-sale-staff/, { timeout: 15_000 });

    // Step 8 (Requirement 1): Leave all search fields blank / default
    // Ensure "Account" input is blank
    const accountInput = page.locator('input[placeholder*="Account"], formly-field input').first();
    if (await accountInput.isVisible().catch(() => false)) {
      await accountInput.clear();
    }

    // Step 9 (Requirement 2): Click Search button
    const searchButton = page.locator('button').filter({ hasText: 'Search' }).or(page.getByRole('button', { name: 'Search' })).first();
    await searchButton.click();

    // Step 10 (Expected Result 1): Verify Data Table is visible
    const dataTable = page.locator('nz-table, .ant-table, table').first();
    await expect(dataTable).toBeVisible({ timeout: 15_000 });

    // Step 11 (Expected Result 2): Verify Table has rendered data rows (excluding internal measure row)
    const dataRow = page.locator('.ant-table-row, tbody tr.ant-table-row, tbody tr:has(td)').first();
    await expect(dataRow).toBeVisible({ timeout: 15_000 });

    // Step 12 (Expected Result 3): Verify Pagination is rendered (with total records info)
    const pagination = page.locator('.ant-pagination, nz-pagination').first();
    await expect(pagination).toBeVisible({ timeout: 15_000 });

    // Capture End Screenshot (After Action)
    const afterShot = testInfo.outputPath('after-action.png');
    await page.screenshot({ path: afterShot, fullPage: true });
    await testInfo.attach('after-action', { path: afterShot, contentType: 'image/png' });
  });
});
