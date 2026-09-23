import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { publicEssays } from '../lib/essays';
import { essaysInLanguage } from '../lib/i18n';
import { RSS_XMLNS, toRssItems } from '../lib/feeds';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context: APIContext) {
  const { published: allPublished } = publicEssays(await getCollection('essays'));
  const published = essaysInLanguage(allPublished, 'en');
  const site = context.site!;

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site,
    xmlns: RSS_XMLNS,
    customData: `<atom:link href="${new URL('/rss.xml', site)}" rel="self" type="application/rss+xml" />`,
    items: toRssItems(published, site),
  });
}
