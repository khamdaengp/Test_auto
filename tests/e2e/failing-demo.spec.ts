import { test, expect } from '@playwright/test';

test.describe('Failure Attachment Demonstration Suite', () => {
  test('intentional failure - captures screenshot and video on failure', async ({ page }) => {
    // Navigate to website
    await page.goto('https://example.com');

    // Introduce a brief wait to capture video frames
    await page.waitForTimeout(1000);

    // Click link to trigger an action in the video
    const link = page.locator('a');
    await link.click();

    // Intentional failure assertion to trigger Playwright's only-on-failure screenshot and video capture
    const nonExistentElement = page.locator('#this-id-does-not-exist-for-demo');
    await expect(nonExistentElement).toBeVisible({ timeout: 2000 });
  });
});
