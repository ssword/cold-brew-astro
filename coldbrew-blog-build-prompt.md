# Build prompt: cold brew — a personal essay blog

Build a personal blog called **cold brew** (domain: coldbrew.live). It's a home for long-form, considered writing — the deliberate opposite of hot-take culture. The brand thesis: good thinking, like good cold brew, takes time and shouldn't be rushed.

Tagline: "let it steep."

## Signature visual idea (spend the boldness here)
The reader should feel physically submerged — like they're a few inches beneath the surface of a glass of cold brew, looking up through dark liquid toward a dim light source above.

- Dark theme is the default and primary experience, not a toggle or an inverted afterthought of a light theme.
- A warm, near-black base deepens further toward the bottom of long pages, so scrolling down an essay feels like sinking slightly.
- A soft, slow-shifting glow sits near the top of the viewport, like light entering from the surface above.
- Fine, low-opacity particles drift slowly upward in the background — coffee sediment, not snow: slow, warm-toned, never distracting from the text.
- Avoid the generic "flat near-black background, one bright accent" AI-default look. The depth and warmth are what make this distinctive — lean on layered gradients and slow motion, not a single flat accent color.
- Keep the effect to the atmosphere only. The reading surface itself — the actual text — should stay clean, high-contrast, and disciplined. Don't let the ambiance fight legibility.

## Palette (starting point, adjust for contrast)
- Base background: `#120D0A`
- Panel / card surface: `#1E1611`
- Glow accent, the "surface light": `#5C3A22`
- Primary text: `#EAE0D2` — warm cream, never pure white
- Secondary / muted text: `#94846F`
- Accent for links, the "steeping" tag, hover states: `#D9914A` — copper, not neon

## Typography
- Display / headlines: a characterful literary serif used with restraint — e.g. Fraunces.
- Body text: a calmer reading serif — e.g. Newsreader. Generous line-height (1.6–1.8), constrained measure (~65–75 characters per line).
- Navigation, metadata, timestamps: a clean utility sans — e.g. IBM Plex Sans. Never used for essay titles or body copy.

## Pages & layout
- **Home** — one line stating the site's philosophy, then the latest/featured essay, then a chronological list of essays (title, one-line excerpt, reading time, status tag only if "steeping"). No sidebar widgets, no "trending" rail.
- **Essay page** — large readable type, generous margins, footnotes if needed, ends with a quiet "reply by email" prompt instead of a comment section.
- **About** — short, personal, written like a person, not a company.
- Optional: a lightweight "now" page and an RSS feed.

## Content mechanics
- Every post carries a status: **steeping** (still developing, may be revised openly later) or **brewed** (settled). Only steeping posts show a visible tag — it's the exception, not a badge on everything.
- Show estimated reading time up front, everywhere a post appears. The whole pitch is "this takes time, on purpose," so don't hide that.
- No public comments. Replace with a "reply by email" link — it keeps drive-by reactions out and encourages actual correspondence.
- No view counts, like counts, or autoplay anything.

## Voice
Plain, active, sentence case. Conversational but unhurried — copy should sound like someone thinking carefully, not selling something. No filler, no forced cleverness.

## Motion
Slow and gentle, never jumpy: 400–800ms eases, no bounce/elastic effects, no scroll-jacking. The ambient particle drift and glow should pause for users with `prefers-reduced-motion` set.

## Quality floor
Responsive down to mobile. Visible keyboard focus states. Sufficient contrast for body text against the dark background despite the moody palette — atmosphere should never cost readability. Build ambient effects (particles, glow) with lightweight CSS rather than heavy canvas/WebGL, so the page stays fast.

## Avoid
Stark white-on-black contrast, popups or newsletter modals interrupting reading, loud/saturated color, decorative numbering or structure that doesn't carry real meaning, anything that competes with the reading experience.
