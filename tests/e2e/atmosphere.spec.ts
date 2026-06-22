import { test, expect } from '@playwright/test';
import { parseRgb } from './_utils';

// The longest published essay — tall enough to scroll for the deepen test.
const LONG_ESSAY = '/essays/a-map-of-the-hedge/';

for (const path of ['/', LONG_ESSAY]) {
  test(`atmosphere is a decorative layer behind the content (${path})`, async ({ page }) => {
    await page.goto(path);
    const atmosphere = page.locator('[data-atmosphere]');
    await expect(atmosphere).toHaveCount(1);

    // Decorative: hidden from assistive tech, never intercepts pointer events,
    // and painted behind the in-flow content so it can't touch legibility.
    await expect(atmosphere).toHaveAttribute('aria-hidden', 'true');
    const layer = await atmosphere.evaluate((el) => {
      const s = getComputedStyle(el);
      return { position: s.position, pointerEvents: s.pointerEvents, zIndex: s.zIndex };
    });
    expect(layer.position).toBe('fixed');
    expect(layer.pointerEvents).toBe('none');
    expect(Number(layer.zIndex)).toBeLessThan(0);

    // CSS-only: no canvas/WebGL surface anywhere on the page.
    await expect(page.locator('canvas')).toHaveCount(0);
  });
}

test('swirling steam lines drift in the background and stay fixed to the viewport', async ({ page }) => {
  await page.goto(LONG_ESSAY);
  const steam = page.locator('[data-atmosphere] .atmo-steam');
  expect(await steam.count()).toBeGreaterThanOrEqual(2);

  // Each steam line runs a real (named, non-zero) animation.
  const anim = await steam.first().evaluate((el) => {
    const s = getComputedStyle(el);
    return { name: s.animationName, duration: parseFloat(s.animationDuration) };
  });
  expect(anim.name).not.toBe('none');
  expect(anim.duration).toBeGreaterThan(0);

  // Painted into the fixed atmosphere layer: scrolling does not carry it down.
  const top = () => steam.first().evaluate((el) => el.getBoundingClientRect().top);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(100);
  const atTop = await top();
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(100);
  // The layer is position:fixed; its anchor doesn't move with the page (the
  // small delta tolerates the steam's own transform animation).
  expect(Math.abs((await top()) - atTop)).toBeLessThan(200);
});

test('translucent coffee stains sit warm-toned in the background', async ({ page }) => {
  await page.goto('/');

  const stain = page.locator('[data-atmosphere] .atmo-stain').first();
  const splatter = page.locator('[data-atmosphere] .atmo-splatter').first();
  await expect(stain).toHaveCount(1);

  // Stains drift on a real animation...
  const anim = await stain.evaluate((el) => {
    const s = getComputedStyle(el);
    return { name: s.animationName, duration: parseFloat(s.animationDuration) };
  });
  expect(anim.name).not.toBe('none');
  expect(anim.duration).toBeGreaterThan(0);

  // ...and the splatter fill is warm-toned (red dominant — coffee, not neon).
  const [r, g, b] = parseRgb(
    await splatter.evaluate((el) => getComputedStyle(el).backgroundColor),
  );
  expect(r).toBeGreaterThan(g);
  expect(g).toBeGreaterThan(b);
});

test('all ambient motion pauses under prefers-reduced-motion: reduce', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(LONG_ESSAY);

  // Steam, stains, and splatters carry no running animation.
  const animationName = (selector: string) =>
    page
      .locator(`[data-atmosphere] ${selector}`)
      .first()
      .evaluate((el) => getComputedStyle(el).animationName);
  expect(await animationName('.atmo-steam')).toBe('none');
  expect(await animationName('.atmo-stain')).toBe('none');
  expect(await animationName('.atmo-splatter')).toBe('none');

  // The decorative layer holds still over time.
  const steam = page.locator('[data-atmosphere] .atmo-steam').first();
  const top = () => steam.evaluate((el) => el.getBoundingClientRect().top);
  const before = await top();
  await page.waitForTimeout(600);
  expect(await top()).toBe(before);
});
