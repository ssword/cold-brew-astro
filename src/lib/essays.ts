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
  const featured = published.at(0);
  const tags = [...new Set(published.flatMap((e) => e.data.tags))].sort();
  return { published, featured, tags };
}

export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
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
