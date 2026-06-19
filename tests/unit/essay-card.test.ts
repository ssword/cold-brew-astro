import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, it, expect } from 'vitest';
import EssayCard from '../../src/components/EssayCard.astro';
import type { Lifecycle } from '../../src/lib/essays';

const entry = (id: string, status: Lifecycle) => ({
  id,
  data: { title: `Title of ${id}`, excerpt: `Excerpt of ${id}.`, status },
});

describe('EssayCard', () => {
  it('renders a steeping essay as a list item with its link, excerpt, reading time, and steeping tag', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(EssayCard, {
      props: { essay: entry('the-long-steep', 'steeping'), minutesRead: 7, variant: 'list-item' },
    });

    expect(html).toContain('<li');
    expect(html).toContain('href="/essays/the-long-steep/"');
    expect(html).toContain('Title of the-long-steep');
    expect(html).toContain('Excerpt of the-long-steep.');
    expect(html).toContain('7 min read');
    expect(html).toContain('data-status="steeping"');
  });

  it('omits the steeping tag for a brewed essay', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(EssayCard, {
      props: { essay: entry('first-light', 'brewed'), minutesRead: 4, variant: 'list-item' },
    });

    expect(html).toContain('href="/essays/first-light/"');
    expect(html).not.toContain('data-status');
  });

  it('renders the featured variant as a prominent article with link, excerpt, and reading time', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(EssayCard, {
      props: { essay: entry('a-map-of-the-hedge', 'brewed'), minutesRead: 9, variant: 'featured' },
    });

    expect(html).toContain('data-featured');
    expect(html).not.toContain('<li');
    expect(html).toContain('href="/essays/a-map-of-the-hedge/"');
    expect(html).toContain('Title of a-map-of-the-hedge');
    expect(html).toContain('Excerpt of a-map-of-the-hedge.');
    expect(html).toContain('9 min read');
  });
});
