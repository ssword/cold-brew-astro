import { describe, expect, it } from 'vitest';
import { absolutizeFeedHtml, toRssItems } from '../../src/lib/feeds';

describe('absolutizeFeedHtml', () => {
  it('resolves fragment and root-relative URLs against the canonical essay URL', () => {
    const html =
      '<p><a href="#note">Note</a><img src="/images/chart.png" alt="Chart"></p>';
    const url = new URL('https://coldbrew.live/essays/a-map/');

    expect(absolutizeFeedHtml(html, url)).toBe(
      '<p><a href="https://coldbrew.live/essays/a-map/#note">Note</a>' +
        '<img src="https://coldbrew.live/images/chart.png" alt="Chart"></p>',
    );
  });
});

describe('toRssItems', () => {
  it('includes rendered HTML, categories, canonical links, and revision metadata', () => {
    const [item] = toRssItems(
      [
        {
          id: 'the-long-steep',
          data: {
            title: 'The long steep',
            excerpt: 'An evolving thought.',
            pubDate: new Date('2026-05-20'),
            updatedDate: new Date('2026-07-30'),
            tags: ['uncertainty', 'language models'],
          },
          rendered: { html: '<p id="opening">The complete essay.</p>' },
        },
      ],
      new URL('https://coldbrew.live'),
    );

    expect(item.link).toBe('https://coldbrew.live/essays/the-long-steep/');
    expect(item.content).toContain('<p id="opening">The complete essay.</p>');
    expect(item.categories).toEqual(['uncertainty', 'language models']);
    expect(item.customData).toBe(
      '<atom:updated>2026-07-30T00:00:00.000Z</atom:updated>',
    );
  });

  it('fails loudly if a collection entry has no rendered feed content', () => {
    expect(() =>
      toRssItems(
        [
          {
            id: 'missing-render',
            data: {
              title: 'Missing',
              excerpt: 'Missing content.',
              pubDate: new Date('2026-01-01'),
              tags: [],
            },
          },
        ],
        new URL('https://coldbrew.live'),
      ),
    ).toThrow('has no rendered HTML');
  });
});
