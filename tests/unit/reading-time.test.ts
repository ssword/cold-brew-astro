import { describe, it, expect } from 'vitest';
import { readingTime } from '../../src/lib/reading-time';

describe('readingTime', () => {
  it('rounds a short text up to a one-minute read', () => {
    expect(readingTime('a handful of words here')).toBe(1);
  });

  it('counts ~220 words per minute', () => {
    const words = (n: number) => Array.from({ length: n }, () => 'word').join(' ');
    expect(readingTime(words(440))).toBe(2);
  });

  it('rounds up at the per-minute boundary', () => {
    const words = (n: number) => Array.from({ length: n }, () => 'word').join(' ');
    expect(readingTime(words(220))).toBe(1);
    expect(readingTime(words(221))).toBe(2);
  });

  it('treats empty or whitespace-only text as a zero-minute read', () => {
    expect(readingTime('')).toBe(0);
    expect(readingTime('   \n\t  ')).toBe(0);
  });

  it('counts CJK text by character instead of whitespace-delimited words', () => {
    expect(readingTime('字'.repeat(500))).toBe(1);
    expect(readingTime('字'.repeat(501))).toBe(2);
  });

  it('combines Latin words and CJK characters in mixed-language text', () => {
    const latin = Array.from({ length: 110 }, () => 'word').join(' ');
    expect(readingTime(`${latin} ${'字'.repeat(250)}`)).toBe(1);
    expect(readingTime(`${latin} ${'字'.repeat(251)}`)).toBe(2);
  });
});
