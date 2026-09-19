import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://tts-frontend.alexthedark.space/');
  await page.goto('https://tts-frontend.alexthedark.space/auth/login?redirect=%2Fdashboard&reason=');
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('admin');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Sign In' }).click();
});