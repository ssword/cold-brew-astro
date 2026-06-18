# Essay Reading Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give essays cold-brew–themed code highlighting, build-time KaTeX math, styled footnotes and pull-quotes, an asymmetric wide-track reading layout, and a quiet reply-by-email prompt (issue #4).

**Architecture:** Extend the existing Astro 6 `markdown.processor: unified({...})` pipeline additively — add `remark-math` + `rehype-katex` plugins and a custom Shiki theme via top-level `shikiConfig` (which still flows through the processor's `shared` options). All rendering behavior is verified by Playwright e2e against the production build (`astro build && astro preview`), per the PRD's highest test seam. One new `brewed` showcase essay exercises every feature.

**Tech Stack:** Astro 6, `@astrojs/markdown-remark` `unified()` processor, Shiki (bundled with Astro), `remark-math`, `rehype-katex`, `katex`, Tailwind v4 tokens in `global.css`, Playwright.

**Pre-flight:** Work happens on branch `feature/4-essay-reading-experience` (already created off `develop`). The design spec is at `docs/superpowers/specs/2026-06-19-essay-reading-experience-design.md`. All Playwright runs auto-build via `playwright.config.ts`'s `webServer` (`npm run build && npm run preview` on `http://localhost:4321`); the first run in a task may take 30–60s.

---

### Task 1: Showcase essay + reply-by-email prompt (tracer bullet)

Creates the complete showcase essay fixture (it contains code, math, footnotes, a pull-quote, and a figure — later tasks add the config/CSS that styles each) and wires the per-essay reply prompt. Math/code render as plain text until their tasks land; that is expected.

**Files:**
- Create: `src/content/essays/a-map-of-the-hedge.md`
- Modify: `src/pages/essays/[...slug].astro`
- Modify: `src/styles/global.css` (append the `.essay-reply` rule)
- Create: `tests/e2e/essay-reading.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/e2e/essay-reading.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { parseRgb } from './_utils';

const ESSAY = '/essays/a-map-of-the-hedge/';

test('essay ends with a quiet reply-by-email prompt', async ({ page }) => {
  await page.goto(ESSAY);
  const reply = page.locator('article.essay .essay-reply');
  await expect(reply).toBeVisible();
  const link = reply.getByRole('link', { name: /reply by email/i });
  await expect(link).toHaveAttribute('href', 'mailto:ssword@gmail.com');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- -g "reply-by-email"`
Expected: FAIL — the route returns 404 (essay does not exist yet), so the `.essay-reply` locator is not found.

- [ ] **Step 3: Create the showcase essay**

Create `src/content/essays/a-map-of-the-hedge.md` (exact content):

````markdown
---
title: A map of the hedge
excerpt: Putting a number on the thing the last essay only gestured at.
pubDate: 2026-06-19
status: brewed
tags:
  - uncertainty
  - language models
---

In an earlier piece I left a claim steeping: that the uncertainty a model
reports about its own answer is not noise to be calibrated away but a signal
about the shape of what it was trained on. I want to come back and make one
small part of it precise, because a claim you can measure is a claim you can
be wrong about.

Start with the thing the model actually produces. At each step it emits a
probability distribution over the next token, and the quantity that summarizes
how spread out that distribution is — how much the model is hedging — is its
entropy[^entropy]. For a distribution $p$ over $n$ choices it is

$$ H(p) = -\sum_{i} p_i \log p_i $$

When the model is confident, almost all the mass sits on one token and $H(p)$
falls close to zero. When it hedges, the mass spreads and $H(p)$ climbs toward
$\log n$, its largest possible value. So a single number, read token by token,
traces the texture of the doubt. In code it is almost nothing:

```python
import torch

def entropy(logits):
    """mean token-level uncertainty, in nats"""
    p = torch.softmax(logits, dim=-1)
    return -(p * p.log()).sum(-1).mean()

# higher score = the model is hedging
score = entropy(model(batch))
note = "watch where the data was thin"
```

> The hedge has a texture, and the texture is a map.

Plotted across a generated paragraph, the entropy is not flat. It spikes at the
places where the model had to choose — a name, a date, a claim it half
remembers — and falls back to near zero through the connective tissue of
grammar, where there was never any real choice to make[^grammar].

<figure>
<svg viewBox="0 0 640 200" role="img" aria-label="Per-token entropy across a generated paragraph" xmlns="http://www.w3.org/2000/svg">
<polyline fill="none" stroke="#D9914A" stroke-width="2" points="0,170 40,165 80,58 120,150 160,158 200,38 240,150 280,118 320,168 360,28 400,150 440,160 480,88 520,150 560,162 600,52 640,150" />
<line x1="0" y1="186" x2="640" y2="186" stroke="#94846F" stroke-width="1" />
</svg>
<figcaption>Per-token entropy across one generated paragraph. The peaks are the decisions.</figcaption>
</figure>

That is all this essay claims: that the curve is legible, and that its peaks
line up with the moments where the training data was thin or contradictory.
Whether the map is *accurate* — whether the hedge tracks the data and not some
artifact of the decoding — is the harder question, and the one I am still
leaving in the dark to settle.

[^entropy]: Measured in nats here, since the code uses the natural logarithm.
    Switch to base two and you get bits, and the same shape.

[^grammar]: Which is itself a kind of finding: most of what a language model
    emits costs it almost no uncertainty at all.
````

- [ ] **Step 4: Wire the article class + reply prompt**

Replace the full contents of `src/pages/essays/[...slug].astro` with:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection, render } from 'astro:content';
import { selectEssays } from '../../lib/essays';
import { REPLY_EMAIL } from '../../consts';

export async function getStaticPaths() {
  const { published } = selectEssays(await getCollection('essays'), {
    includeDrafts: import.meta.env.DEV,
  });
  return published.map((essay) => ({
    params: { slug: essay.id },
    props: { essay },
  }));
}

const { essay } = Astro.props;
const { Content, remarkPluginFrontmatter } = await render(essay);
const minutesRead = remarkPluginFrontmatter.minutesRead as number;
---

<BaseLayout title={essay.data.title} description={essay.data.excerpt}>
  <article class="essay">
    <h1 class="font-display">{essay.data.title}</h1>
    <div class="font-ui text-muted">
      {essay.data.status === 'steeping' && <span class="text-copper" data-status="steeping">steeping</span>}
      <span>{minutesRead} min read</span>
    </div>
    <Content />
    <aside class="essay-reply font-ui">
      Found a mistake, or want to push back? <a href={`mailto:${REPLY_EMAIL}`}>Reply by email.</a>
    </aside>
  </article>
</BaseLayout>
```

- [ ] **Step 5: Add the reply-prompt style**

Append to `src/styles/global.css`:

```css
/* Essay: a quiet reply-by-email prompt at the foot (no comment section). */
.essay-reply {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-glow);
  color: var(--color-muted);
}
.essay-reply a {
  color: var(--color-copper);
  text-underline-offset: 4px;
}
.essay-reply a:hover {
  text-decoration: underline;
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm run test:e2e -- -g "reply-by-email"`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/content/essays/a-map-of-the-hedge.md src/pages/essays/'[...slug].astro' src/styles/global.css tests/e2e/essay-reading.spec.ts
git commit -m "feat: showcase essay + reply-by-email prompt (#4)"
```

---

### Task 2: Asymmetric wide-track reading layout

Prose holds a ~68ch measure and hugs the left; code, math, and figures extend right into a ~80ch track. The essay already contains a `<pre>` and a `<figure>`, so the test has wide elements to measure.

**Files:**
- Modify: `src/styles/global.css` (add `--container-wide` token + `.essay` layout rules)
- Modify: `tests/e2e/essay-reading.spec.ts` (append one test)

- [ ] **Step 1: Write the failing test**

Append to `tests/e2e/essay-reading.spec.ts`:

```ts
test('prose holds a reading measure while code and figures use a wider track', async ({ page }) => {
  await page.goto(ESSAY);
  const article = page.locator('article.essay');
  const para = article.locator('p').first();
  const pre = article.locator('pre').first();
  const figure = article.locator('figure').first();

  const [pw, prew, fw] = await Promise.all([
    para.evaluate((el) => el.clientWidth),
    pre.evaluate((el) => el.clientWidth),
    figure.evaluate((el) => el.clientWidth),
  ]);
  expect(pw).toBeGreaterThan(420);
  expect(pw).toBeLessThan(760); // within ~65–75ch at the body size
  expect(prew).toBeGreaterThan(pw); // code extends past the prose measure
  expect(fw).toBeGreaterThan(pw); // figure extends past the prose measure

  // Layout B: prose and wide blocks share the left edge; wide blocks reach right.
  const [paraLeft, preLeft, contentLeft] = await Promise.all([
    para.evaluate((el) => el.getBoundingClientRect().left),
    pre.evaluate((el) => el.getBoundingClientRect().left),
    article.evaluate((el) => el.getBoundingClientRect().left + parseFloat(getComputedStyle(el).paddingLeft)),
  ]);
  expect(Math.abs(paraLeft - contentLeft)).toBeLessThan(2);
  expect(Math.abs(preLeft - contentLeft)).toBeLessThan(2);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- -g "wider track"`
Expected: FAIL — without `.essay` rules the article is full-width, so the paragraph is wider than 760px and not narrower than the `<pre>`.

- [ ] **Step 3: Add the layout token**

In `src/styles/global.css`, inside the `@theme { ... }` block, add `--container-wide` directly after the existing `--container-prose` line:

```css
  /* Reading measure — prose held to ~68 characters. */
  --container-prose: 68ch;
  /* Wide track — code, math, and figures extend past the prose measure. */
  --container-wide: 80ch;
```

- [ ] **Step 4: Add the essay layout rules**

Append to `src/styles/global.css`:

```css
/* Essay reading surface (issue #4): asymmetric measure. The article is the
   ~80ch wide track; prose children hold ~68ch and hug the left, while code,
   math, and figures fill the full width and so extend rightward. */
.essay {
  max-width: var(--container-wide);
  margin-inline: auto;
  padding-inline: 1.25rem;
}
.essay > * {
  max-width: var(--container-prose);
}
.essay > :is(pre, figure, table),
.essay > :has(.katex-display) {
  max-width: 100%;
}
.essay pre {
  padding: 1rem 1.25rem;
  border: 1px solid var(--color-panel);
  border-radius: 0.5rem;
  overflow-x: auto;
}
.essay figure {
  margin-inline: 0;
}
.essay figure svg {
  display: block;
  width: 100%;
  height: auto;
}
.essay figcaption {
  margin-top: 0.5rem;
  font-family: var(--font-ui);
  font-size: var(--text-step--1);
  color: var(--color-muted);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test:e2e -- -g "wider track"`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/styles/global.css tests/e2e/essay-reading.spec.ts
git commit -m "feat: asymmetric wide-track essay reading layout (#4)"
```

---

### Task 3: Custom cold-brew Shiki theme

**Files:**
- Create: `src/lib/shiki-cold-brew.ts`
- Modify: `astro.config.mjs`
- Modify: `tests/e2e/essay-reading.spec.ts` (append one test)

- [ ] **Step 1: Write the failing test**

Append to `tests/e2e/essay-reading.spec.ts`:

```ts
test('code blocks use the cold-brew Shiki theme', async ({ page }) => {
  await page.goto(ESSAY);
  const pre = page.locator('article.essay pre').first();

  const bg = await pre.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(parseRgb(bg)).toEqual([30, 22, 17]); // panel #1E1611

  const tokenColors = await pre
    .locator('span')
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).color));
  const rgbs = tokenColors.map(parseRgb);
  expect(rgbs).toContainEqual([217, 145, 74]); // copper keyword #D9914A
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- -g "cold-brew Shiki theme"`
Expected: FAIL — the default Shiki theme renders a non-panel background (not `rgb(30,22,17)`) and no copper token.

- [ ] **Step 3: Create the theme module**

Create `src/lib/shiki-cold-brew.ts`:

```ts
import type { ThemeRegistrationRaw } from 'shiki';

// Custom Shiki theme keyed to the cold-brew palette (issue #4, scheme A):
// panel background, cream text, copper keywords, amber strings, soft-amber
// numbers, muted-italic comments. The amber token hues are syntax-internal and
// intentionally not part of the global @theme palette.
export const coldBrew: ThemeRegistrationRaw = {
  name: 'cold-brew',
  type: 'dark',
  colors: {
    'editor.background': '#1E1611',
    'editor.foreground': '#EAE0D2',
  },
  settings: [
    { settings: { background: '#1E1611', foreground: '#EAE0D2' } },
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: '#94846F', fontStyle: 'italic' },
    },
    {
      scope: ['keyword', 'keyword.control', 'storage', 'storage.type', 'storage.modifier'],
      settings: { foreground: '#D9914A' },
    },
    {
      scope: ['string', 'string.quoted', 'string.template', 'constant.other.symbol'],
      settings: { foreground: '#E6B873' },
    },
    {
      scope: ['constant.numeric', 'constant.language', 'constant.language.boolean'],
      settings: { foreground: '#CDA86A' },
    },
    {
      scope: ['entity.name.function', 'support.function', 'meta.function-call'],
      settings: { foreground: '#EAE0D2' },
    },
    {
      scope: ['variable', 'meta.definition.variable', 'variable.other'],
      settings: { foreground: '#EAE0D2' },
    },
    {
      scope: ['entity.name.type', 'support.type', 'support.class', 'entity.name.class'],
      settings: { foreground: '#EAE0D2' },
    },
    {
      scope: ['keyword.operator', 'punctuation'],
      settings: { foreground: '#94846F' },
    },
  ],
};
```

- [ ] **Step 4: Wire the theme into the markdown config**

Replace the full contents of `astro.config.mjs` with:

```js
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import { remarkReadingTime } from './src/lib/remark-reading-time';
import { coldBrew } from './src/lib/shiki-cold-brew';

// https://astro.build/config
// Tailwind v4 is wired via PostCSS (see postcss.config.mjs) rather than
// @tailwindcss/vite, which is incompatible with the rolldown-vite bundled in
// Astro 6 (withastro/astro#16542).
export default defineConfig({
  site: 'https://coldbrew.live',
  markdown: {
    // Top-level shikiConfig still reaches the processor via its `shared`
    // options, so the custom theme applies without abandoning `unified()`.
    shikiConfig: { theme: coldBrew },
    // `unified({...})` keeps Astro's defaults (GFM, smartypants, Shiki) and
    // just appends our build-time reading-time plugin.
    processor: unified({
      remarkPlugins: [remarkReadingTime],
    }),
  },
});
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test:e2e -- -g "cold-brew Shiki theme"`
Expected: PASS. (If the background is correct but no copper token is found, the Python keyword scopes differ — widen the copper `scope` array in `shiki-cold-brew.ts` to include the scope Shiki reports, then re-run.)

- [ ] **Step 6: Commit**

```bash
git add src/lib/shiki-cold-brew.ts astro.config.mjs tests/e2e/essay-reading.spec.ts
git commit -m "feat: custom cold-brew Shiki code theme (#4)"
```

---

### Task 4: Build-time KaTeX math, self-hosted

**Files:**
- Modify: `package.json` + `package-lock.json` (install deps)
- Modify: `astro.config.mjs`
- Modify: `src/pages/essays/[...slug].astro` (import KaTeX CSS)
- Modify: `src/styles/global.css` (display-math overflow)
- Modify: `tests/e2e/essay-reading.spec.ts` (append one test)

- [ ] **Step 1: Write the failing test**

Append to `tests/e2e/essay-reading.spec.ts`:

```ts
test('inline and display math render via KaTeX, fully self-hosted', async ({ page }) => {
  const thirdParty: string[] = [];
  page.on('request', (req) => {
    const url = new URL(req.url());
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return; // ignore data:/blob:
    if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') thirdParty.push(req.url());
  });

  await page.goto(ESSAY);

  await expect(page.locator('.katex').first()).toBeVisible(); // inline math
  await expect(page.locator('.katex-display').first()).toBeVisible(); // display math
  expect(await page.locator('script[src*="katex" i]').count()).toBe(0); // no client-side math JS
  expect(thirdParty, `unexpected third-party requests: ${thirdParty.join(', ')}`).toHaveLength(0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- -g "self-hosted"`
Expected: FAIL — `$…$`/`$$…$$` render as literal text, so no `.katex` element exists.

- [ ] **Step 3: Install the math dependencies**

Run: `npm install remark-math rehype-katex katex`
Expected: adds `remark-math`, `rehype-katex`, and `katex` to `dependencies` in `package.json`.

- [ ] **Step 4: Wire the math plugins**

Replace the full contents of `astro.config.mjs` with:

```js
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { remarkReadingTime } from './src/lib/remark-reading-time';
import { coldBrew } from './src/lib/shiki-cold-brew';

// https://astro.build/config
// Tailwind v4 is wired via PostCSS (see postcss.config.mjs) rather than
// @tailwindcss/vite, which is incompatible with the rolldown-vite bundled in
// Astro 6 (withastro/astro#16542).
export default defineConfig({
  site: 'https://coldbrew.live',
  markdown: {
    shikiConfig: { theme: coldBrew },
    // remark-math parses `$…$`/`$$…$$`; rehype-katex renders it to HTML+MathML
    // at build time (no client JS). The KaTeX stylesheet is imported (and thus
    // self-hosted) in the essay route.
    processor: unified({
      remarkPlugins: [remarkMath, remarkReadingTime],
      rehypePlugins: [rehypeKatex],
    }),
  },
});
```

- [ ] **Step 5: Self-host the KaTeX stylesheet**

In `src/pages/essays/[...slug].astro`, add the CSS import as the last line of the frontmatter imports (after the `REPLY_EMAIL` import):

```astro
import { REPLY_EMAIL } from '../../consts';
import 'katex/dist/katex.min.css';
```

- [ ] **Step 6: Let long equations scroll without widening the page**

Append to `src/styles/global.css`:

```css
/* Display equations live in the wide track; allow long ones to scroll. */
.essay .katex-display {
  overflow-x: auto;
  overflow-y: hidden;
  padding-block: 0.25rem;
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm run test:e2e -- -g "self-hosted"`
Expected: PASS (`.katex` and `.katex-display` present; zero third-party requests; no katex `<script>`).

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json astro.config.mjs src/pages/essays/'[...slug].astro' src/styles/global.css tests/e2e/essay-reading.spec.ts
git commit -m "feat: build-time self-hosted KaTeX math (#4)"
```

---

### Task 5: Footnote styling

GFM already emits the footnotes section; this task styles it (top hairline, muted, copper links) so it reads as a quiet apparatus.

**Files:**
- Modify: `src/styles/global.css`
- Modify: `tests/e2e/essay-reading.spec.ts` (append one test)

- [ ] **Step 1: Write the failing test**

Append to `tests/e2e/essay-reading.spec.ts`:

```ts
test('footnotes are collected and styled at the foot of the essay', async ({ page }) => {
  await page.goto(ESSAY);

  const section = page.locator('article.essay section[data-footnotes]');
  await expect(section).toBeVisible();

  // A reference links to a definition that exists, and the definition links back.
  const ref = page.locator('a[data-footnote-ref]').first();
  const href = await ref.getAttribute('href');
  expect(href).toMatch(/^#/);
  const def = page.locator(href as string);
  await expect(def).toBeVisible();
  await expect(def.locator('a[data-footnote-backref]')).toHaveCount(1);

  // Styled distinctly from body text: a top hairline separator.
  const borderTopWidth = await section.evaluate((el) => parseFloat(getComputedStyle(el).borderTopWidth));
  expect(borderTopWidth).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- -g "footnotes are collected"`
Expected: FAIL — the footnotes section renders (GFM) and links resolve, but it has no top border yet, so `borderTopWidth` is 0.

- [ ] **Step 3: Add footnote styles**

Append to `src/styles/global.css`:

```css
/* Footnotes: a quiet apparatus at the foot of the essay. */
.essay .footnotes {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-glow);
  font-size: var(--text-step--1);
  color: var(--color-muted);
}
.essay .footnotes a {
  color: var(--color-copper);
}
.essay sup a[data-footnote-ref] {
  color: var(--color-copper);
  text-decoration: none;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:e2e -- -g "footnotes are collected"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css tests/e2e/essay-reading.spec.ts
git commit -m "feat: style essay footnotes (#4)"
```

---

### Task 6: Pull-quote styling

**Files:**
- Modify: `src/styles/global.css`
- Modify: `tests/e2e/essay-reading.spec.ts` (append one test)

- [ ] **Step 1: Write the failing test**

Append to `tests/e2e/essay-reading.spec.ts`:

```ts
test('pull-quotes are visually distinct from body text', async ({ page }) => {
  await page.goto(ESSAY);
  const quote = page.locator('article.essay blockquote').first();
  await expect(quote).toBeVisible();

  const { borderLeftColor, borderLeftWidth, fontStyle } = await quote.evaluate((el) => {
    const s = getComputedStyle(el);
    return { borderLeftColor: s.borderLeftColor, borderLeftWidth: s.borderLeftWidth, fontStyle: s.fontStyle };
  });
  expect(parseRgb(borderLeftColor)).toEqual([217, 145, 74]); // copper #D9914A
  expect(parseFloat(borderLeftWidth)).toBeGreaterThan(0);
  expect(fontStyle).toBe('italic');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- -g "pull-quotes"`
Expected: FAIL — an unstyled `<blockquote>` has no copper left border and is not italic.

- [ ] **Step 3: Add pull-quote styles**

Append to `src/styles/global.css`:

```css
/* Pull-quotes (scheme A): one copper-rule + italic style serves both real
   quotations and emphasis (plain Markdown gives us only the blockquote). */
.essay blockquote {
  margin-inline: 0;
  padding-left: 1.25rem;
  border-left: 3px solid var(--color-copper);
  font-style: italic;
  font-size: var(--text-step-1);
  line-height: 1.5;
  color: var(--color-cream);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:e2e -- -g "pull-quotes"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css tests/e2e/essay-reading.spec.ts
git commit -m "feat: style essay pull-quotes (#4)"
```

---

### Task 7: Full-suite verification + manual browser check

**Files:** none (verification only; commit fixups if needed)

- [ ] **Step 1: Run the full suite**

Run: `npm test`
Expected: `astro check` reports 0 errors, vitest passes, and all Playwright specs pass (the six new `essay-reading` tests plus the existing `home`, `essays`, `lifecycle`, `typography`, `footer`, `theme` specs — confirm no regressions). The `lifecycle` spec must still find exactly one steeping essay (the new essay is `brewed`).

- [ ] **Step 2: Manual browser check**

Run: `npm run dev`
Open `http://localhost:4321/essays/a-map-of-the-hedge/` and confirm by eye:
- code block on the panel background with copper keywords, amber strings, muted-italic comments;
- inline and display math rendered cleanly (no raw `$` signs);
- the pull-quote with a copper left rule;
- footnotes with a hairline separator and copper links that jump to definitions and back;
- prose held to a comfortable measure while code, the equation, and the figure extend rightward;
- the reply-by-email line at the foot.
Also resize to a narrow (~375px) width and confirm everything collapses to a single readable column. Stop the dev server when done.

- [ ] **Step 3: Commit any fixups**

If the manual check required tweaks:

```bash
git add -A
git commit -m "fix: essay reading-experience polish from manual review (#4)"
```

If nothing needed changing, skip this step.

---

## Self-review notes (for the implementer)

- **Spec coverage:** code theme → Task 3; math self-hosted → Task 4; footnotes → Task 5; pull-quotes → Task 6; prose measure + wide track → Task 2; reply-by-email → Task 1. All six acceptance criteria are covered.
- **Known fragilities, already handled:** the display-math wide selector uses `.essay > :has(.katex-display)` so it does not depend on the exact `remark-math` wrapper class; the Shiki copper-token assertion has a documented widen-the-scope fallback (Task 3, Step 5); essay is `brewed` so the steeping-count lifecycle test is unaffected.
- **If `.essay > *` does not match the rendered content** (i.e., Astro wraps `<Content />` output in a container), inspect the built HTML for the essay and apply the measure/wide rules to the actual direct children (e.g., add the container to the selector). Verify during Task 2.
- After all tasks pass, the branch is ready to merge back to `develop` (handled outside this plan via the finishing-a-development-branch step).
