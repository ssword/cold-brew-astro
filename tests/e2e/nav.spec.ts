import { test, expect } from '@playwright/test';

test('the masthead nav links to Essays, About, and Now in the UI font', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: /primary/i });

  const essays = nav.getByRole('link', { name: 'Essays' });
  const about = nav.getByRole('link', { name: 'About' });
  const now = nav.getByRole('link', { name: 'Now' });

  await expect(essays).toHaveAttribute('href', '/');
  await expect(about).toHaveAttribute('href', '/about/');
  await expect(now).toHaveAttribute('href', '/now/');

  // navigation metadata uses the mono type role (JetBrains Mono)
  expect(await about.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/JetBrains Mono/);
});

test('the masthead nav navigates to the About and Now pages', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('navigation', { name: /primary/i }).getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL(/\/about\/?$/);
  await expect(page.getByRole('heading', { level: 1, name: 'About' })).toBeVisible();

  await page.getByRole('navigation', { name: /primary/i }).getByRole('link', { name: 'Now' }).click();
  await expect(page).toHaveURL(/\/now\/?$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Now' })).toBeVisible();
});
