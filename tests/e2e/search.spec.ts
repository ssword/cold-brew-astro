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
