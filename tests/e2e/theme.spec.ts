import { test, expect } from '@playwright/test';
import { parseRgb, contrastRatio } from './_utils';

test('home applies the cold brew palette tokens with a readable contrast floor', async ({ page }) => {
  await page.goto('/');
  const body = page.locator('body');

  const bg = parseRgb(await body.evaluate((el) => getComputedStyle(el).backgroundColor));
  const fg = parseRgb(await body.evaluate((el) => getComputedStyle(el).color));

  expect(bg).toEqual([15, 10, 9]); // --color-base #0F0A09
  expect(fg).toEqual([232, 222, 212]); // --color-text #E8DED4

  // WCAG AA for body text against the dark background.
  expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
});
