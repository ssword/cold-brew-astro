import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const essays = defineCollection({
  loader: glob({ base: './src/content/essays', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    pubDate: z.coerce.date(),
    status: z.enum(['draft', 'steeping', 'brewed']),
    tags: z.array(z.string()).default([]),
    // Optional editorial flourish: a coffee-pairing note shown as a card at the
    // foot of the essay. Omitted on most posts; rendered only when present.
    brewingNotes: z.string().optional(),
  }),
});

export const collections = { essays };
