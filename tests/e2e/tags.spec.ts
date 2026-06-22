import { test, expect } from '@playwright/test';

// E2E runs against the production build (see playwright.config.ts): drafts are
// absent, so tags carried only by a draft must not surface anywhere.

test('the tag index lists published tags alphabetically and excludes draft-only tags', async ({ page }) => {
  await page.goto('/tags/');

  const tags = (await page.locator('[data-tag-index] a').allTextContents()).map((t) => t.trim());

  // Alphabetical, drawn only from published essays. "notes" lives solely on a draft.
  expect(tags).toEqual([...tags].sort());
  expect(tags).toEqual(
    expect.arrayContaining(['deep learning', 'language models', 'statistics', 'training', 'uncertainty']),
  );
  expect(tags).not.toContain('notes');

  await expect(page.getByRole('link', { name: 'language models' })).toHaveAttribute(
    'href',
    /\/tags\/language-models\/?$/,
  );
});

test('a per-tag page lists its essays newest-first, badging only the steeping ones', async ({
  page,
}) => {
  await page.goto('/tags/language-models/');

  await expect(page.getByRole('heading', { level: 1, name: 'language models' })).toBeVisible();

  const titles = (
    await page.locator('[data-essay-list] > li h2 a').allTextContents()
  ).map((t) => t.trim());

  // Newest-first: "A map of the hedge" (2026-06-19) before "The long steep" (2026-05-20).
  expect(titles).toEqual(expect.arrayContaining(['A map of the hedge', 'The long steep']));
  expect(titles.indexOf('A map of the hedge')).toBeLessThan(titles.indexOf('The long steep'));

  // The badge marks steeping essays only: it appears on The long steep, not on the brewed A map of the hedge.
  const longSteep = page.locator('[data-essay-list] > li', { hasText: 'The long steep' });
  await expect(longSteep.locator('[data-status="steeping"]')).toHaveCount(1);
  const aMap = page.locator('[data-essay-list] > li', { hasText: 'A map of the hedge' });
  await expect(aMap.locator('[data-status="steeping"]')).toHaveCount(0);

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
