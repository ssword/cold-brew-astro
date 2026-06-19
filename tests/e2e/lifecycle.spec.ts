import { test, expect } from '@playwright/test';

// These run against the production build (see playwright.config.ts), so drafts
// must be absent and the lifecycle surfacing must match production behavior.

test('drafts are absent from the production build', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'An unfinished thought' })).toHaveCount(0);

  const res = await page.goto('/essays/an-unfinished-thought/');
  expect(res?.status()).toBe(404);
});

test('the copper steeping tag shows only on steeping essays', async ({ page }) => {
  // Home listing: a steeping essay carries the tag; a brewed one does not.
  await page.goto('/');
  const longSteep = page.locator('[data-essay-list] > li', { hasText: 'The long steep' });
  await expect(longSteep.locator('[data-status="steeping"]')).toHaveCount(1);
  const firstLight = page.locator('[data-essay-list] > li', { hasText: 'First light' });
  await expect(firstLight.locator('[data-status="steeping"]')).toHaveCount(0);

  // The steeping essay's own page shows the tag.
  await page.goto('/essays/the-long-steep/');
  await expect(page.locator('[data-status="steeping"]')).toBeVisible();

  // A brewed essay shows no tag — even though its prose mentions "steeping".
  await page.goto('/essays/first-light/');
  await expect(page.locator('[data-status="steeping"]')).toHaveCount(0);
});

test('reading time appears on listings and on the essay page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/\d+ min read/).first()).toBeVisible();

  await page.goto('/essays/first-light/');
  await expect(page.getByText(/\d+ min read/)).toBeVisible();
});
