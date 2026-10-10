export const SITE_TITLE = 'Kaffeeklatsch';
export const SITE_TAGLINE = 'coffee & conversations · let it steep';
export const SITE_DESCRIPTION =
  'a home for slow, considered writing on deep learning, language models, and statistics — the kind of thinking that shouldn’t be rushed.';

export const REPLY_EMAIL = 'ssword@gmail.com';

// Default social-card image (1200×630), resolved to an absolute URL against
// `site` in the shared head. Pages may override per-essay.
export const OG_IMAGE = '/og.png';

export const TWITTER_HANDLE = '@sswordme';

export const SOCIAL = {
  github: 'https://github.com/ssword',
  twitter: `https://twitter.com/${TWITTER_HANDLE.slice(1)}`,
} as const;

// The byline used in Article structured data.
export const AUTHOR = {
  name: 'ssword',
  url: SOCIAL.github,
} as const;

export const NAV = [
  { label: 'Essays', href: '/' },
  { label: 'About', href: '/about/' },
  { label: 'Now', href: '/now/' },
  { label: 'Search', href: '/search/' },
] as const;
