import { test, expect } from '@playwright/test';
import { parseRgb } from './_utils';

test('footer links to GitHub (ssword) and Twitter (sswordme) in copper', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer');

  const github = footer.getByRole('link', { name: /github/i });
  const twitter = footer.getByRole('link', { name: /twitter/i });

  await expect(github).toHaveAttribute('href', /github\.com\/ssword/);
  await expect(twitter).toHaveAttribute('href', /(?:twitter|x)\.com\/sswordme/);

  // copper accent #D9914A
  expect(parseRgb(await github.evaluate((el) => getComputedStyle(el).color))).toEqual([217, 145, 74]);
});

test('footer links show a visible focus ring under keyboard navigation', async ({ page }) => {
  await page.goto('/');
  const github = page.locator('footer').getByRole('link', { name: /github/i });

  // Tab through the page so :focus-visible applies, then stop on the GitHub link.
  for (let i = 0; i < 12 && !(await github.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press('Tab');
  }
  await expect(github).toBeFocused();

  const outlineWidth = await github.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth));
  expect(outlineWidth).toBeGreaterThan(0);
});
