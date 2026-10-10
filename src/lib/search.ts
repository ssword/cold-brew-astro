import {
  LANGUAGE_INFO,
  languageOf,
  localizedEssayHref,
  type EssayLanguage,
} from './i18n';

/**
 * One essay in the static search index. Kept to what the results UI renders
 * plus the fields that are matched. `pubDate` is an ISO calendar day so the
 * index stays plain JSON.
 */
export interface SearchDocument {
  href: string;
  title: string;
  excerpt: string;
  tags: string[];
  pubDate: string;
}

export interface SearchIndex {
  lang: EssayLanguage;
  documents: SearchDocument[];
}

interface SearchableEssay {
  id: string;
  data: {
    title: string;
    excerpt: string;
    tags: string[];
    pubDate: Date;
    lang?: EssayLanguage;
    routeSlug?: string;
  };
}

/**
 * Language editions with a search surface. Each gets its own index file so a
 * page loads only its edition's data.
 */
export const SEARCH_LANGUAGES: readonly EssayLanguage[] = ['en'];

/** Where the built index for a language edition is served. */
export function searchIndexHref(language: EssayLanguage): string {
  return `/search-index/${LANGUAGE_INFO[language].route}.json`;
}

/**
 * Builds the index for one language edition. Callers pass the already
 * selected public essays (see `publicEssays`), so draft policy is not
 * re-decided here.
 */
export function buildSearchIndex(
  essays: readonly SearchableEssay[],
  language: EssayLanguage,
): SearchIndex {
  return {
    lang: language,
    documents: essays
      .filter((essay) => languageOf(essay.data) === language)
      .map((essay) => ({
        href: localizedEssayHref(essay),
        title: essay.data.title,
        excerpt: essay.data.excerpt,
        tags: [...essay.data.tags],
        pubDate: essay.data.pubDate.toISOString().slice(0, 10),
      })),
  };
}

/** Case- and width-insensitive form used on both sides of a match. */
export function normalizeForSearch(text: string): string {
  return text.normalize('NFKC').toLowerCase();
}

// Each field's weight when a query term appears in it. Title beats tags beats
// excerpt; a term counts once per field.
const FIELD_WEIGHTS = { title: 3, tags: 2, excerpt: 1 } as const;

function termScore(document: SearchDocument, term: string): number {
  let score = 0;
  if (normalizeForSearch(document.title).includes(term)) score += FIELD_WEIGHTS.title;
  if (document.tags.some((tag) => normalizeForSearch(tag).includes(term)))
    score += FIELD_WEIGHTS.tags;
  if (normalizeForSearch(document.excerpt).includes(term)) score += FIELD_WEIGHTS.excerpt;
  return score;
}

/**
 * Returns the documents matching every whitespace-separated term of `query`,
 * best match first. Matching is substring-based, so it does not depend on
 * word boundaries. Ties fall back to newest first, then title, so results are
 * deterministic. An empty query matches nothing.
 */
export function searchDocuments(
  documents: readonly SearchDocument[],
  query: string,
): SearchDocument[] {
  const terms = normalizeForSearch(query).split(/\s+/u).filter(Boolean);
  if (terms.length === 0) return [];

  return documents
    .map((document) => {
      const scores = terms.map((term) => termScore(document, term));
      return {
        document,
        matched: scores.every((score) => score > 0),
        score: scores.reduce((sum, score) => sum + score, 0),
      };
    })
    .filter((hit) => hit.matched)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.document.pubDate.localeCompare(a.document.pubDate) ||
        a.document.title.localeCompare(b.document.title),
    )
    .map((hit) => hit.document);
}
