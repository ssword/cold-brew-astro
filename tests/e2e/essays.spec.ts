import { test, expect } from '@playwright/test';

test('home lists the seed essay with title, excerpt, and a link to it', async ({ page }) => {
  await page.goto('/');

  const link = page.getByRole('link', { name: 'First light' });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', /\/essays\/first-light\/?$/);

  await expect(page.getByText('On the quiet moment a model first begins to see.')).toBeVisible();
});

test('clicking the essay link renders the markdown body at its own route', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'First light' }).click();

  await expect(page).toHaveURL(/\/essays\/first-light\/?$/);
  await expect(page.getByRole('heading', { level: 1, name: 'First light' })).toBeVisible();
  await expect(page.getByText('Patience is the only ingredient.')).toBeVisible();
});
