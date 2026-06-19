import { test, expect } from '@playwright/test';

test('the About page exists and shows its heading', async ({ page }) => {
  const res = await page.goto('/about/');

  expect(res?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1, name: 'About' })).toBeVisible();
});

test('the About page uses the shared layout, voice, and reading typography', async ({ page }) => {
  await page.goto('/about/');

  // shared layout: masthead home link + footer
  await expect(page.getByRole('link', { name: 'cold brew' })).toBeVisible();
  await expect(page.locator('footer')).toBeVisible();

  // reads like a person: first-person copy
  await expect(page.locator('article.page')).toContainText(/\bI\b/);

  // body prose in the reading serif (Newsreader), consistent with essays
  const para = page.locator('article.page p').first();
  expect(await para.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/Newsreader/);

  // held to a reading measure, not full-bleed
  const maxWidth = await page
    .locator('article.page')
    .evaluate((el) => getComputedStyle(el).maxWidth);
  expect(maxWidth).not.toBe('none');
  expect(parseFloat(maxWidth)).toBeGreaterThan(0);
});
