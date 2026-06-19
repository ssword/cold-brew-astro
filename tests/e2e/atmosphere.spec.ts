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

test('the background deepens as the reader scrolls down a long page', async ({ page }) => {
  await page.goto(LONG_ESSAY);
  const deep = page.locator('[data-atmosphere] .atmo-deep');
  await expect(deep).toHaveCount(1);

  // The deepen is scroll-driven, so the page must actually be scrollable.
  const scrollable = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight,
  );
  expect(scrollable).toBeGreaterThan(100);

  const opacity = () => deep.evaluate((el) => Number(getComputedStyle(el).opacity));

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(100);
  const atTop = await opacity();

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(100);
  const atBottom = await opacity();

  expect(atBottom).toBeGreaterThan(atTop);
});

test('a surface glow sits near the top of the viewport and stays fixed there while scrolling', async ({
  page,
}) => {
  await page.goto(LONG_ESSAY);
  const glow = page.locator('[data-atmosphere] .atmo-glow');
  await expect(glow).toHaveCount(1);

  const viewport = page.viewportSize()!;

  const atTop = await glow.boundingBox();
  expect(atTop).not.toBeNull();
  // Anchored at the surface (upper half), not the middle or bottom.
  expect(atTop!.y).toBeLessThan(viewport.height / 2);

  // Fixed to the viewport: scrolling the page does not carry it downward.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(100);
  const afterScroll = await glow.boundingBox();
  expect(Math.abs(afterScroll!.y - atTop!.y)).toBeLessThan(20);
});

test('warm-toned particles drift slowly upward in the background', async ({ page }) => {
  await page.goto('/');
  const particles = page.locator('[data-atmosphere] .atmo-particle');
  expect(await particles.count()).toBeGreaterThanOrEqual(8);

  // Each particle runs a real (named, non-zero) animation...
  const anim = await particles.first().evaluate((el) => {
    const s = getComputedStyle(el);
    return { name: s.animationName, duration: parseFloat(s.animationDuration) };
  });
  expect(anim.name).not.toBe('none');
  expect(anim.duration).toBeGreaterThan(0);

  // ...and is warm-toned (red dominant, then green, then blue — coffee sediment,
  // not snow).
  const [r, g, b] = parseRgb(
    await particles.first().evaluate((el) => getComputedStyle(el).backgroundColor),
  );
  expect(r).toBeGreaterThan(g);
  expect(g).toBeGreaterThan(b);

  // Drifts upward: over ~600ms at least one particle's viewport Y decreases.
  const tops = () =>
    particles.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
  const before = await tops();
  await page.waitForTimeout(600);
  const after = await tops();
  expect(before.some((y, i) => after[i] < y - 1)).toBe(true);
});

test('all ambient motion pauses under prefers-reduced-motion: reduce', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(LONG_ESSAY);

  // Glow and particles carry no running animation.
  const animationName = (selector: string) =>
    page
      .locator(`[data-atmosphere] ${selector}`)
      .first()
      .evaluate((el) => getComputedStyle(el).animationName);
  expect(await animationName('.atmo-glow')).toBe('none');
  expect(await animationName('.atmo-particle')).toBe('none');

  // Particles hold still over time.
  const particles = page.locator('[data-atmosphere] .atmo-particle');
  const tops = () =>
    particles.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
  const before = await tops();
  await page.waitForTimeout(600);
  expect(await tops()).toEqual(before);

  // The deepen no longer responds to scrolling.
  const deep = page.locator('[data-atmosphere] .atmo-deep');
  const opacity = () => deep.evaluate((el) => Number(getComputedStyle(el).opacity));
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(100);
  const atTop = await opacity();
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(100);
  expect(await opacity()).toBe(atTop);
});
