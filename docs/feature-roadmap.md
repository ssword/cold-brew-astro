# Feature roadmap

The original `cold brew` product scope is complete: the site already supports
essay lifecycles, tags, RSS, technical Markdown, focus and sharing tools,
ambient audio, responsive layouts, and social metadata.

The next features should deepen the site's promise of slow, evolving writing
without adding engagement metrics, accounts, comments, or other mechanics that
compete with reading.

| Priority | Feature | Why it fits | Effort | Status |
| --- | --- | --- | --- | --- |
| 1 | Revision ledger | Add an updated date and revision notes to evolving essays. Show when an essay was last revised and what changed without replacing its original publication date. This directly supports the site's central promise. | Medium | Complete |
| 2 | Curated essay trails | Add series metadata, ordering, manually selected related essays, and previous/next links. This makes relationships between ideas navigable without introducing an opaque recommendation algorithm. | Medium | Complete |
| 3 | Full-content and per-tag RSS | Publish complete essays in the main feed and offer feeds for individual tags. This strengthens the site's algorithm-free subscription model. | Small–Medium | Complete |
| 4 | Print and offline reading | Add a polished print stylesheet that removes atmosphere and controls while preserving math, code, figures, and footnotes. Later, this could grow into downloadable PDF/EPUB or PWA caching. | Small | Complete (print; offline caching and PDF/EPUB export deferred) |
| 5 | Technical-source cards | Add optional metadata for papers, notebooks, code, datasets, and citations, rendered as a "reproduce or read further" panel. | Medium | Complete |
| 6 | Bilingual publishing | Add language and translation metadata, dynamic document language, CJK fonts, character-aware reading time, and locale routes. | Large | Complete |
| 7 | Per-essay social cards | Generate title-specific Open Graph images and Article JSON-LD with publication, tag, and revision metadata. | Medium | Complete |
| 8 | Static search | Build a private client-side index over titles, excerpts, tags, and essay text once the corpus is large enough that chronology and tags are no longer sufficient. | Medium | Complete |

## Recommended next milestone

All eight items have shipped. Print styles cover English and Chinese essays,
and browser Save as PDF stands in for offline reading. Static search runs
entirely in the browser over a per-language index built from published essays
(`/search/` and `/zh/search/`). The one open thread is the deferred half of
item 4: PWA caching or a PDF/EPUB export. Take it up only if readers ask for
more than the browser's Save as PDF gives them.

## Maintenance note

Astro 6 requires Vite 7, and Vitest accepts Vite 6, 7, or 8. Left alone, npm
gives Vitest its own Vite 8, and `astro dev` warns about the second copy. A
direct `vite` devDependency (`^7.3.2`, Astro's own range) makes the project's
Vite 7 the single hoisted copy that both Astro and Vitest resolve. It is a
declared dependency, not an `overrides` entry, so npm still checks it against
each package's Vite peer range and will report a conflict instead of forcing
Vite 7 onto a package that can no longer use it. Raise the range together with
Astro when moving to an Astro major that ships Vite 8, and confirm with
`npm ls vite` (one version) and a clean `astro dev` start.
