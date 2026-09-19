import { test, expect } from '@playwright/test';

test.describe('SauceDemo E2E Web Automation Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');
  });

  test('TC-WEB-01: Verify Page Title & Login Form Visibility', async ({ page }) => {
    await expect(page).toHaveTitle(/Swag Labs/);
    await expect(page.locator('[data-test="username"]')).toBeVisible();
    await expect(page.locator('[data-test="password"]')).toBeVisible();
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });

  test('TC-WEB-02: Show Error on Invalid Credentials', async ({ page }) => {
    await page.fill('[data-test="username"]', 'locked_out_user');
    await page.fill('[data-test="password"]', 'wrong_password');
    await page.click('[data-test="login-button"]');

    const errorMsg = page.locator('[data-test="error"]');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText('Username and password do not match');
  });

  test('TC-WEB-03: Successful Login to Inventory Catalog', async ({ page }) => {
    await page.fill('[data-test="username"]', 'standard_user');
    await page.fill('[data-test="password"]', 'secret_sauce');
    await page.click('[data-test="login-button"]');

    await expect(page).toHaveURL(/.*inventory.html/);
    const items = page.locator('.inventory_item');
    await expect(items).toHaveCount(6);
  });

  test('TC-WEB-04: Add Item to Cart & Verify Cart Counter', async ({ page }) => {
    await page.fill('[data-test="username"]', 'standard_user');
    await page.fill('[data-test="password"]', 'secret_sauce');
    await page.click('[data-test="login-button"]');

    // Add first item (Sauce Labs Backpack)
    const addBtn = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
    await addBtn.click();

    // Verify cart badge shows 1
    const cartBadge = page.locator('.shopping_cart_badge');
    await expect(cartBadge).toHaveText('1');

    // Remove item and verify badge disappears
    const removeBtn = page.locator('[data-test="remove-sauce-labs-backpack"]');
    await removeBtn.click();
    await expect(cartBadge).toHaveCount(0);
  });
});
