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

  for (const path of [ESSAY, ZH_ESSAY]) {
    test(`printed ${path} names the site and author alongside the title`, async ({ page }) => {
      await page.goto(path);
      const identity = page.locator('[data-print-identity]');
      await expect(identity).toBeVisible();
      await expect(identity).toContainText('Kaffeeklatsch');
      await expect(identity).toContainText('ssword');
      await expect(page.locator('article.essay h1')).toBeVisible();
    });
  }

  test('printed essay keeps equations, footnotes, and code indentation', async ({ page }) => {
    await page.goto(ESSAY);
    const article = page.locator('article.essay');
    await expect(article.locator('.katex-display').first()).toBeVisible();
    await expect(article.locator('.katex').first()).toBeVisible();
    await expect(article.locator('sup a[data-footnote-ref]').first()).toBeVisible();
    const notes = article.locator('section[data-footnotes]');
    await expect(notes).toBeVisible();
    await expect(notes).toContainText('natural logarithm');

    const pre = article.locator('pre').first();
    const { whiteSpace, text } = await pre.evaluate((el) => ({
      whiteSpace: getComputedStyle(el).whiteSpace,
      text: el.textContent ?? '',
    }));
    expect(whiteSpace).toMatch(/^pre/);
    expect(text).toMatch(/\n {4}\S/);
  });

  test('printed code wraps long lines instead of clipping them at the page edge', async ({ page }) => {
    // Roughly the A4 content box (21cm less 2.2cm margins each side) at 96dpi.
    await page.setViewportSize({ width: 630, height: 900 });
    await page.goto('/essays/the-loss-landscape-is-mostly-flat/');
    for (const pre of await page.locator('article.essay pre').all()) {
      const { scroll, client } = await pre.evaluate((el) => ({
        scroll: el.scrollWidth,
        client: el.clientWidth,
      }));
      expect(scroll).toBeLessThanOrEqual(client);
    }
  });

  test('printed footnotes are numbered so references can be matched on paper', async ({ page }) => {
    await page.goto(ESSAY);
    const listStyle = await page
      .locator('section[data-footnotes] ol')
      .evaluate((el) => getComputedStyle(el).listStyleType);
    expect(listStyle).toBe('decimal');
  });

  test('printed source cards stay whole and keep the shelf heading with its sources', async ({ page }) => {
    await page.goto(ESSAY);
    const item = page.locator('[data-technical-sources] li').first();
    expect(await item.evaluate((el) => getComputedStyle(el).breakInside)).toBe('avoid');
    // The shelf is kept together so its label is never stranded at the foot of a page.
    const shelf = page.locator('[data-technical-sources]');
    expect(await shelf.evaluate((el) => getComputedStyle(el).breakInside)).toBe('avoid');
    await expect(shelf.locator('svg').first()).toBeHidden();
  });

  test('printing a Chinese essay drops the chrome and keeps the prose', async ({ page }) => {
    await page.goto(ZH_ESSAY);
    for (const selector of ['body > header', 'body > footer', '[data-reader-dock]', '.essay-reply']) {
      await expect(page.locator(selector).first()).toBeHidden();
    }
    await expect(page.locator('article.essay h1')).toHaveText('初见微光');
    await expect(page.locator('article.essay p', { hasText: '耐心是唯一的原料' })).toBeVisible();
  });

  test('printed essay keeps its publication and revision dates', async ({ page }) => {
    await page.goto('/essays/the-long-steep/');
    const meta = page.locator('.essay-meta');
    await expect(meta).toBeVisible();
    await expect(meta).toContainText('2026');
    await expect(page.locator('[data-last-revised]')).toBeVisible();
  });
});

test('a short Chinese essay saves to PDF without a trailing blank page', async ({ page }) => {
  await page.goto(ZH_ESSAY);
  const pdf = (await page.pdf({ format: 'A4' })).toString('latin1');
  const pages = pdf.match(/\/Type\s*\/Page(?!s)/g) ?? [];
  expect(pages.length).toBe(1);
});

test('the print identity line stays off the screen layout', async ({ page }) => {
  await page.goto(ESSAY);
  await expect(page.locator('[data-print-identity]')).toBeHidden();
});
