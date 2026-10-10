# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# cold brew

Personal long-form essay blog (coldbrew.live) built with Astro 6 + Tailwind v4, fully static. Full product spec: `PRD.md`. Original brief: `coldbrew-blog-build-prompt.md`. Post-v1 feature plans: `docs/feature-roadmap.md`.

## Commands

```sh
npm run dev          # astro dev (drafts visible)
npm run build        # static build to dist/
npm run check        # astro check (type-checks .astro + TS)
npm run test:unit    # vitest (tests/unit)
npm run test:e2e     # playwright (tests/e2e) — builds + runs `astro preview` itself
npm test             # check + unit + e2e

npx vitest run tests/unit/essays.test.ts        # single unit file
npx vitest run -t "renders a steeping essay"     # single unit test by name
npx playwright test tests/e2e/home.spec.ts       # single e2e file
npx playwright test -g "some test title"         # single e2e test by name
```

E2E runs against the **production build** (`npm run build && npm run preview` on port 4321), so drafts are hidden there and a stale preview server will be reused locally (`reuseExistingServer` outside CI).

## Architecture

**Content.** Essays are Markdown in `src/content/essays/`, schema in `src/content.config.ts`. The schema's `superRefine` enforces cross-field rules (revisions require `updatedDate`; `series`/`seriesOrder` come together; non-`en` essays must set `translationKey` and `routeSlug`). `status` is the lifecycle `draft | steeping | brewed`; `brew` is the essay format (`cold-brew | espresso | cappuccino | affogato`), whose display metadata lives in `BREW_VESSELS` in `src/lib/essays.ts`.

**Logic lives in `src/lib/`, kept Astro-free so it's unit-testable.** Pages/components call into it rather than duplicating logic:
- `essays.ts` — selection and sorting. Draft visibility is decided in exactly one place: `publishedEssays()` reads `import.meta.env.DEV` (drafts in dev, hidden in prod). `publicEssays()` (feeds) never includes drafts. `toDisplayEssays()` takes `render` as an injected function; `minutesReadOf()` is the only place reading-time is read from remark frontmatter. `buildEssayTrail()` resolves series prev/next + curated related essays.
- `i18n.ts` — languages are `en` (default, unprefixed routes) and `zh-CN` (routed under `/zh/`). URLs use `routeSlug ?? id`, so translations share a slug with their English counterpart. Use `localizedEssayHref`, `localeHome`, `localeFeed` rather than building paths by hand.
- `feeds.ts` (RSS, absolutizes links), `social-card.ts` (OG PNG generation via sharp, served from `src/pages/og/[lang]/[slug].png.ts`), `remark-reading-time.ts`, `shiki-cold-brew.ts` (custom code theme).

**Routing.** Each English route has a `src/pages/[lang]/…` twin for localized languages (index, tags, essays, RSS). Both essay routes are thin wrappers that render `components/EssayPage.astro`; changes to essay presentation go there, not in the routes.

**Build pipeline** (`astro.config.mjs`): remark-math + rehype-katex render math at build time (no client JS); Tailwind v4 is wired through PostCSS (`postcss.config.mjs`), **not** `@tailwindcss/vite`, because the latter is incompatible with Astro 6's rolldown-vite.

**Styling.** Design tokens (palette, fonts, type scale, `prose`/`wide` measures) are defined in the `@theme` block of `src/styles/global.css` and consumed as Tailwind utilities (`bg-base`, `text-cream`, `font-ui`, …). Site-wide constants (title, nav, socials) are in `src/consts.ts`.

## Tests

- **Unit** (`tests/unit`, vitest, node env): pure logic from `src/lib/` plus `.astro` components rendered via `experimental_AstroContainer` (`vitest.config.ts` uses `getViteConfig` so `astro:*` virtuals resolve).
- **E2E** (`tests/e2e`, Playwright/Chromium): checks the built site (routes, RSS, sitemap, a11y, contrast, responsive). `_utils.ts` has color-contrast helpers.

## Workflow

Work happens on `develop`; features land via `feature/<issue#>-<name>` branches merged into `develop`. `main` is the release branch.

## Agent skills

### Issue tracker

Issues and PRDs live in this repo's GitHub Issues (`ssword/cold-brew-astro`), managed via the `gh` CLI. External pull requests are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root (created lazily by `/domain-modeling` when terms or decisions are actually resolved). See `docs/agents/domain.md`.
