import { test, expect } from '@playwright/test';

type Rgb = [number, number, number];

function parseRgb(s: string): Rgb {
  const m = s.match(/(\d+(?:\.\d+)?)/g);
  if (!m || m.length < 3) throw new Error(`cannot parse color: ${s}`);
  return [Number(m[0]), Number(m[1]), Number(m[2])];
}

function relativeLuminance([r, g, b]: Rgb): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

test('home applies the cold brew palette tokens with a readable contrast floor', async ({ page }) => {
  await page.goto('/');
  const body = page.locator('body');

  const bg = parseRgb(await body.evaluate((el) => getComputedStyle(el).backgroundColor));
  const fg = parseRgb(await body.evaluate((el) => getComputedStyle(el).color));

  expect(bg).toEqual([18, 13, 10]); // --color-base #120D0A
  expect(fg).toEqual([234, 224, 210]); // --color-cream #EAE0D2

  // WCAG AA for body text against the dark background.
  expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
});
