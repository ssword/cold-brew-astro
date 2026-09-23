import { test, expect } from '@playwright/test';
import { parseRgb, contrastRatio } from './_utils';

// --color-sand #d4bda6 — the focus ring color set by the global :focus-visible
// rule. Asserting it (not just "some outline") guards our rule specifically,
// rather than passing on whatever the browser's default ring happens to be.
const SAND: [number, number, number] = [212, 189, 166];

test('interactive elements show a visible sand focus ring under keyboard navigation', async ({
  page,
}) => {
  // The essay page is the richest: masthead, primary nav, tag links, in-prose
  // links, the reply-by-email link, and footer links all live on it.
  await page.goto('/essays/a-map-of-the-hedge/');

  const tags = new Set<string>();
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const s = getComputedStyle(el);
      return {
        tag: el.tagName,
        label: el.textContent?.trim().slice(0, 32) ?? '',
        outlineStyle: s.outlineStyle,
        outlineWidth: parseFloat(s.outlineWidth),
        outlineColor: s.outlineColor,
      };
    });
    if (!focused) continue;
    tags.add(focused.tag);

    const where = `${focused.tag} "${focused.label}"`;
    expect(focused.outlineStyle, `${where} outline-style`).not.toBe('none');
    expect(focused.outlineWidth, `${where} outline-width`).toBeGreaterThanOrEqual(2);
    expect(parseRgb(focused.outlineColor), `${where} outline-color`).toEqual(SAND);
  }

  // We actually tabbed onto real links, not just empty stops.
  expect(tags.has('A')).toBe(true);
});

// theme.spec.ts already guards the primary cream body text. The muted token is
// the palette's most marginal text color (used for metadata, captions, counts),
// so it's the one worth pinning against the AA floor.
test('muted secondary text meets the AA contrast floor against the background', async ({ page }) => {
  await page.goto('/');
  const body = page.locator('body');
  const bg = parseRgb(await body.evaluate((el) => getComputedStyle(el).backgroundColor));

  const muted = page.locator('.text-muted').first(); // the hero/meta muted text
  const fg = parseRgb(await muted.evaluate((el) => getComputedStyle(el).color));

  expect(fg).toEqual([158, 135, 116]); // --color-muted #9E8774
  expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
});
