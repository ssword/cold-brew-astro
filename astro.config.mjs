import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import { remarkReadingTime } from './src/lib/remark-reading-time';

// https://astro.build/config
// Tailwind v4 is wired via PostCSS (see postcss.config.mjs) rather than
// @tailwindcss/vite, which is incompatible with the rolldown-vite bundled in
// Astro 6 (withastro/astro#16542).
export default defineConfig({
  site: 'https://coldbrew.live',
  markdown: {
    // `unified({...})` keeps Astro's defaults (GFM, smartypants, Shiki) and
    // just appends our build-time reading-time plugin.
    processor: unified({
      remarkPlugins: [remarkReadingTime],
    }),
  },
});
