import { defineConfig } from 'vitest/config';

// Unit tests cover the pure logic seams only (selection + reading time).
// They import plain TS modules with no `astro:*` virtuals, so a bare Node
// environment is enough; Playwright (tests/e2e) owns the built-output checks.
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
