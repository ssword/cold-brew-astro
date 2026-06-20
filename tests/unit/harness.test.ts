import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, it, expect } from 'vitest';
import Smoke from './fixtures/Smoke.astro';

// Proves the component-test harness (issue #14): vitest runs under
// getViteConfig(), so .astro components compile and the Container API renders
// them. The later display-layer slices (#15/#16) test real components here.
describe('component-test harness', () => {
  it('renders an .astro component to HTML through the Container API', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Smoke, { props: { label: 'steeped' } });
    expect(html).toContain('data-smoke');
    expect(html).toContain('steeped');
  });

  it('resolves astro:* virtual modules (astro:content)', async () => {
    const { getCollection } = await import('astro:content');
    expect(typeof getCollection).toBe('function');
  });
});
