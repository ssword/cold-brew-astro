import { test, expect, type Locator } from '@playwright/test';

const fontFamily = (loc: Locator) => loc.evaluate((el) => getComputedStyle(el).fontFamily);

test('typography roles map to the three self-hosted fonts, with a CJK fallback slot', async ({ page }) => {
  await page.goto('/essays/first-light/');

  const title = page.getByRole('link', { name: 'cold brew' }); // masthead → display
  const heading = page.getByRole('heading', { level: 1, name: 'First light' }); // display
  const body = page.locator('article p').first(); // body → reading serif
  const footer = page.locator('footer'); // UI/metadata → sans

  expect(await fontFamily(heading)).toMatch(/Fraunces/);
  expect(await fontFamily(title)).toMatch(/Fraunces/);
  expect(await fontFamily(body)).toMatch(/Newsreader/);
  expect(await fontFamily(footer)).toMatch(/IBM Plex Sans/);

  // The body chain leaves room for a future CJK family.
  expect(await fontFamily(body)).toMatch(/Noto Serif SC|Songti SC/);

  // Fonts are self-hosted (no external request) and actually load.
  const loaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return {
      display: document.fonts.check('1rem "Fraunces Variable"'),
      bodyFont: document.fonts.check('1rem "Newsreader Variable"'),
      ui: document.fonts.check('1rem "IBM Plex Sans Variable"'),
    };
  });
  expect(loaded).toEqual({ display: true, bodyFont: true, ui: true });
});
