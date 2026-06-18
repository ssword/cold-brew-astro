import { test, expect } from '@playwright/test';

test('home shows the site title (as a home link) and the tagline', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('link', { name: 'cold brew' })).toBeVisible();
  await expect(page.getByText('let it steep')).toBeVisible();
});
