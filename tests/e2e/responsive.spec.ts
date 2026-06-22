import { test, expect, type Page } from '@playwright/test';

// Small mobile, tablet, desktop — the breakpoints where layout must hold.
const WIDTHS = [360, 768, 1280];

// Content must breathe: nothing sits flush against the viewport edge, even on
// the narrowest phone. The fix gives a 1.25rem (20px) gutter; this floor is
// comfortably below that so it asserts "not flush" without pinning the value.
const MIN_GUTTER = 12;

async function expectWithinGutter(page: Page, selector: string) {
  const width = page.viewportSize()!.width;
  const box = await page.locator(selector).first().boundingBox();
  expect(box, `${selector} should be visible`).not.toBeNull();
  expect(box!.x, `${selector} left edge`).toBeGreaterThanOrEqual(MIN_GUTTER);
  expect(box!.x + box!.width, `${selector} right edge`).toBeLessThanOrEqual(width - MIN_GUTTER);
}

test('home content keeps a gutter from the viewport edge on small mobile', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/');
  // Global chrome plus every home content block. The footer's social links are
  // collapsed drawers, so we check a visible direct footer link (RSS/email).
  for (const sel of ['header a', '[data-hero] p', '[data-featured]', '[data-essay-list] li', 'footer nav > a']) {
    await expectWithinGutter(page, sel);
  }
});

test('tags index keeps a gutter from the viewport edge on small mobile', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/tags/');
  await expectWithinGutter(page, '[data-tag-index] li');
});

// Horizontal overflow: the document should never be wider than its viewport.
const overflowX = (page: Page) =>
  page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );

// The standalone page set, exercised at every breakpoint.
const PAGES = ['/', '/about/', '/now/', '/tags/'];

for (const width of WIDTHS) {
  for (const path of [...PAGES, '/essays/a-map-of-the-hedge/']) {
    test(`no horizontal scroll at ${width}px (${path})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      expect(await overflowX(page)).toBeLessThanOrEqual(1);
    });
  }

  test(`no horizontal scroll at ${width}px (tag page)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/tags/');
    const href = await page.locator('[data-tag-index] a').first().getAttribute('href');
    await page.goto(href!);
    expect(await overflowX(page)).toBeLessThanOrEqual(1);
  });
}

// Every published essay must hold at the narrowest width — code, math, tables,
// and figures are the usual overflow culprits. Slugs are discovered from the
// home page so the scan tracks the corpus without a hard-coded list.
test('no essay overflows horizontally on small mobile', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto('/');
  const hrefs = await page
    .locator('a[href^="/essays/"]')
    .evaluateAll((els) => [...new Set(els.map((a) => a.getAttribute('href')!))]);
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) {
    await page.goto(href);
    expect(await overflowX(page), `overflow on ${href}`).toBeLessThanOrEqual(1);
  }
});
