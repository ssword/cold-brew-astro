import { test, expect } from '@playwright/test';
import { parseRgb } from './_utils';

const ESSAY = '/essays/a-map-of-the-hedge/';
const ZH_ESSAY = '/zh/essays/first-light/';
const SAND: [number, number, number] = [212, 189, 166];

for (const { path, name } of [
  { path: ESSAY, name: 'Print or save as PDF' },
  { path: ZH_ESSAY, name: '打印或存为 PDF' },
]) {
  test(`the print action on ${path} opens the browser print flow from the keyboard`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      (window as unknown as { printCalls: number }).printCalls = 0;
      window.print = () => {
        (window as unknown as { printCalls: number }).printCalls++;
      };
    });
    await page.goto(path);
    const action = page.getByRole('button', { name });
    await expect(action).toBeVisible();

    await action.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(action).toBeFocused();
    const ring = await action.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        style: s.outlineStyle,
        width: parseFloat(s.outlineWidth),
        color: s.outlineColor,
      };
    });
    expect(ring.style).not.toBe('none');
    expect(ring.width).toBeGreaterThanOrEqual(2);
    expect(parseRgb(ring.color)).toEqual(SAND);

    await page.keyboard.press('Enter');
    expect(
      await page.evaluate(() => (window as unknown as { printCalls: number }).printCalls),
    ).toBe(1);
  });
}

test.describe('print media', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ media: 'print' });
  });

  test('printing an essay drops the site chrome and reader controls', async ({ page }) => {
    await page.goto(ESSAY);
    for (const selector of [
      'body > header',
      'body > footer',
      '[data-atmosphere]',
      '[data-reader-dock]',
      '.reader-progress',
      '.essay-reply',
    ]) {
      await expect(page.locator(selector).first()).toBeHidden();
    }
  });

  test('printing an essay keeps the article, code, figures, and sources', async ({ page }) => {
    await page.goto(ESSAY);
    const article = page.locator('article.essay');
    await expect(article.locator('h1')).toBeVisible();
    await expect(article.locator('pre').first()).toBeVisible();
    await expect(article.locator('figure').first()).toBeVisible();
    await expect(page.locator('[data-technical-sources]')).toBeVisible();
  });

  test('printed prose is dark ink on a white page', async ({ page }) => {
    await page.goto(ESSAY);
    const [body, ink] = await Promise.all([
      page.locator('body').evaluate((el) => getComputedStyle(el).backgroundColor),
      page
        .locator('article.essay p')
        .first()
        .evaluate((el) => getComputedStyle(el).color),
    ]);
    expect(parseRgb(body)).toEqual([255, 255, 255]);
    const [r, g, b] = parseRgb(ink);
    expect(Math.max(r, g, b)).toBeLessThan(60);
  });
});
