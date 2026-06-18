import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import { remarkReadingTime } from './src/lib/remark-reading-time';
import { coldBrew } from './src/lib/shiki-cold-brew';

// https://astro.build/config
// Tailwind v4 is wired via PostCSS (see postcss.config.mjs) rather than
// @tailwindcss/vite, which is incompatible with the rolldown-vite bundled in
// Astro 6 (withastro/astro#16542).
export default defineConfig({
  site: 'https://coldbrew.live',
  markdown: {
    // Top-level shikiConfig still reaches the processor via its `shared`
    // options, so the custom theme applies without abandoning `unified()`.
    shikiConfig: { theme: coldBrew },
    // `unified({...})` keeps Astro's defaults (GFM, smartypants, Shiki) and
    // just appends our build-time reading-time plugin.
    processor: unified({
      remarkPlugins: [remarkReadingTime],
    }),
  },
});
