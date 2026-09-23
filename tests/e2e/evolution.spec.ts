import { test, expect } from '@playwright/test';

test('a revised essay keeps its publication date and exposes a revision ledger', async ({
  page,
}) => {
  await page.goto('/essays/the-long-steep/');

  const meta = page.locator('.essay-meta');
  await expect(meta).toContainText('May 20, 2026');
  await expect(meta.locator('[data-last-revised]')).toHaveText(
    'Revised July 30, 2026',
  );

  const ledger = page.locator('[data-revision-ledger]');
  await expect(
    ledger.getByRole('heading', { name: 'Revision notes' }),
  ).toBeVisible();
  await expect(ledger).toContainText('measurable entropy argument');
});

test('series navigation and curated related essays form an explicit trail', async ({
  page,
}) => {
  await page.goto('/essays/the-long-steep/');

  const firstTrail = page.locator('[data-essay-trail]');
  await expect(
    firstTrail.getByRole('heading', { name: 'Measuring uncertainty' }),
  ).toBeVisible();
  await expect(firstTrail).toContainText('Part 1 of 2');
  await expect(firstTrail.locator('[data-trail-previous]')).toHaveCount(0);
  await expect(firstTrail.locator('[data-trail-next]')).toHaveAttribute(
    'href',
    '/essays/a-map-of-the-hedge/',
  );
  await expect(
    firstTrail.getByRole('link', {
      name: 'Scaling laws taught me patience',
    }),
  ).toBeVisible();

  await page.goto('/essays/a-map-of-the-hedge/');

  const secondTrail = page.locator('[data-essay-trail]');
  await expect(secondTrail).toContainText('Part 2 of 2');
  await expect(secondTrail.locator('[data-trail-previous]')).toHaveAttribute(
    'href',
    '/essays/the-long-steep/',
  );
  await expect(secondTrail.locator('[data-trail-next]')).toHaveCount(0);
  await expect(
    secondTrail.getByRole('link', { name: 'Attention is not understanding' }),
  ).toBeVisible();
});
