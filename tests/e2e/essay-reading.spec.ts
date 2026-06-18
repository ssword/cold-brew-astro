import { test, expect } from '@playwright/test';
import { parseRgb } from './_utils';

const ESSAY = '/essays/a-map-of-the-hedge/';

test('essay ends with a quiet reply-by-email prompt', async ({ page }) => {
  await page.goto(ESSAY);
  const reply = page.locator('article.essay .essay-reply');
  await expect(reply).toBeVisible();
  const link = reply.getByRole('link', { name: /reply by email/i });
  await expect(link).toHaveAttribute('href', 'mailto:ssword@gmail.com');
});
