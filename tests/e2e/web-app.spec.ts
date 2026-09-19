import { test, expect } from '@playwright/test';

test.describe('E2E Desktop Web Suite', () => {
  test('should load example.com and verify page elements', async ({ page }) => {
    // Navigate to website
    await page.goto('https://example.com');

    // Verify title
    await expect(page).toHaveTitle(/Example Domain/);

    // Verify main header
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Example Domain');

    // Verify description paragraph exists
    const paragraph = page.locator('p').first();
    await expect(paragraph).toContainText('This domain is for use in documentation examples');
  });

  test('should verify link structure and attributes', async ({ page }) => {
    await page.goto('https://example.com');
    const moreInfoLink = page.locator('a');
    await expect(moreInfoLink).toBeVisible();
    await expect(moreInfoLink).toHaveAttribute('href', 'https://iana.org/domains/example');
  });
});
