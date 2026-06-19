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

  // The remaining published essays appear, newest-first.
  const titles = (await list.locator('li > a').allTextContents()).map((t) => t.trim());
  expect(titles).toEqual(['First light', 'The long steep']);

  // Each list item carries its excerpt and reading time.
  const longSteep = list.locator('li', { hasText: 'The long steep' });
  await expect(longSteep).toContainText('Why some ideas should be left to sit before they are served.');
  await expect(longSteep.getByText(/\d+ min read/)).toBeVisible();
});
