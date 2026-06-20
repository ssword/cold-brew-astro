import { getViteConfig } from 'astro/config';
import type { TestUserConfig } from 'vitest/config';

// Astro-aware Vite config so the unit suite can compile `.astro` components and
// resolve `astro:*` virtuals (e.g. `astro:content`) via the Container API. The
// pure-logic suites (selection, reading time, seed content) still run here on a
// node environment; Playwright (tests/e2e) owns the built-output checks.
//
// The `test` block is typed via vitest's own `TestUserConfig` and the wrapper is
// cast to `getViteConfig`'s parameter type: Astro 6 bundles rolldown-vite under
// its own nested `vite`, so vitest's `test` augmentation of the top-level `vite`
// never reaches `getViteConfig`'s parameter.
const test: TestUserConfig = {
  include: ['tests/unit/**/*.test.ts'],
  environment: 'node',
};

export default getViteConfig({ test } as Parameters<typeof getViteConfig>[0]);
