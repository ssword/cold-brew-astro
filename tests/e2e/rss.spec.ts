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
