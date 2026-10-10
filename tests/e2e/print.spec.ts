import { test, expect } from '@playwright/test';
import { parseRgb } from './_utils';

const ESSAY = '/essays/a-map-of-the-hedge/';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ media: 'print' });
});

test('printing an essay drops the site chrome and reader controls', async ({ page }) => {
  await page.goto(ESSAY);
  for (const selector of [
    'body > header',
    'body > footer',
    '[data-atmosphere]',
    '[data-reader-dock]',
    '.reader-progress',
    '.essay-reply',
  ]) {
    await expect(page.locator(selector).first()).toBeHidden();
  }
});

test('printing an essay keeps the article, code, figures, and sources', async ({ page }) => {
  await page.goto(ESSAY);
  const article = page.locator('article.essay');
  await expect(article.locator('h1')).toBeVisible();
  await expect(article.locator('pre').first()).toBeVisible();
  await expect(article.locator('figure').first()).toBeVisible();
  await expect(page.locator('[data-technical-sources]')).toBeVisible();
});

test('printed prose is dark ink on a white page', async ({ page }) => {
  await page.goto(ESSAY);
  const [body, ink] = await Promise.all([
    page.locator('body').evaluate((el) => getComputedStyle(el).backgroundColor),
    page.locator('article.essay p').first().evaluate((el) => getComputedStyle(el).color),
  ]);
  expect(parseRgb(body)).toEqual([255, 255, 255]);
  const [r, g, b] = parseRgb(ink);
  expect(Math.max(r, g, b)).toBeLessThan(60);
});
