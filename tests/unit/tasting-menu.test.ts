import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, it, expect } from 'vitest';
import TastingMenu from '../../src/components/TastingMenu.astro';
import { BREW_TYPES } from '../../src/lib/essays';

describe('TastingMenu', () => {
  it('renders one toggle button per brew, not a tab widget', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TastingMenu, { props: {} });

    for (const brew of BREW_TYPES) {
      expect(html).toContain(`data-filter-brew="${brew}"`);
    }
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(BREW_TYPES.length);
    expect(html).not.toContain('role="tab');
    expect(html).not.toContain('aria-selected');
  });

  it('serves optimized, decorative vessel images', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TastingMenu, { props: {} });

    expect(html).toContain('<picture');
    expect(html).toContain('type="image/avif"');
    expect(html).not.toContain('/assets/vessels/');
    // Astro serialises an empty alt as a bare `alt` attribute.
    expect(html.match(/<img[^>]*\balt(="")?[\s>]/g)).toHaveLength(BREW_TYPES.length);
  });
});
