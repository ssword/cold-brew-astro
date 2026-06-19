import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, it, expect } from 'vitest';
import StatusTag from '../../src/components/StatusTag.astro';

// StatusTag owns the single rule deciding the visible lifecycle label:
// steeping -> the copper "steeping" tag; draft and brewed -> nothing.
describe('StatusTag', () => {
  it('renders the copper steeping tag for a steeping essay', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(StatusTag, { props: { status: 'steeping' } });
    expect(html).toContain('data-status="steeping"');
    expect(html).toContain('steeping');
  });

  it('renders nothing for a draft essay', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(StatusTag, { props: { status: 'draft' } });
    expect(html).not.toContain('data-status');
    expect(html.trim()).toBe('');
  });

  it('renders nothing for a brewed essay', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(StatusTag, { props: { status: 'brewed' } });
    expect(html).not.toContain('data-status');
    expect(html.trim()).toBe('');
  });
});
