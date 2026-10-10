import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, it, expect } from 'vitest';
import BrewBadge from '../../src/components/BrewBadge.astro';

describe('BrewBadge', () => {
  it('renders default Cold Brew badge', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BrewBadge, { props: {} });
    expect(html).toContain('data-brew-badge="cold-brew"');
    expect(html).toContain('Cold Brew');
  });

  it('renders Espresso badge with copper styling and localized name', async () => {
    const container = await AstroContainer.create();
    const htmlEn = await container.renderToString(BrewBadge, { props: { brew: 'espresso', lang: 'en' } });
    expect(htmlEn).toContain('data-brew-badge="espresso"');
    expect(htmlEn).toContain('Espresso');
    expect(htmlEn).toContain('text-copper');

    const htmlZh = await container.renderToString(BrewBadge, { props: { brew: 'espresso', lang: 'zh-CN' } });
    expect(htmlZh).toContain('浓缩');
  });

  it('renders Cappuccino and Affogato badges with subtitles when requested', async () => {
    const container = await AstroContainer.create();
    const htmlCap = await container.renderToString(BrewBadge, {
      props: { brew: 'cappuccino', showSubtitle: true, lang: 'en' },
    });
    expect(htmlCap).toContain('Cappuccino');
    expect(htmlCap).toContain('Layered Explainer');

    const htmlAff = await container.renderToString(BrewBadge, {
      props: { brew: 'affogato', showSubtitle: true, lang: 'zh-CN' },
    });
    expect(htmlAff).toContain('阿芙佳朵');
    expect(htmlAff).toContain('甜苦交融');
  });
});
