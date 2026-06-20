import { describe, it, expect } from 'vitest';
import { selectEssays, tagSlug, groupByTag, essayHref, minutesReadOf, toDisplayEssays } from '../../src/lib/essays';

type Lifecycle = 'draft' | 'steeping' | 'brewed';

const essay = (id: string, status: Lifecycle, pubDate: string, tags: string[] = []) => ({
  id,
  data: { title: id, status, pubDate: new Date(pubDate), tags },
});

describe('selectEssays', () => {
  it('excludes drafts when drafts are not included (production)', () => {
    const { published } = selectEssays(
      [essay('a', 'brewed', '2026-01-01'), essay('b', 'draft', '2026-02-01')],
      { includeDrafts: false },
    );
    expect(published.map((e) => e.id)).toEqual(['a']);
  });

  it('sorts published essays by pubDate, newest first (the newest is the home-page feature)', () => {
    const { published } = selectEssays(
      [
        essay('old', 'brewed', '2026-01-01'),
        essay('new', 'brewed', '2026-03-01'),
        essay('mid', 'steeping', '2026-02-01'),
        essay('draft-newest', 'draft', '2026-09-01'),
      ],
      { includeDrafts: false },
    );
    expect(published.map((e) => e.id)).toEqual(['new', 'mid', 'old']);
  });

  it('derives the tag set from published essays only, deduped and sorted', () => {
    const { tags } = selectEssays(
      [
        essay('a', 'brewed', '2026-01-01', ['stats', 'deep learning']),
        essay('b', 'steeping', '2026-02-01', ['deep learning', 'llms']),
        essay('c', 'draft', '2026-03-01', ['secret-draft-tag']),
      ],
      { includeDrafts: false },
    );
    expect(tags).toEqual(['deep learning', 'llms', 'stats']);
  });

  it('includes drafts (and their tags) during local dev', () => {
    const { published, tags } = selectEssays(
      [
        essay('pub', 'brewed', '2026-01-01', ['stats']),
        essay('wip', 'draft', '2026-02-01', ['unfinished']),
      ],
      { includeDrafts: true },
    );
    expect(published.map((e) => e.id)).toEqual(['wip', 'pub']);
    expect(tags).toEqual(['stats', 'unfinished']);
  });
});

describe('tagSlug', () => {
  it('lowercases and hyphenates a multi-word tag for use in a URL', () => {
    expect(tagSlug('Deep Learning')).toBe('deep-learning');
  });
});

describe('essayHref', () => {
  it('builds the canonical /essays/{id}/ URL from an entry id', () => {
    expect(essayHref('a-map-of-the-hedge')).toBe('/essays/a-map-of-the-hedge/');
  });
});

describe('minutesReadOf', () => {
  it('reads minutesRead off a rendered essay’s remark frontmatter', () => {
    expect(minutesReadOf({ remarkPluginFrontmatter: { minutesRead: 7 } })).toBe(7);
  });
});

describe('toDisplayEssays', () => {
  it('maps each essay to its display form (essay, minutesRead, href), preserving order', async () => {
    const minutes: Record<string, number> = { newest: 9, oldest: 3 };
    const fakeRender = async (e: { id: string }) => ({
      remarkPluginFrontmatter: { minutesRead: minutes[e.id] },
    });

    const display = await toDisplayEssays([{ id: 'newest' }, { id: 'oldest' }], fakeRender);

    expect(display).toEqual([
      { essay: { id: 'newest' }, minutesRead: 9, href: '/essays/newest/' },
      { essay: { id: 'oldest' }, minutesRead: 3, href: '/essays/oldest/' },
    ]);
  });
});

describe('groupByTag', () => {
  it('groups essays by tag, tags sorted by name, essays kept in input (newest-first) order', () => {
    const groups = groupByTag([
      essay('new', 'brewed', '2026-03-01', ['deep learning', 'stats']),
      essay('old', 'brewed', '2026-01-01', ['deep learning']),
    ]);
    expect(groups.map((g) => g.tag)).toEqual(['deep learning', 'stats']);
    const dl = groups.find((g) => g.tag === 'deep learning')!;
    expect(dl.essays.map((e) => e.id)).toEqual(['new', 'old']);
  });
});
