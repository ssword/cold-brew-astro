import { test, expect } from '@playwright/test';

// E2E runs against the production build (see playwright.config.ts): drafts are
// absent, so tags carried only by a draft must not surface anywhere.

test('the tag index lists every published tag and excludes draft-only tags', async ({ page }) => {
  await page.goto('/tags/');

  // Published tags only, alphabetical. "notes" lives solely on a draft, so it is absent.
  await expect(page.locator('[data-tag-index] a')).toHaveText([
    'deep learning',
    'language models',
    'training',
    'uncertainty',
  ]);

  await expect(page.getByRole('link', { name: 'language models' })).toHaveAttribute(
    'href',
    /\/tags\/language-models\/?$/,
  );
});

test('a per-tag page lists its essays newest-first with reading time and the steeping tag', async ({
  page,
}) => {
  await page.goto('/tags/language-models/');

  await expect(page.getByRole('heading', { level: 1, name: 'language models' })).toBeVisible();

  // Newest-first: "A map of the hedge" (2026-06-19) before "The long steep" (2026-05-20).
  await expect(page.locator('[data-essay-list] > li a.font-display')).toHaveText([
    'A map of the hedge',
    'The long steep',
  ]);

  // The long steep is steeping, so exactly one steeping tag shows on this listing.
  await expect(page.locator('[data-status="steeping"]')).toHaveCount(1);
  await expect(page.getByText(/\d+ min read/).first()).toBeVisible();
});

test('a tag carried only by a draft has no page in production', async ({ page }) => {
  const res = await page.goto('/tags/notes/');
  expect(res?.status()).toBe(404);
});

test('tags on an essay link to their tag pages', async ({ page }) => {
  await page.goto('/essays/first-light/');

  const tags = page.locator('[data-essay-tags]');
  await expect(tags.getByRole('link', { name: 'deep learning' })).toHaveAttribute(
    'href',
    /\/tags\/deep-learning\/?$/,
  );
  await expect(tags.getByRole('link', { name: 'training' })).toHaveAttribute(
    'href',
    /\/tags\/training\/?$/,
  );
});
