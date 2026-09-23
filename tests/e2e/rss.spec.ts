import { test, expect } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';

// Built feed is the high seam. selectEssays already enforces draft-filtering and
// newest-first ordering (unit-tested); here we verify the feed reflects that.

const stripCdata = (s: string) => s.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();

async function getFeed(request: APIRequestContext): Promise<string> {
  const res = await request.get('/rss.xml');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('xml');
  return res.text();
}

test('the RSS feed lists published essays and excludes drafts', async ({ request }) => {
  const xml = await getFeed(request);
  const titles = [...xml.matchAll(/<title>([\s\S]*?)<\/title>/g)].map((m) => stripCdata(m[1]));

  expect(titles).toContain('First light'); // brewed
  expect(titles).toContain('The long steep'); // steeping
  expect(titles).not.toContain('An unfinished thought'); // draft
});

test('the RSS feed is ordered newest-first', async ({ request }) => {
  const xml = await getFeed(request);
  const dates = [...xml.matchAll(/<pubDate>([\s\S]*?)<\/pubDate>/g)].map((m) => new Date(m[1]).getTime());

  expect(dates.length).toBeGreaterThan(1);
  expect(dates).toEqual([...dates].sort((a, b) => b - a));
});

test('feed items link to canonical essay URLs', async ({ request }) => {
  const xml = await getFeed(request);
  expect(xml).toContain('https://coldbrew.live/essays/first-light/');
});

test('the main feed contains complete rendered essays, categories, and revision dates', async ({
  request,
}) => {
  const xml = await getFeed(request);

  expect(xml).toContain('<content:encoded>');
  expect(xml).toContain('In an earlier piece I left a claim steeping');
  expect(xml).toContain('astro-code');
  expect(xml).toContain('<category>uncertainty</category>');
  expect(xml).toContain(
    '<atom:updated>2026-07-30T00:00:00.000Z</atom:updated>',
  );
});

test('a per-tag feed contains only that tag’s essays in newest-first order', async ({
  request,
}) => {
  const res = await request.get('/tags/language-models/rss.xml');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('xml');
  const xml = await res.text();

  expect(xml).toContain('A map of the hedge');
  expect(xml).toContain('The long steep');
  expect(xml).not.toContain('First light');
  expect(xml).toContain('<content:encoded>');

  expect(xml.indexOf('A map of the hedge')).toBeLessThan(
    xml.indexOf('The long steep'),
  );
});
