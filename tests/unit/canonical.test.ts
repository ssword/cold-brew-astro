import { describe, expect, it } from 'vitest';
import { canonicalUrl } from '../../src/lib/canonical';

describe('canonicalUrl', () => {
  it('resolves the page path against the configured site, dropping the query', () => {
    const url = canonicalUrl({
      url: new URL('http://localhost:4321/zh/essays/first-light/?q=x'),
      site: new URL('https://coldbrew.live'),
    });
    expect(url.href).toBe('https://coldbrew.live/zh/essays/first-light/');
  });

  it('falls back to the request origin when no site is configured', () => {
    const url = canonicalUrl({ url: new URL('http://localhost:4321/about/#now') });
    expect(url.href).toBe('http://localhost:4321/about/');
  });
});
