import { defineConfig } from 'astro/config';

// https://astro.build/config
// Tailwind v4 is wired via PostCSS (see postcss.config.mjs) rather than
// @tailwindcss/vite, which is incompatible with the rolldown-vite bundled in
// Astro 6 (withastro/astro#16542).
export default defineConfig({
  site: 'https://coldbrew.live',
});
