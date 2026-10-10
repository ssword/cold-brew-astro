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
| 4 | Print and offline reading | Add a polished print stylesheet that removes atmosphere and controls while preserving math, code, figures, and footnotes. Later, this could grow into downloadable PDF/EPUB or PWA caching. | Small | Complete (print) |
| 5 | Technical-source cards | Add optional metadata for papers, notebooks, code, datasets, and citations, rendered as a "reproduce or read further" panel. | Medium | Complete |
| 6 | Bilingual publishing | Add language and translation metadata, dynamic document language, CJK fonts, character-aware reading time, and locale routes. | Large | Complete |
| 7 | Per-essay social cards | Generate title-specific Open Graph images and Article JSON-LD with publication, tag, and revision metadata. | Medium | Complete |
| 8 | Static search | Build a private client-side index over titles, excerpts, tags, and essay text once the corpus is large enough that chronology and tags are no longer sufficient. | Medium | Planned |

## Recommended next milestone

Print styles are in place; offline reading (PWA caching or PDF/EPUB export) is
the remaining half of item 4. Static search can follow when the corpus is large
enough to justify it.

## Maintenance note

Vitest would otherwise install its own Vite 8 alongside Astro 6's Vite 7. The
`overrides.vite` entry in `package.json` keeps a single Vite 7 copy; drop it
when upgrading to an Astro major that ships Vite 8.
