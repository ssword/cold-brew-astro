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
  /** The essay body as plain text. Matched but never rendered. */
  text: string;
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
  rendered?: { html?: string };
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
        text: htmlToSearchText(renderedHtmlOf(essay)),
      })),
  };
}

function renderedHtmlOf(essay: SearchableEssay): string {
  if (essay.rendered?.html === undefined) {
    throw new Error(`Essay "${essay.id}" has no rendered HTML for the search index`);
  }
  return essay.rendered.html;
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

// Tags that separate words; any other (inline) tag is removed without a gap so
// `<em>over</em>fit` stays one word.
const BLOCK_TAG =
  /<\/?(?:p|h[1-6]|li|ul|ol|blockquote|pre|br|hr|div|section|figure|figcaption|table|thead|tbody|tr|td|th|dl|dt|dd|aside|details|summary)\b[^>]*>/giu;

/**
 * Reduces rendered essay HTML to the text a reader sees. KaTeX emits each
 * formula twice (MathML for assistive tech, including the TeX source, plus
 * the visible glyphs), so the MathML copy is dropped to keep TeX commands
 * out of the index.
 */
export function htmlToSearchText(html: string): string {
  return html
    .replace(/<span class="katex-mathml">[\s\S]*?<\/math><\/span>/gu, '')
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/giu, ' ')
    .replace(BLOCK_TAG, ' ')
    .replace(/<[^>]*>/gu, '')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/giu, (entity, code: string) => {
      if (code[0] === '#') {
        const point = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1));
        return String.fromCodePoint(point);
      }
      return NAMED_ENTITIES[code.toLowerCase()] ?? entity;
    })
    .replace(/\s+/gu, ' ')
    .trim();
}

/** Case- and width-insensitive form used on both sides of a match. */
export function normalizeForSearch(text: string): string {
  return text.normalize('NFKC').toLowerCase();
}

// Each field's weight when a query term appears in it. Title beats tags beats
// excerpt beats body text; a term counts once per field.
const FIELD_WEIGHTS = { title: 4, tags: 3, excerpt: 2, text: 1 } as const;

function termScore(document: SearchDocument, term: string): number {
  let score = 0;
  if (normalizeForSearch(document.title).includes(term)) score += FIELD_WEIGHTS.title;
  if (document.tags.some((tag) => normalizeForSearch(tag).includes(term)))
    score += FIELD_WEIGHTS.tags;
  if (normalizeForSearch(document.excerpt).includes(term)) score += FIELD_WEIGHTS.excerpt;
  if (normalizeForSearch(document.text).includes(term)) score += FIELD_WEIGHTS.text;
  return score;
}

function fieldsOf(document: SearchDocument): string[] {
  return [document.title, ...document.tags, document.excerpt, document.text];
}

/**
 * Returns the documents matching every whitespace-separated term of `query`,
 * best match first. Matching is substring-based, so it does not depend on
 * word boundaries. A document holding the whole query as one phrase ranks
 * above one that only scatters its terms; within each group, field weights
 * decide. Ties fall back to newest first, then title, so results are
 * deterministic. An empty query matches nothing.
 */
export function searchDocuments(
  documents: readonly SearchDocument[],
  query: string,
): SearchDocument[] {
  const terms = normalizeForSearch(query).split(/\s+/u).filter(Boolean);
  if (terms.length === 0) return [];
  const phrase = terms.join(' ');

  return documents
    .map((document) => {
      const scores = terms.map((term) => termScore(document, term));
      return {
        document,
        matched: scores.every((score) => score > 0),
        phrase: fieldsOf(document).some((field) => normalizeForSearch(field).includes(phrase)),
        score: scores.reduce((sum, score) => sum + score, 0),
      };
    })
    .filter((hit) => hit.matched)
    .sort(
      (a, b) =>
        Number(b.phrase) - Number(a.phrase) ||
        b.score - a.score ||
        b.document.pubDate.localeCompare(a.document.pubDate) ||
        a.document.title.localeCompare(b.document.title),
    )
    .map((hit) => hit.document);
}
