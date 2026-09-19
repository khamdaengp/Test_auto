import { test, expect } from '@playwright/test';

test.describe('Mobile Web Emulation Suite', () => {
  test('should render responsive viewport correctly on mobile device', async ({ page }) => {
    await page.goto('https://example.com');

    // Verify viewport is mobile sized (less than 600px width)
    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();
    if (viewport) {
      expect(viewport.width).toBeLessThanOrEqual(500);
    }

    // Verify header is visible on mobile screen
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // Verify touch action / link is interactive on mobile
    const link = page.locator('a');
    await expect(link).toBeVisible();
    await link.scrollIntoViewIfNeeded();
  });

  test('should check mobile user-agent header', async ({ page }) => {
    await page.goto('https://example.com');
    const userAgent = await page.evaluate(() => navigator.userAgent);

    // Expect mobile token in user-agent string (iPhone or Android or Mobile)
    const isMobile = /iPhone|Android|Mobile/i.test(userAgent);
    expect(isMobile).toBeTruthy();
  });
});
