import { test, expect } from '@playwright/test';
import { parseRgb, contrastRatio } from './_utils';

test('home applies the cold brew palette tokens with a readable contrast floor', async ({ page }) => {
  await page.goto('/');
  const body = page.locator('body');

  const bg = parseRgb(await body.evaluate((el) => getComputedStyle(el).backgroundColor));
  const fg = parseRgb(await body.evaluate((el) => getComputedStyle(el).color));

  expect(bg).toEqual([18, 13, 10]); // --color-base #120D0A
  expect(fg).toEqual([234, 224, 210]); // --color-cream #EAE0D2

  // WCAG AA for body text against the dark background.
  expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
});
