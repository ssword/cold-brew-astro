import { test, expect } from '@playwright/test';

test('home shows the site title (as a home link) and the tagline', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('link', { name: 'cold brew' })).toBeVisible();
  await expect(page.locator('header').getByText('let it steep')).toBeVisible();
});

test('home opens with a hero stating the philosophy and the tagline', async ({ page }) => {
  await page.goto('/');

  const hero = page.locator('[data-hero]');
  await expect(hero).toContainText('slow, considered writing on deep learning');
  await expect(hero.getByText('let it steep')).toBeVisible();
});

test('home features the latest essay prominently with its excerpt and reading time', async ({ page }) => {
  await page.goto('/');

  const featured = page.locator('[data-featured]');
  const link = featured.getByRole('link', { name: 'A map of the hedge' });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', /\/essays\/a-map-of-the-hedge\/?$/);
  await expect(featured).toContainText('Putting a number on the thing the last essay only gestured at.');
  await expect(featured.getByText(/\d+ min read/)).toBeVisible();
});

test('lists the remaining essays newest-first, excluding the featured one', async ({ page }) => {
  await page.goto('/');

  const list = page.locator('[data-essay-list]');

  // The featured essay is presented above and is not duplicated in the list.
  await expect(list.getByRole('link', { name: 'A map of the hedge' })).toHaveCount(0);

  // The rest of the published corpus surfaces here (the set may grow or shrink;
  // we assert ordering behavior, not a fixed list of titles).
  const titles = (await list.locator('li h2 a').allTextContents()).map((t) => t.trim());
  expect(titles.length).toBeGreaterThan(1);

  // Newest-first: First light (2026-06-01) precedes The long steep (2026-05-20).
  expect(titles).toContain('First light');
  expect(titles).toContain('The long steep');
  expect(titles.indexOf('First light')).toBeLessThan(titles.indexOf('The long steep'));

  // Each list item carries its excerpt and reading time.
  const longSteep = list.locator('li', { hasText: 'The long steep' });
  await expect(longSteep).toContainText('Why some ideas should be left to sit before they are served.');
  await expect(longSteep.getByText(/\d+ min read/)).toBeVisible();
});
