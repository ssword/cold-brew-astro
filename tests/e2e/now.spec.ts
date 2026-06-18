import { test, expect } from '@playwright/test';

test('the Now page exists and shows its heading', async ({ page }) => {
  const res = await page.goto('/now/');

  expect(res?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1, name: 'Now' })).toBeVisible();
});

test('the Now page is a dated snapshot in the shared layout and voice', async ({ page }) => {
  await page.goto('/now/');

  // a dated snapshot: a muted "last updated" timestamp in the UI font
  const updated = page.locator('article.page .updated');
  await expect(updated).toContainText(/last updated/i);
  expect(await updated.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/IBM Plex Sans/);

  // reads like a person, in the shared reading serif
  await expect(page.locator('article.page')).toContainText(/\bI\b/);
  const para = page.locator('article.page p:not(.updated)').first();
  expect(await para.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/Newsreader/);

  // shared layout
  await expect(page.getByRole('link', { name: 'cold brew' })).toBeVisible();
  await expect(page.locator('footer')).toBeVisible();
});
