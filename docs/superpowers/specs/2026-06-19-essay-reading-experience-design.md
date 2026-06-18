# Essay reading experience — code, math, footnotes, pull-quotes

**Issue:** ssword/cold-brew-astro#4 (parent #1) · **Branch:** `feature/4-essay-reading-experience` · **Date:** 2026-06-19

## Goal

Make essays read beautifully and handle technical content: cold-brew–themed code
highlighting, build-time math, styled footnotes and pull-quotes, a constrained prose
measure with a wider track for technical blocks, and a quiet reply-by-email prompt.

## Current state

- Markdown pipeline: `astro.config.mjs` uses Astro 6's `markdown.processor: unified({ remarkPlugins: [remarkReadingTime] })` (real Astro 6 option from `@astrojs/markdown-remark`). GFM (incl. footnotes), smartypants, and Shiki are on by default.
- `unified().createRenderer(shared)` spreads `shared` (the top-level markdown config) first, then overrides remark/rehype/gfm/smartypants — so **top-level `markdown.shikiConfig` still reaches the processor.**
- Essay route `src/pages/essays/[...slug].astro` renders `<article>` with `<h1>`, a status/min-read line, and `<Content />`.
- `src/styles/global.css` defines palette + type tokens and `--container-prose: 68ch`, but the measure is **not yet applied** to the article.
- `src/consts.ts` already exports `REPLY_EMAIL = 'ssword@gmail.com'`.
- The three existing essays are pure prose (no code/math/footnotes).
- Math deps are **not** installed.

## Locked design decisions

| Area | Decision |
|---|---|
| Code theme | **A — copper & amber**: panel bg `#1E1611`, cream text, copper `#D9914A` keywords, amber `#E6B873` strings, soft-amber `#CDA86A` numbers, muted-italic `#94846F` comments, cream functions/identifiers |
| Pull-quote | **A — copper left rule + italic** (one style serves quotations and emphasis) |
| Reading layout | **B — asymmetric**: prose hugs left at ~68ch; code/math/figures extend right into a ~80ch wide track |
| Demo content | **One new `brewed` showcase essay** exercising every feature |

## Approach

**Extend the existing pipeline (additive).** Keep the `unified()` wiring; add the math
plugins to it and set a custom Shiki theme at the top level:

```js
// astro.config.mjs
markdown: {
  shikiConfig: { theme: coldBrewTheme },
  processor: unified({
    remarkPlugins: [remarkMath, remarkReadingTime],
    rehypePlugins: [rehypeKatex], // default output: HTML + MathML (a11y)
  }),
}
```

Rejected: `@shikijs/rehype` (duplicates Astro's built-in Shiki, extra dep); abandoning
`processor:` for standard `markdown: {}` options (larger, riskier rewrite of working
config). Fallback if Astro's schema rejects `processor` + `shikiConfig` together: switch
the theme to `@shikijs/rehype` with `syntaxHighlight: false`. The build/test catches this.

## Detailed design

### 1. Dependencies & config
- Add: `remark-math`, `rehype-katex`, `katex`.
- Wire plugins + `shikiConfig.theme` into `astro.config.mjs` as above.

### 2. Shiki theme module — `src/lib/shiki-cold-brew.ts`
A TextMate-style theme object (scheme A), exported as data. Token-color hexes for code
syntax (amber `#E6B873`, soft-amber `#CDA86A`) live **here only**, not in the global
`@theme` palette, to avoid palette sprawl — they are code-syntax-internal. Maps at least:
comments (muted italic), keywords/storage (copper), strings (amber), numeric/language
constants (soft amber), functions/identifiers (cream), with `bg #1E1611` / `fg #EAE0D2`.

### 3. KaTeX self-hosting
- `import 'katex/dist/katex.min.css'` in `src/pages/essays/[...slug].astro` so the
  stylesheet + KaTeX webfonts are bundled as **same-origin** hashed assets and only load
  on essay pages.
- `rehype-katex` renders at build time ⇒ **no client-side math JS, no third-party requests.**

### 4. Reading layout (B, asymmetric) — `global.css`
- Add token `--container-wide: 80ch` (sibling to `--container-prose: 68ch`).
- Add `class="essay"` to the article in `[...slug].astro`. Rules:
  - `.essay { max-width: var(--container-wide); margin-inline: auto; padding-inline: 1.25rem; }`
  - `.essay > * { max-width: var(--container-prose); }` — prose constrained, left-aligned (hugs left, right gutter empty).
  - `.essay > :is(pre, figure, table, .math-display) { max-width: 100%; }` — wide blocks fill the wide track (extend right).
  - Mobile: single full-width column (the `max-width`s already collapse; verify ≤640px).
- **Risk/verification:** (a) assumes `<Content />` renders markdown elements as direct children of `<article>`. If Astro injects a wrapper, switch the selector to that wrapper or add a content class. (b) The exact display-math wrapper class emitted by `remark-math` → `remark-rehype` (`.math-display` vs other) varies by version; confirm the real class and adjust the wide-track selector. Resolve both during the code-highlighting / math TDD cycles.

### 5. Footnotes
GFM already emits `<section data-footnotes class="footnotes">` with refs
(`a[data-footnote-ref]`, `#user-content-fn-N`) and backrefs (`a[data-footnote-backref]`).
Style only: top hairline separator (glow `#5C3A22`), smaller muted text, copper ref/backref
links. Renders at prose width (foot of essay).

### 6. Pull-quotes
`.essay blockquote`: `border-left: 3px solid #D9914A`, italic, slightly larger, prose width.

### 7. Reply-by-email prompt
Last element inside the article (prose width), distinct from BaseLayout's site footer.
`<aside class="essay-reply">` with a top hairline and quiet copy:
*"Found a mistake, or want to push back? **Reply by email.**"* linking to
`mailto:${REPLY_EMAIL}` (= `mailto:ssword@gmail.com`). Copper link, inherits global focus ring.

### 8. Showcase essay — `src/content/essays/a-map-of-the-hedge.md`
One new `brewed` essay in the cold-brew voice (reflective, plain, sentence case),
*proposed* title **"A map of the hedge"** — the technical companion to "The long steep"
(it picks up that essay's claim that "the hedge has a texture" and measures it via entropy).
Title/slug are adjustable on review. It naturally contains: a fenced code block, inline
`$…$` **and** display `$$…$$` math, two footnotes, a pull-quote (`>`), and a wide `<figure>`
(raw HTML, with `<figcaption>`). Frontmatter matches the schema (`title`, `excerpt`,
`pubDate: 2026-06-19`, `status: brewed`, `tags`). Must be non-draft so it is reachable in
both dev and built/preview test runs.

## Testing (TDD)

Per PRD "behavioral checks on built HTML" seam — Playwright e2e against the showcase essay,
grown **vertically** (one behavior → minimal implementation → next). Reuse `tests/e2e/_utils.ts`
(`parseRgb`). Order:

1. **Tracer:** reply-by-email `a[href="mailto:ssword@gmail.com"]` present at essay foot.
2. Code block: `pre` computed `background-color` = `rgb(30,22,17)`; at least one token in copper `rgb(217,145,74)`.
3. Inline + display math: `.katex` (inline) and `.katex-display` (display) present; **zero non-localhost network requests** during load (proves self-hosted, no CDN); KaTeX CSS is same-origin.
4. Footnotes: `section[data-footnotes]` at foot; a ref link target id matches its definition; backref resolves.
5. Pull-quote: `.essay blockquote` `border-left-color` = copper `rgb(217,145,74)` and `font-style: italic`.
6. Measure: a prose `<p>` width within ~65–75ch worth of px **and** a code `<pre>` wider than that paragraph.

`npm test` (astro check + vitest + playwright) must stay green; existing essay/typography/footer
e2e specs must not regress. Visual atmosphere is out of test scope (manual browser check).

## Workflow
`feature/4-essay-reading-experience` off `develop` → commit spec → TDD implementation →
full suite + manual browser verification → **merge back to `develop`** (matching the repo's
`Merge feature/N-… into develop` pattern; confirm PR-vs-direct-merge at the merge step).

## Out of scope
Ambient atmosphere layers / reduced-motion, RSS, tag pages, About/Now, and the full 12-essay
seed set (separate issues). This adds one showcase essay only.

## Acceptance criteria → coverage

| Issue criterion | Design | Test |
|---|---|---|
| Code blocks use the cold-brew Shiki theme | §1–2 | T2 |
| Inline + display math via KaTeX at build time, self-hosted, no third-party | §1,3 | T3 |
| Footnotes render and link at the foot | §5 | T4 |
| Pull-quotes visually distinct | §6 | T5 |
| Prose ~65–75ch; code/math/figures wider | §4 | T6 |
| Reply-by-email link, no comments | §7 | T1 |
