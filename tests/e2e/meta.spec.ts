import { test, expect, type Page } from '@playwright/test';

// Built output is the high test seam (see playwright.config.ts). These assert
// the shared head emits absolute-URL social meta so shared links unfurl, and
// that the feed is discoverable.

const SITE = 'https://coldbrew.live';

const content = (page: Page, selector: string) =>
  page.locator(selector).first().getAttribute('content');

test('essay pages emit Open Graph + Twitter meta for unfurling', async ({ page }) => {
  await page.goto('/essays/first-light/');

  expect(await content(page, 'meta[property="og:title"]')).toContain('First light');
  expect(await content(page, 'meta[property="og:description"]')).toContain('model first begins to see');
  expect(await content(page, 'meta[property="og:type"]')).toBe('article');
  expect(await content(page, 'meta[property="og:url"]')).toBe(`${SITE}/essays/first-light/`);

  // Absolute image URL — relative paths do not render on most platforms.
  expect(await content(page, 'meta[property="og:image"]')).toBe(`${SITE}/og.png`);

  expect(await content(page, 'meta[name="twitter:card"]')).toBe('summary_large_image');
  expect(await content(page, 'meta[name="twitter:image"]')).toBe(`${SITE}/og.png`);
});

test('non-essay pages default og:type to website', async ({ page }) => {
  await page.goto('/about/');
  expect(await content(page, 'meta[property="og:type"]')).toBe('website');
});

test('the RSS feed is discoverable from the document head', async ({ page }) => {
  await page.goto('/');
  const link = page.locator('link[rel="alternate"][type="application/rss+xml"]');
  await expect(link).toHaveCount(1);
  expect(await link.getAttribute('href')).toBe(`${SITE}/rss.xml`);
});

test('the default social image is served', async ({ page }) => {
  const res = await page.request.get('/og.png');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('image/png');
});
