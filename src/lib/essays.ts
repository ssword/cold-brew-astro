type Lifecycle = 'draft' | 'steeping' | 'brewed';

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
