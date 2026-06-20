export type Lifecycle = 'draft' | 'steeping' | 'brewed';

interface EssayLike {
  data: { status: Lifecycle; pubDate: Date; tags: string[] };
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
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
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
export async function toDisplayEssays<T extends { id: string }>(
  essays: readonly T[],
  render: (essay: T) => Promise<Rendered>,
): Promise<DisplayEssay<T>[]> {
  return Promise.all(
    essays.map(async (essay) => ({
      essay,
      minutesRead: minutesReadOf(await render(essay)),
      href: essayHref(essay.id),
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
