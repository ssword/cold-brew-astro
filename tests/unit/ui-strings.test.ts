import { describe, it, expect } from 'vitest';
import { uiStrings } from '../../src/lib/ui-strings';
import { ESSAY_LANGUAGES } from '../../src/lib/i18n';
import { SITE_TAGLINE } from '../../src/consts';

describe('uiStrings', () => {
  it('gives every language a non-empty value for every key', () => {
    const keys = Object.keys(uiStrings('en')).sort();
    for (const language of ESSAY_LANGUAGES) {
      const strings = uiStrings(language);
      expect(Object.keys(strings).sort()).toEqual(keys);
      for (const value of Object.values(strings)) {
        if (typeof value === 'string') expect(value.trim()).not.toBe('');
      }
    }
  });

  it('interpolates counts and dates per language', () => {
    expect(uiStrings('en').minutesRead(7)).toBe('7 min read');
    expect(uiStrings('zh-CN').minutesRead(7)).toBe('约 7 分钟');
    expect(uiStrings('en').seriesPosition(2, 5)).toBe('Part 2 of 5');
    expect(uiStrings('zh-CN').seriesPosition(2, 5)).toBe('第 2 篇，共 5 篇');
    expect(uiStrings('en').revisedOn('May 1, 2026')).toBe('Revised May 1, 2026');
  });

  it('reuses the site tagline for English', () => {
    expect(uiStrings('en').tagline).toBe(SITE_TAGLINE);
  });
});
