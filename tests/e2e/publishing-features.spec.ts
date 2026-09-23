import { test, expect } from '@playwright/test';

test('an essay with technical sources renders a reproducibility shelf', async ({
  page,
}) => {
  await page.goto('/essays/a-map-of-the-hedge/');

  const shelf = page.locator('[data-technical-sources]');
  await expect(
    shelf.getByRole('heading', { name: 'Reproduce or read further' }),
  ).toBeVisible();
  await expect(
    shelf.getByRole('link', {
      name: /Paper A Mathematical Theory of Communication/,
    }),
  ).toHaveAttribute('href', /^https:\/\/doi\.org\//);
  await expect(
    shelf.getByRole('link', { name: /Documentation torch\.nn\.functional\.softmax/ }),
  ).toHaveAttribute('href', /^https:\/\/pytorch\.org\//);
});

test('English and Chinese editions cross-link without changing the English URL', async ({
  page,
}) => {
  await page.goto('/essays/first-light/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(
    page.locator('[data-language-switcher]').getByRole('link', { name: '中文' }),
  ).toHaveAttribute('href', '/zh/essays/first-light/');

  await page.goto('/zh/essays/first-light/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(
    page.getByRole('heading', { level: 1, name: '初见微光' }),
  ).toBeVisible();
  await expect(page.getByText(/约 \d+ 分钟/)).toBeVisible();
  await expect(
    page
      .locator('[data-language-switcher]')
      .getByRole('link', { name: 'English' }),
  ).toHaveAttribute('href', '/essays/first-light/');
  await expect(
    page.locator('head link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute(
    'href',
    'https://coldbrew.live/essays/first-light/',
  );
});

test('localized home, tags, and feed contain the Chinese edition only', async ({
  page,
  request,
}) => {
  await page.goto('/zh/');
  await expect(page.getByRole('link', { name: '初见微光' })).toHaveAttribute(
    'href',
    '/zh/essays/first-light/',
  );

  await page.goto('/zh/tags/');
  await expect(page.getByRole('link', { name: '深度学习' })).toHaveAttribute(
    'href',
    '/zh/tags/深度学习/',
  );

  const chineseFeed = await (await request.get('/zh/rss.xml')).text();
  const englishFeed = await (await request.get('/rss.xml')).text();
  expect(chineseFeed).toContain('初见微光');
  expect(chineseFeed).toContain(
    'https://coldbrew.live/zh/essays/first-light/',
  );
  expect(englishFeed).toContain('First light');
  expect(englishFeed).not.toContain('初见微光');
});

