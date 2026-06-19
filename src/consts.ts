export const SITE_TITLE = 'cold brew';
export const SITE_TAGLINE = 'let it steep';
export const SITE_DESCRIPTION =
  'a home for slow, considered writing on deep learning, language models, and statistics — the kind of thinking that shouldn’t be rushed.';

export const REPLY_EMAIL = 'ssword@gmail.com';

// Default social-card image (1200×630), resolved to an absolute URL against
// `site` in the shared head. Pages may override per-essay.
export const OG_IMAGE = '/og.png';

export const TWITTER_HANDLE = '@sswordme';

export const SOCIAL = {
  github: 'https://github.com/ssword',
  twitter: 'https://twitter.com/sswordme',
} as const;

export const NAV = [
  { label: 'Essays', href: '/' },
  { label: 'About', href: '/about/' },
  { label: 'Now', href: '/now/' },
] as const;
