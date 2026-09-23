import { describe, expect, it } from 'vitest';
import {
  essaySlug,
  essaysInLanguage,
  languageAlternates,
  localizedEssayHref,
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

