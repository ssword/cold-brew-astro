import { test, expect, type Page } from '@playwright/test';

// The Chinese edition's search, against the production build.

const results = (page: Page) => page.getByRole('list', { name: '搜索结果' });

async function search(page: Page, query: string) {
  await page.getByRole('searchbox', { name: '搜索文章' }).fill(query);
}

test('a Chinese phrase inside unspaced body text finds the Chinese edition', async ({ page }) => {
  await page.goto('/zh/search/');
  // From the middle of a sentence in the body of 初见微光; Chinese has no spaces to split on.
  await search(page, '催促一壶冷萃');

  const link = results(page).getByRole('link');
  await expect(link).toHaveText(['初见微光']);
  await expect(link).toHaveAttribute('href', '/zh/essays/first-light/');
  await expect(page.getByRole('status')).toHaveText('找到 1 篇文章');
});

test('Chinese titles and tags are searchable', async ({ page }) => {
  await page.goto('/zh/search/');
  await search(page, '微光');
  await expect(results(page).getByRole('link')).toHaveText(['初见微光']);

  await search(page, '深度学习');
  await expect(results(page).getByRole('link')).toHaveText(['初见微光']);
});

test('each edition searches only its own essays', async ({ page, request }) => {
  const zh = await (await request.get('/search-index/zh.json')).json();
  expect(zh.lang).toBe('zh-CN');
  expect(zh.documents.map((d: { title: string }) => d.title)).toEqual(['初见微光']);

  // The English original of the same essay is not in the Chinese edition.
  await page.goto('/zh/search/');
  await search(page, 'the slope is real');
  await expect(page.getByRole('status')).toHaveText('没有与“the slope is real”匹配的文章。试试更短的词，或按标签浏览。');

  // And the Chinese text is not in the English edition.
  await page.goto('/search/');
  await page.getByRole('searchbox', { name: 'Search essays' }).fill('冷萃');
  await expect(page.getByRole('status')).toHaveText(/Nothing matches/);
});

test('the Chinese search explains the empty and no-result states in Chinese', async ({ page }) => {
  await page.goto('/zh/search/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.getByRole('heading', { level: 1, name: '搜索' })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText(/搜索只在本浏览器中进行/);
  await expect(results(page).getByRole('listitem')).toHaveCount(0);

  await search(page, '量子');
  await expect(page.getByRole('status')).toHaveText(/没有与“量子”匹配的文章/);
  await expect(page.getByRole('link', { name: '按标签浏览' })).toHaveAttribute('href', '/zh/tags/');
});

test('the Chinese masthead links to the Chinese search', async ({ page }) => {
  await page.goto('/zh/');
  const nav = page.getByRole('navigation', { name: '主导航' });
  await nav.getByRole('link', { name: '搜索' }).click();

  await expect(page).toHaveURL(/\/zh\/search\/$/);
  await search(page, '微光');
  await expect(results(page).getByRole('link')).toHaveText(['初见微光']);
});
