import { test, expect, type Page } from '@playwright/test';

// Search runs against the production build: drafts are never in the index.

const results = (page: Page) => page.getByRole('list', { name: 'Search results' });

async function search(page: Page, query: string) {
  await page.getByRole('searchbox', { name: 'Search essays' }).fill(query);
}

test('a title query finds the essay and links to its canonical route', async ({ page }) => {
  await page.goto('/search/');
  await search(page, 'gradient descent');

  const link = results(page).getByRole('link', {
    name: /Gradient descent is a kind of humility/,
  });
  await expect(link).toHaveAttribute('href', '/essays/gradient-descent-is-a-kind-of-humility/');
});

test('an empty query explains what to do instead of listing everything', async ({ page }) => {
  await page.goto('/search/');

  await expect(page.getByRole('status')).toHaveText(/title, an excerpt, or a tag/);
  await expect(results(page).getByRole('listitem')).toHaveCount(0);

  await search(page, 'statistics');
  await expect(results(page).getByRole('listitem')).not.toHaveCount(0);
  await search(page, '   ');
  await expect(results(page).getByRole('listitem')).toHaveCount(0);
  await expect(page.getByRole('status')).toHaveText(/title, an excerpt, or a tag/);
});

test('a query with no match says so and points back to browsing', async ({ page }) => {
  await page.goto('/search/');
  await search(page, 'zzzyzzx');

  await expect(page.getByRole('status')).toHaveText(/Nothing matches “zzzyzzx”/);
  await expect(results(page).getByRole('listitem')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Browse by tag' })).toHaveAttribute('href', '/tags/');
});

test('a tag query finds every essay carrying the tag, case-insensitively', async ({ page }) => {
  await page.goto('/search/');
  await search(page, 'STATISTICS');

  // Both carry the tag and nothing else matches, so the equal scores fall back
  // to newest first: p < 0.05 (2026-04-08) before the CLT (2026-02-26).
  await expect(results(page).getByRole('link')).toHaveText([
    'Why I stopped trusting p < 0.05',
    'The central limit theorem still surprises me',
  ]);
  await expect(page.getByRole('status')).toHaveText('2 essays found');
});

test('an excerpt-only phrase finds its essay', async ({ page }) => {
  await page.goto('/search/');
  // Appears only in the excerpt of "Why I stopped trusting p < 0.05".
  await search(page, 'agreed to forget');

  await expect(results(page).getByRole('link')).toHaveText(['Why I stopped trusting p < 0.05']);
  await expect(page.getByRole('status')).toHaveText('1 essay found');
});

test('title matches rank above tag and excerpt matches, and order is stable', async ({ page }) => {
  await page.goto('/search/');
  // "Attention is not understanding" has it in its title; others only in tags or excerpts.
  await search(page, 'attention');
  const links = results(page).getByRole('link');
  await expect(links.first()).toHaveText('Attention is not understanding');
  const first = await links.allTextContents();

  await search(page, '');
  await search(page, 'attention');
  await expect(links.first()).toHaveText('Attention is not understanding');
  expect(await links.allTextContents()).toEqual(first);
});

test('drafts are absent from the index and from results', async ({ page, request }) => {
  const index = await (await request.get('/search-index/en.json')).json();
  const titles = index.documents.map((d: { title: string }) => d.title);
  expect(titles).toContain('First light');
  expect(titles).not.toContain('An unfinished thought');
  // The English index holds only the English edition.
  expect(titles).not.toContain('初见微光');

  await page.goto('/search/');
  await search(page, 'unfinished');
  await expect(page.getByRole('status')).toHaveText(/Nothing matches/);
  await search(page, 'notes');
  await expect(page.getByRole('status')).toHaveText(/Nothing matches/);
});

test('a reader can search and open a result with the keyboard alone', async ({ page }) => {
  await page.goto('/search/');
  await page.getByRole('searchbox', { name: 'Search essays' }).focus();
  await page.keyboard.type('central limit');
  await expect(page.getByRole('status')).toHaveText('1 essay found');

  // The query control shows the site's visible keyboard focus ring.
  const ring = await page
    .getByRole('searchbox', { name: 'Search essays' })
    .evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(ring).not.toBe('none');

  await page.keyboard.press('Tab');
  await expect(
    results(page).getByRole('link', { name: 'The central limit theorem still surprises me' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/\/essays\/the-central-limit-theorem-still-surprises-me\/$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'The central limit theorem still surprises me' }),
  ).toBeVisible();
});

test('the query is kept in the URL so a search can be reloaded or shared', async ({ page }) => {
  await page.goto('/search/?q=humility');

  await expect(page.getByRole('searchbox', { name: 'Search essays' })).toHaveValue('humility');
  await expect(results(page).getByRole('link')).toHaveText(['Gradient descent is a kind of humility']);

  await search(page, 'bell');
  await expect(page).toHaveURL(/\?q=bell$/);
});

test('searching sends no request carrying the query', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (req) => requests.push(req.url()));
  await page.goto('/search/');

  await search(page, 'gradient descent');
  await expect(results(page).getByRole('listitem')).toHaveCount(1);

  expect(requests.filter((url) => /gradient/.test(url))).toEqual([]);
  expect(requests.every((url) => new URL(url).origin === new URL(page.url()).origin)).toBe(true);
});

test('the masthead offers search quietly beside the other sections', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: /primary/i });
  await nav.getByRole('link', { name: 'Search' }).click();

  await expect(page).toHaveURL(/\/search\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Search' })).toBeVisible();
  // Reached via a ClientRouter navigation, the search still initialises.
  await search(page, 'humility');
  await expect(results(page).getByRole('link')).toHaveText(['Gradient descent is a kind of humility']);
});
