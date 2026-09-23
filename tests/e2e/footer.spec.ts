import { test, expect } from '@playwright/test';
import { parseRgb } from './_utils';

test('footer drawers link to GitHub (ssword) and Twitter (sswordme) in sand', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer');

  // Socials live in expandable drawers: open each, then read the profile link.
  await footer.getByRole('group').filter({ hasText: /github/i }).locator('summary').click();
  const github = footer.getByRole('link', { name: /visit profile/i }).first();
  await expect(github).toHaveAttribute('href', /github\.com\/ssword/);

  await footer.getByRole('group').filter({ hasText: /twitter/i }).locator('summary').click();
  const twitter = footer.getByRole('group').filter({ hasText: /twitter/i }).getByRole('link');
  await expect(twitter).toHaveAttribute('href', /(?:twitter|x)\.com\/sswordme/);

  // sand accent #D4BDA6 on the drawer action link
  expect(parseRgb(await github.evaluate((el) => getComputedStyle(el).color))).toEqual([212, 189, 166]);
});

test('footer links show a visible focus ring under keyboard navigation', async ({ page }) => {
  await page.goto('/');
  // The RSS link is always visible in the footer (the socials are collapsed
  // drawers); it's the stable target for the keyboard-focus check.
  const rss = page.locator('footer').getByRole('link', { name: /rss/i });

  // Tab through the page so :focus-visible applies, then stop on the RSS link.
  // The cap scales with the page's focusable count so it survives a growing essay list.
  const focusables = await page
    .locator('a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])')
    .count();
  for (let i = 0; i < focusables + 4 && !(await rss.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press('Tab');
  }
  await expect(rss).toBeFocused();

  const outlineWidth = await rss.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth));
  expect(outlineWidth).toBeGreaterThan(0);
});
