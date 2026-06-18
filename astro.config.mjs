import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { remarkReadingTime } from './src/lib/remark-reading-time';
import { coldBrew } from './src/lib/shiki-cold-brew';

// https://astro.build/config
// Tailwind v4 is wired via PostCSS (see postcss.config.mjs) rather than
// @tailwindcss/vite, which is incompatible with the rolldown-vite bundled in
// Astro 6 (withastro/astro#16542).
export default defineConfig({
  site: 'https://coldbrew.live',
  markdown: {
    shikiConfig: { theme: coldBrew },
    // remark-math parses `$…$`/`$$…$$`; rehype-katex renders it to HTML+MathML
    // at build time (no client JS). The KaTeX stylesheet is imported (and thus
    // self-hosted) in the essay route.
    processor: unified({
      remarkPlugins: [remarkMath, remarkReadingTime],
      rehypePlugins: [rehypeKatex],
    }),
  },
});
