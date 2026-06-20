import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { publicEssays, essayHref } from '../lib/essays';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context: APIContext) {
  const { published } = publicEssays(await getCollection('essays'));

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site!,
    items: published.map((essay) => ({
      title: essay.data.title,
      pubDate: essay.data.pubDate,
      description: essay.data.excerpt,
      link: essayHref(essay.id),
    })),
  });
}
