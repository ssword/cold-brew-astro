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

test('prose holds a reading measure while code and figures use a wider track', async ({ page }) => {
  await page.goto(ESSAY);
  const article = page.locator('article.essay');
  const para = article.locator('p').first();
  const pre = article.locator('pre').first();
  const figure = article.locator('figure').first();

  const [pw, prew, fw] = await Promise.all([
    para.evaluate((el) => el.clientWidth),
    pre.evaluate((el) => el.clientWidth),
    figure.evaluate((el) => el.clientWidth),
  ]);
  expect(pw).toBeGreaterThan(420);
  expect(pw).toBeLessThan(760); // within ~65–75ch at the body size
  expect(prew).toBeGreaterThan(pw); // code extends past the prose measure
  expect(fw).toBeGreaterThan(pw); // figure extends past the prose measure

  // Layout B: prose and wide blocks share the left edge; wide blocks reach right.
  const [paraLeft, preLeft, contentLeft] = await Promise.all([
    para.evaluate((el) => el.getBoundingClientRect().left),
    pre.evaluate((el) => el.getBoundingClientRect().left),
    article.evaluate((el) => el.getBoundingClientRect().left + parseFloat(getComputedStyle(el).paddingLeft)),
  ]);
  expect(Math.abs(paraLeft - contentLeft)).toBeLessThan(2);
  expect(Math.abs(preLeft - contentLeft)).toBeLessThan(2);
});
