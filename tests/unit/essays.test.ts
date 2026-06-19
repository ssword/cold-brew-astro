import { describe, it, expect } from 'vitest';
import { selectEssays, tagSlug, groupByTag } from '../../src/lib/essays';

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

  it('sorts published essays by pubDate, newest first', () => {
    const { published } = selectEssays(
      [
        essay('old', 'brewed', '2026-01-01'),
        essay('new', 'brewed', '2026-03-01'),
        essay('mid', 'steeping', '2026-02-01'),
      ],
      { includeDrafts: false },
    );
    expect(published.map((e) => e.id)).toEqual(['new', 'mid', 'old']);
  });

  it('features the most recent published essay (a draft cannot be featured in production)', () => {
    const { featured } = selectEssays(
      [
        essay('brewed-newest', 'brewed', '2026-04-01'),
        essay('draft-newest', 'draft', '2026-09-01'),
      ],
      { includeDrafts: false },
    );
    expect(featured?.id).toBe('brewed-newest');
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
