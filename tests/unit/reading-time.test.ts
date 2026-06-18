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
});
