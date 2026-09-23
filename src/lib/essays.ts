import {
  localizedEssayHref,
  languageOf,
  type EssayLanguage,
} from './i18n';

export type Lifecycle = 'draft' | 'steeping' | 'brewed';

interface EssayLike {
  data: {
    status: Lifecycle;
    pubDate: Date;
    tags: string[];
    lang?: EssayLanguage;
  };
}

export function selectEssays<T extends EssayLike>(
  entries: readonly T[],
  options: { includeDrafts: boolean },
) {
  const published = entries
    .filter((e) => options.includeDrafts || e.data.status !== 'draft')
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
  const tags = [...new Set(published.flatMap((e) => e.data.tags))].sort();
  return { published, tags };
}

// The feed is public: drafts are never included, regardless of environment.
export function publicEssays<T extends EssayLike>(entries: readonly T[]) {
  return selectEssays(entries, { includeDrafts: false });
}

// Content pages: drafts follow the environment's draft-visibility policy. The
// `import.meta.env.DEV` read lives here and nowhere else (drafts in dev, hidden
// in prod); call sites simply ask for the published essays.
export function publishedEssays<T extends EssayLike>(
  entries: readonly T[],
  includeDrafts = import.meta.env.DEV,
) {
  return selectEssays(entries, { includeDrafts });
}

export function tagSlug(tag: string): string {
  return tag
    .normalize('NFKC')
    .toLowerCase()
    .trim()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

export function essayHref(id: string): string {
  return `/essays/${id}/`;
}

type Rendered = { remarkPluginFrontmatter: Record<string, unknown> };

// The single place an essay's reading time is read off remark frontmatter; the
// `as number` cast lives here and nowhere else.
export function minutesReadOf(rendered: Rendered): number {
  return rendered.remarkPluginFrontmatter.minutesRead as number;
}

export interface DisplayEssay<T> {
  essay: T;
  minutesRead: number;
  href: string;
}

// Maps Astro's `render()` over selected essays to produce display-ready essays.
// `render` is injected so this module stays Astro-free and unit-testable.
export async function toDisplayEssays<
  T extends {
    id: string;
    data: { lang?: EssayLanguage; routeSlug?: string };
  },
>(
  essays: readonly T[],
  render: (essay: T) => Promise<Rendered>,
): Promise<DisplayEssay<T>[]> {
  return Promise.all(
    essays.map(async (essay) => ({
      essay,
      minutesRead: minutesReadOf(await render(essay)),
      href: localizedEssayHref(essay),
    })),
  );
}

export function groupByTag<T extends EssayLike>(published: readonly T[]) {
  const byTag = new Map<string, T[]>();
  for (const essay of published) {
    for (const tag of essay.data.tags) {
      const list = byTag.get(tag) ?? [];
      list.push(essay);
      byTag.set(tag, list);
    }
  }
  return [...byTag.entries()]
    .map(([tag, essays]) => ({ tag, slug: tagSlug(tag), essays }))
    .sort((a, b) => (a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : 0));
}

interface EssayReference {
  id: string;
}

interface TrailEssayLike {
  id: string;
  data: {
    title: string;
    lang?: EssayLanguage;
    series?: string;
    seriesOrder?: number;
    relatedEssays?: readonly EssayReference[];
  };
}

export interface EssayTrail<T> {
  series?: {
    title: string;
    position: number;
    total: number;
  };
  previous?: T;
  next?: T;
  related: T[];
}

/**
 * Resolves the explicit reading path for one essay.
 *
 * Series order supplies previous/next navigation. Manually curated related
 * references preserve their frontmatter order, while entries that are not in
 * the supplied public corpus (for example drafts in production) stay hidden.
 */
export function buildEssayTrail<T extends TrailEssayLike>(
  current: T,
  published: readonly T[],
): EssayTrail<T> {
  const seriesMembers = current.data.series
    ? published
        .filter(
          (essay) =>
            essay.data.series === current.data.series &&
            languageOf(essay.data) === languageOf(current.data),
        )
        .sort((a, b) => (a.data.seriesOrder ?? 0) - (b.data.seriesOrder ?? 0))
    : [];

  if (current.data.series) {
    const orders = seriesMembers.map((essay) => essay.data.seriesOrder);
    if (new Set(orders).size !== orders.length) {
      throw new Error(`Series "${current.data.series}" contains duplicate seriesOrder values`);
    }
  }

  const position = seriesMembers.findIndex((essay) => essay.id === current.id);
  const previous = position > 0 ? seriesMembers[position - 1] : undefined;
  const next =
    position >= 0 && position < seriesMembers.length - 1
      ? seriesMembers[position + 1]
      : undefined;

  const byId = new Map(published.map((essay) => [essay.id, essay]));
  const excluded = new Set([current.id, previous?.id, next?.id]);
  const related: T[] = [];
  const seen = new Set<string>();

  for (const reference of current.data.relatedEssays ?? []) {
    const essay = byId.get(reference.id);
    if (!essay || excluded.has(essay.id) || seen.has(essay.id)) continue;
    related.push(essay);
    seen.add(essay.id);
  }

  return {
    series:
      current.data.series && position >= 0
        ? {
            title: current.data.series,
            position: position + 1,
            total: seriesMembers.length,
          }
        : undefined,
    previous,
    next,
    related,
  };
}
