import { test, expect } from '@playwright/test';

// @astrojs/sitemap derives the sitemap from the built pages, so drafts (never
// built in production) are excluded for free. We assert public pages are listed.

test('a sitemap index is generated', async ({ request }) => {
  const res = await request.get('/sitemap-index.xml');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('xml');
  expect(await res.text()).toContain('sitemap-0.xml');
});

test('the sitemap covers public pages and excludes drafts', async ({ request }) => {
  const res = await request.get('/sitemap-0.xml');
  expect(res.status()).toBe(200);
  const xml = await res.text();

  expect(xml).toContain('<loc>https://coldbrew.live/</loc>');
  expect(xml).toContain('<loc>https://coldbrew.live/about/</loc>');
  expect(xml).toContain('<loc>https://coldbrew.live/now/</loc>');
  expect(xml).toContain('<loc>https://coldbrew.live/essays/first-light/</loc>');

  expect(xml).not.toContain('an-unfinished-thought'); // draft is never built
});
