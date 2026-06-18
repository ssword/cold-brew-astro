# PRD — cold brew (coldbrew.live)

A personal long-form essay blog for @sswordme. Status: ready for implementation.

## Problem Statement

@sswordme wants a home for slow, considered, long-form writing on deep learning, language models, and statistics — the deliberate opposite of hot-take culture. The mainstream publishing experience optimizes for speed, reactions, and metrics (likes, view counts, comment threads, algorithmic feeds) and pushes writing to feel finished and performative. The author instead wants to:

- publish thinking that may still be developing and revise it openly over time;
- present technical essays (with code and math) in a reading environment that is calm, distinctive, and unhurried;
- avoid engagement metrics, comment noise, and the generic "flat near-black + one neon accent" dark-template look;
- eventually publish Chinese-language content, so the foundation must not preclude CJK typography.

From a reader's perspective: readers want a high-contrast, distraction-free reading surface; a clear signal of how much time a piece takes and whether it is settled or still evolving; the ability to subscribe without an algorithm (RSS); and a way to respond thoughtfully (email) rather than drive-by comment.

## Solution

A statically generated personal blog built with Astro. Dark by default, with a signature ambient "submerged in cold brew" atmosphere — a base that deepens toward the bottom of long pages, a slow-shifting surface glow near the top of the viewport, and fine low-opacity particles drifting slowly upward — implemented in lightweight CSS that pauses under `prefers-reduced-motion` and never competes with the text.

Essays are authored as Markdown in type-safe content collections. Each post carries a lifecycle status (`draft` → `steeping` → `brewed`) and tags; reading time is computed automatically. Technical content renders well: math via KaTeX at build time, code via Shiki with a custom warm theme keyed to the palette. Pages: Home (philosophy line, featured latest essay, chronological list), Essay, About, Now, a tag index and per-tag pages, plus an RSS feed and a sitemap with social meta. No comments (a quiet "reply by email" prompt instead), no view/like counts, no modals, no autoplay. The first build ships with 12 reflective essays on deep learning / LLMs / statistics that exercise every feature.

## User Stories

### Reading experience
1. As a reader, I want to land on the home page and grasp the site's philosophy in one line, so that I immediately know what kind of writing to expect.
2. As a reader, I want the latest/featured essay shown prominently on the home page, so that I can start reading the newest thinking without searching.
3. As a reader, I want a chronological list of essays showing title, a one-line excerpt, and reading time, so that I can choose what to read based on topic and time available.
4. As a reader, I want a "steeping" tag to appear only on essays that are still developing, so that I know which pieces may change and which are settled.
5. As a reader, I want estimated reading time shown wherever an essay appears, so that I can decide when I have time to read it properly.
6. As a reader, I want a calm, high-contrast reading surface, so that I can read long essays without strain despite the dark, moody theme.
7. As a reader, I want generous line-height and a constrained line length (~65–75 characters), so that long passages are comfortable.
8. As a reader, I want syntax-highlighted code in a theme that fits the site, so that technical examples are legible and not jarring.
9. As a reader, I want mathematical equations rendered cleanly, both inline and as display equations, so that I can follow technical arguments.
10. As a reader, I want footnotes collected at the foot of the essay, so that I can follow asides without losing my place.
11. As a reader, I want code blocks, equations, and figures to use a wider track than the prose, so that they aren't cramped inside the reading measure.
12. As a reader, I want a quiet "reply by email" prompt at the end of an essay instead of a comment box, so that I can respond thoughtfully.
13. As a reader, I want to subscribe via RSS, so that I can follow new essays without an algorithm deciding what I see.
14. As a reader, I want to browse essays by tag, so that I can find pieces on a theme I care about.
15. As a reader, I want the background to deepen as I scroll down a long essay, so that reading feels like a gentle, intentional descent.
16. As a reader, I want links shown in copper with clear hover states, so that they're discoverable but never garish.
17. As a reader, I want no popups, newsletter modals, autoplay, or view/like counters, so that nothing interrupts or gamifies my reading.
18. As a reader, I want an About page that reads like a person, so that I understand who is writing.
19. As a reader, I want a "Now" page, so that I can see what the author is currently focused on.
20. As a reader, I want shared links to unfurl with a title, description, and image, so that links look intentional when shared.

### Accessibility & quality
21. As a reader on a phone, I want the layout to adapt responsively, so that I can read comfortably on a small screen.
22. As a reader who prefers reduced motion, I want the ambient particles and glow to pause, so that the site doesn't cause discomfort.
23. As a keyboard user, I want visible focus states on links and controls, so that I can navigate without a mouse.
24. As a low-vision reader, I want body text to meet sufficient contrast against the dark background, so that I can read despite the moody palette.
25. As a reader, I want fonts to load quickly and without layout shift, so that the page feels fast and stable.

### Authoring
26. As the author, I want to write essays in Markdown files in the repo, so that I can use any editor and keep everything in version control.
27. As the author, I want a type-safe frontmatter schema, so that I get build-time errors if I mistype or omit a field.
28. As the author, I want to mark a post as `draft`, so that I can keep work-in-progress in the repo without it appearing in production.
29. As the author, I want drafts to be visible in the dev server, so that I can preview unfinished work locally.
30. As the author, I want to mark a post as `steeping`, so that readers know it's still developing and I can revise it openly.
31. As the author, I want to mark a post as `brewed`, so that readers know it's settled.
32. As the author, I want reading time computed automatically from the text, so that I don't maintain it by hand as I revise.
33. As the author, I want to tag essays, so that related pieces are grouped for readers.
34. As the author, I want to embed syntax-highlighted code, so that I can illustrate technical points.
35. As the author, I want to write LaTeX math inline and as display equations, so that I can express ideas precisely.
36. As the author, I want Markdown footnotes, so that I can include asides without cluttering the main text.
37. As the author, I want pull-quotes, so that I can emphasize key lines.
38. As the author, I want the newest essay automatically featured on the home page, so that I don't curate the homepage manually each time.
39. As the author, I want placeholder About and Now copy in my voice, so that I can edit rather than start from a blank page.
40. As the author, I want seeded example essays demonstrating every feature, so that I can verify the site and have a model to write against.
41. As the author, I want to delete or replace seed essays easily, so that they don't become permanent.

### Publishing, identity & distribution
42. As the author, I want an RSS feed generated automatically from published posts, so that subscribers always get current content.
43. As the author, I want a sitemap and social meta generated automatically, so that the site is crawlable and shareable without manual work.
44. As the author, I want the site to build to static files, so that I can host it anywhere cheaply and quickly.
45. As the author, I want my GitHub (`ssword`) and Twitter (`sswordme`) linked in the footer, so that readers can find me elsewhere.
46. As the author, I want a "reply by email" link pointing to ssword@gmail.com, so that readers can correspond directly.

### Brand, atmosphere & future
47. As the author, I want a distinctive submerged-in-cold-brew aesthetic, so that the site is memorable and not a generic dark template.
48. As the author, I want the atmosphere to stay subtle, so that it never competes with the text.
49. As the author, I want animations slow and gentle (400–800ms eases, no bounce, no scroll-jacking), so that the site feels unhurried.
50. As the author, I want ambient effects built in lightweight CSS rather than canvas/WebGL, so that the page stays fast.
51. As the author, I want fonts self-hosted, so that I avoid third-party requests and keep reader IPs private.
52. As the author, I want the font architecture to support a future CJK family with a clean fallback chain, so that adding Chinese content later doesn't require rework.

## Implementation Decisions

- **Framework & output:** Astro, static output (no SSR adapter). Host-agnostic build (`astro build` → `dist/`).
- **Styling:** Tailwind CSS v4 via the `@tailwindcss/vite` plugin. The palette, type scale, and spacing live as `@theme` tokens; the bespoke atmosphere and typography are hand-written CSS layers (the signature effect is custom CSS regardless of framework).
- **Palette (starting point, tuned for contrast):** base `#120D0A`, panel `#1E1611`, glow accent `#5C3A22`, primary text `#EAE0D2` (warm cream, never pure white), muted text `#94846F`, link/accent copper `#D9914A`.
- **Typography:** Fraunces (display/headlines, used with restraint), Newsreader (body, line-height 1.6–1.8, measure ~65–75ch), IBM Plex Sans (navigation, metadata, timestamps only — never titles or body). Self-hosted variable fonts via Fontsource.
- **Content layer:** Astro content collections, Markdown. Typed schema: `title` (string), `excerpt` (string), `pubDate` (date), `status` (enum: `draft` | `steeping` | `brewed`), `tags` (string array). Footnotes via Astro's built-in GFM.
- **Lifecycle & selection:** a single source-of-truth utility that (a) excludes `draft` in production but includes it in dev, (b) sorts published posts by `pubDate` descending, (c) selects the most recent published post as the home "featured" essay, (d) derives the tag list. Only `status: steeping` renders the copper status tag.
- **Reading time:** a remark plugin computes `ceil(words / 220)` at build time and exposes it via remark frontmatter; rendered everywhere a post appears.
- **Math:** `remark-math` + `rehype-katex`, rendered to HTML at build time (no client JS). KaTeX stylesheet self-hosted.
- **Code highlighting:** Shiki with a **custom theme** keyed to the palette — panel background (`#1E1611`), cream text, copper/amber keywords and strings, muted comments — so code feels native rather than pasted in.
- **Theming:** dark-only. No light mode and no theme toggle.
- **Routes/pages:** Home, Essay (dynamic route by slug), About, Now, tag index, per-tag pages, an RSS endpoint (`@astrojs/rss`, published posts only), and a sitemap. A shared head/SEO component emits Open Graph / Twitter meta.
- **Atmosphere (three CSS layers):** (1) a base gradient that deepens toward the bottom of the page as the reader scrolls; (2) a slow-shifting surface glow near the top of the viewport; (3) fine, low-opacity, warm-toned particles drifting slowly upward. Animations use transform/opacity only, 400–800ms eases, no bounce/elastic, no scroll-jacking. All ambient motion is gated behind `prefers-reduced-motion`. Intensity profile: subtle but present, consistent across home and essay pages.
- **Reading layout:** prose held to ~68ch; code, math, and figures occupy a wider track. Footnotes at the essay foot; pull-quotes as styled blockquotes.
- **Engagement model:** no comments — a quiet "reply by email" prompt (`mailto:ssword@gmail.com`). No view counts, like counts, autoplay, or newsletter modals.
- **Identity/config:** centralized site config — author display name `@sswordme`, reply email `ssword@gmail.com`, footer/social links GitHub `ssword` and Twitter `sswordme`, site title/description/tagline.
- **Home hero copy (decision):** "a home for slow, considered writing on deep learning, language models, and statistics — the kind of thinking that shouldn't be rushed." with tagline "let it steep."
- **CJK readiness:** the font-family token chain is structured so a Chinese family (e.g., Noto Serif/Sans SC) can be appended later with a clean fallback; no rework required when CJK content arrives.
- **Seed content:** 12 reflective essays on deep learning / LLMs / statistics (≈3 `steeping`, ≈9 `brewed`), in the cold-brew voice (plain, active, sentence case; meditations, not tutorials), collectively exercising code blocks, KaTeX math (inline + display), footnotes, pull-quotes, tags, and varied reading times.

## Testing Decisions

Good tests verify external, observable behavior — what the site produces — not framework internals or implementation details. For a static content site, prefer the highest seam and the fewest seams. Proposed seams (fewest, highest first):

- **Seam 1 — the production build (highest, single point):** run the build and assert it completes successfully and that the content-collection schema type-checks. This one seam catches schema violations, broken math/code pipeline configuration, and template errors across every page.
- **Seam 2 — the post-selection utility (pure function):** the logic most likely to regress and cleanly separable from rendering. Unit-test with sample frontmatter inputs → deterministic outputs: drafts excluded in prod / included in dev, descending date sort, correct featured selection, correct tag derivation.
- **Seam 3 — the reading-time function (pure function):** text in → minutes out; unit-test with known inputs (including the boundary rounding).
- **Optional behavioral checks on built HTML (high seam, no internals):** a draft slug is absent from the production output; a `steeping` post shows the tag while a `brewed` one does not; reading time appears on listings and essay pages; RSS contains only published posts.

Keep rendering thin around Seams 2 and 3 so most logic is covered by fast unit tests plus the single build/output integration check. **Prior art:** none — this is a greenfield repo; these seams establish the testing pattern. Out of testing scope: Astro framework internals and the visual atmosphere/reduced-motion behavior (verified manually in a browser).

## Out of Scope

- Light mode or any theme toggle (dark-only by design).
- Public comments, reactions, view/like counts, and newsletter capture/modals.
- A headless CMS or admin UI — Markdown-in-repo is the authoring model.
- Implemented Chinese/CJK content and the character-based reading-time rule (the foundation is made CJK-ready, but CJK itself is not built now).
- SSR/dynamic server features, authentication, and full-text search (could come later).
- Host-specific deployment configuration (the build is intentionally host-agnostic for the first release; coldbrew.live is wired up by the author later).
- MDX / component-in-post authoring (plain Markdown chosen; can be added later if a post needs embedded components).
- Tag descriptions or hierarchy beyond a flat per-tag listing.

## Further Notes

- **Voice:** plain, active, sentence case; conversational but unhurried; no filler, no forced cleverness. Essays are reflective meditations on the topics, not how-to tutorials.
- **"Spend the boldness on atmosphere":** depth and warmth come from layered gradients and slow motion — explicitly avoiding the generic flat-near-black + single bright accent look. The reading surface itself stays clean, high-contrast, and disciplined.
- **Quality floor:** responsive down to mobile, visible keyboard focus, sufficient body-text contrast, and lightweight effects so the page stays fast.
- **Publishing note:** no git repository or issue tracker is configured for this project yet, so this PRD lives in the repo as `PRD.md` rather than as a tracked issue with a `ready-for-agent` label. To publish to a tracker, initialize git + a remote and run `/setup-matt-pocock-skills`.
