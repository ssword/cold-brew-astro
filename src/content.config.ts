import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { ESSAY_LANGUAGES } from './lib/i18n';

const revision = z.object({
  date: z.coerce.date(),
  summary: z.string().min(1),
});

const technicalSource = z.object({
  kind: z.enum([
    'paper',
    'code',
    'notebook',
    'dataset',
    'documentation',
    'article',
  ]),
  title: z.string().min(1),
  url: z.url(),
  note: z.string().min(1).optional(),
  citation: z.string().min(1).optional(),
});

const essays = defineCollection({
  loader: glob({ base: './src/content/essays', pattern: '**/*.md' }),
  schema: z
    .object({
      title: z.string(),
      excerpt: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      revisions: z.array(revision).default([]),
      status: z.enum(['draft', 'steeping', 'brewed']),
      tags: z.array(z.string()).default([]),
      lang: z.enum(ESSAY_LANGUAGES).default('en'),
      routeSlug: z
        .string()
        .regex(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          'routeSlug must contain lowercase letters, numbers, and hyphens',
        )
        .optional(),
      translationKey: z.string().min(1).optional(),
      series: z.string().min(1).optional(),
      seriesOrder: z.number().int().positive().optional(),
      relatedEssays: z.array(reference('essays')).default([]),
      sources: z.array(technicalSource).default([]),
      // Optional editorial flourish: a coffee-pairing note shown as a card at
      // the foot of the essay. Omitted on most posts; rendered only when present.
      brewingNotes: z.string().optional(),
    })
    .superRefine((essay, ctx) => {
      if (essay.updatedDate && essay.updatedDate < essay.pubDate) {
        ctx.addIssue({
          code: 'custom',
          path: ['updatedDate'],
          message: 'updatedDate cannot be earlier than pubDate',
        });
      }

      if (essay.revisions.length > 0 && !essay.updatedDate) {
        ctx.addIssue({
          code: 'custom',
          path: ['updatedDate'],
          message: 'updatedDate is required when revision notes are present',
        });
      }

      if (
        essay.updatedDate &&
        essay.revisions.some((revision) => revision.date > essay.updatedDate!)
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['revisions'],
          message: 'revision dates cannot be later than updatedDate',
        });
      }

      if ((essay.series === undefined) !== (essay.seriesOrder === undefined)) {
        ctx.addIssue({
          code: 'custom',
          path: essay.series === undefined ? ['series'] : ['seriesOrder'],
          message: 'series and seriesOrder must be provided together',
        });
      }

      if (essay.lang !== 'en' && !essay.translationKey) {
        ctx.addIssue({
          code: 'custom',
          path: ['translationKey'],
          message: 'translated essays must declare a translationKey',
        });
      }

      if (essay.lang !== 'en' && !essay.routeSlug) {
        ctx.addIssue({
          code: 'custom',
          path: ['routeSlug'],
          message:
            'translated essays must declare their locale-independent routeSlug',
        });
      }
    }),
});

export const collections = { essays };
