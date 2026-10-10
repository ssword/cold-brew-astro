import { afterEach, describe, expect, it } from 'vitest';
import {
  essaySlug,
  formatEssayDate,
  essaysInLanguage,
  languageAlternates,
  localeFeed,
  localeHome,
  localeSearch,
  localeTagsIndex,
  localizedEssayHref,
  localizedTagHref,
} from '../../src/lib/i18n';

const entry = (
  id: string,
  lang: 'en' | 'zh-CN' = 'en',
  routeSlug?: string,
) => ({
  id,
  data: {
    lang,
    routeSlug,
    translationKey: 'first-light',
  },
});

describe('localized essay URLs', () => {
  it('keeps the existing English URL and prefixes translated editions', () => {
    expect(localizedEssayHref(entry('first-light'))).toBe(
      '/essays/first-light/',
    );
    expect(
      localizedEssayHref(entry('first-light-zh', 'zh-CN', 'first-light')),
    ).toBe('/zh/essays/first-light/');
  });

  it('uses routeSlug without changing a collection entry’s unique id', () => {
    const translated = entry('first-light-zh', 'zh-CN', 'first-light');
    expect(essaySlug(translated)).toBe('first-light');
    expect(translated.id).toBe('first-light-zh');
  });
});

describe('locale page paths', () => {
  it('leaves English pages unprefixed and puts Chinese ones under /zh/', () => {
    expect([localeHome('en'), localeFeed('en'), localeTagsIndex('en'), localeSearch('en')]).toEqual([
      '/',
      '/rss.xml',
      '/tags/',
      '/search/',
    ]);
    expect([
      localeHome('zh-CN'),
      localeFeed('zh-CN'),
      localeTagsIndex('zh-CN'),
      localeSearch('zh-CN'),
    ]).toEqual(['/zh/', '/zh/rss.xml', '/zh/tags/', '/zh/search/']);
    expect(localizedTagHref('statistics', 'zh-CN')).toBe('/zh/tags/statistics/');
  });
});

describe('language selection', () => {
  it('filters a corpus and resolves links to matching translations', () => {
    const english = entry('first-light');
    const chinese = entry('first-light-zh', 'zh-CN', 'first-light');
    const unrelated = {
      id: 'other',
      data: { lang: 'en' as const, translationKey: 'other' },
    };

    expect(essaysInLanguage([english, chinese], 'zh-CN')).toEqual([chinese]);
    expect(languageAlternates(english, [english, chinese, unrelated])).toEqual([
      {
        language: 'zh-CN',
        href: '/zh/essays/first-light/',
        label: '中文',
      },
    ]);
  });
});


describe('essay dates', () => {
  const originalTz = process.env.TZ;
  afterEach(() => {
    process.env.TZ = originalTz;
  });

  it('formats a frontmatter day as that day, whatever the build machine zone', () => {
    // Frontmatter `pubDate: 2026-05-20` parses to UTC midnight.
    const pubDate = new Date('2026-05-20');
    for (const zone of ['America/Chicago', 'Asia/Shanghai', 'UTC']) {
      process.env.TZ = zone;
      expect(formatEssayDate(pubDate, 'en')).toBe('May 20, 2026');
      expect(formatEssayDate(pubDate, 'zh-CN')).toBe('2026年5月20日');
    }
  });
});
