/**
 * The canonical address of a built page: its path resolved against the
 * configured `site`. Shared by the `<link rel="canonical">` head and the
 * address printed on paper copies, so the two can't drift apart. Without a
 * configured site (local tooling) it falls back to the request URL's origin.
 */
export function canonicalUrl(page: { url: URL; site?: URL }): URL {
  return new URL(page.url.pathname, page.site ?? page.url);
}
