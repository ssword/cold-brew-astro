import { describe, expect, it } from 'vitest';
import {
  renderSocialCardSvg,
  socialCardHref,
} from '../../src/lib/social-card';

describe('social cards', () => {
  it('builds a stable, language-specific URL for each essay', () => {
    expect(
      socialCardHref({ id: 'first-light', data: { lang: 'en' } }),
    ).toBe('/og/en/first-light.png');
    expect(
      socialCardHref({
        id: 'first-light-zh',
        data: { lang: 'zh-CN', routeSlug: 'first-light' },
      }),
    ).toBe('/og/zh/first-light.png');
  });

  it('renders a 1200×630 SVG template and escapes content safely', () => {
    const svg = renderSocialCardSvg({
      title: 'Models & meaning',
      excerpt: 'A careful <look>.',
      pubDate: new Date('2026-06-01T00:00:00.000Z'),
      tags: ['language models'],
      language: 'en',
    });

    expect(svg).toContain('width="1200" height="630"');
    expect(svg).toContain('Models &amp; meaning');
    expect(svg).not.toContain('Models & meaning');
    expect(svg).toContain('language models');
  });

  it('uses the CJK font family and localized brand line for Chinese cards', () => {
    const svg = renderSocialCardSvg({
      title: '初见微光',
      excerpt: '一个安静的瞬间。',
      pubDate: new Date('2026-06-01T00:00:00.000Z'),
      tags: ['深度学习'],
      language: 'zh-CN',
    });

    expect(svg).toContain('初见微光');
    expect(svg).toContain('Noto Serif SC Variable');
    expect(svg).toContain('让它慢慢浸泡');
  });
});

