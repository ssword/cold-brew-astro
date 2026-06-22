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

test('code blocks use the cold-brew Shiki theme', async ({ page }) => {
  await page.goto(ESSAY);
  const pre = page.locator('article.essay pre').first();

  const bg = await pre.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(parseRgb(bg)).toEqual([27, 19, 17]); // panel #1B1311

  const tokenColors = await pre
    .locator('span')
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).color));
  const rgbs = tokenColors.map(parseRgb);
  expect(rgbs).toContainEqual([217, 145, 74]); // copper keyword #D9914A
});

test('inline and display math render via KaTeX, fully self-hosted', async ({ page }) => {
  const thirdParty: string[] = [];
  page.on('request', (req) => {
    const url = new URL(req.url());
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return; // ignore data:/blob:
    if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') thirdParty.push(req.url());
  });

  await page.goto(ESSAY);

  await expect(page.locator('.katex').first()).toBeVisible(); // inline math
  await expect(page.locator('.katex-display').first()).toBeVisible(); // display math

  // Display math sits in the wider track, not the prose measure.
  const [eqWidth, paraWidth] = await Promise.all([
    page.locator('article.essay .katex-display').first().evaluate((el) => el.clientWidth),
    page.locator('article.essay p').first().evaluate((el) => el.clientWidth),
  ]);
  expect(eqWidth).toBeGreaterThan(paraWidth);

  expect(await page.locator('script[src*="katex" i]').count()).toBe(0); // no client-side math JS
  expect(thirdParty, `unexpected third-party requests: ${thirdParty.join(', ')}`).toHaveLength(0);
});

test('footnotes are collected and styled at the foot of the essay', async ({ page }) => {
  await page.goto(ESSAY);

  const section = page.locator('article.essay section[data-footnotes]');
  await expect(section).toBeVisible();

  // A reference links to a definition that exists, and the definition links back.
  const ref = page.locator('a[data-footnote-ref]').first();
  const href = await ref.getAttribute('href');
  expect(href).toMatch(/^#/);
  const def = page.locator(href as string);
  await expect(def).toBeVisible();
  await expect(def.locator('a[data-footnote-backref]')).toHaveCount(1);

  // Styled distinctly from body text: a top hairline separator.
  const borderTopWidth = await section.evaluate((el) => parseFloat(getComputedStyle(el).borderTopWidth));
  expect(borderTopWidth).toBeGreaterThan(0);
});

test('pull-quotes are visually distinct from body text', async ({ page }) => {
  await page.goto(ESSAY);
  const quote = page.locator('article.essay blockquote').first();
  await expect(quote).toBeVisible();

  const { borderLeftColor, borderLeftWidth, fontStyle } = await quote.evaluate((el) => {
    const s = getComputedStyle(el);
    return { borderLeftColor: s.borderLeftColor, borderLeftWidth: s.borderLeftWidth, fontStyle: s.fontStyle };
  });
  expect(parseRgb(borderLeftColor)).toEqual([212, 189, 166]); // sand #D4BDA6
  expect(parseFloat(borderLeftWidth)).toBeGreaterThan(0);
  expect(fontStyle).toBe('italic');
});
