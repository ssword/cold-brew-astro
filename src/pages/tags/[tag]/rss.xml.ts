import rss from '@astrojs/rss';
import type { APIContext, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { groupByTag, publicEssays } from '../../../lib/essays';
import { essaysInLanguage } from '../../../lib/i18n';
import { RSS_XMLNS, toRssItems } from '../../../lib/feeds';
import { SITE_TITLE } from '../../../consts';

export const getStaticPaths = (async () => {
  const { published: allPublished } = publicEssays(await getCollection('essays'));
  const published = essaysInLanguage(allPublished, 'en');
  return groupByTag(published).map((group) => ({
    params: { tag: group.slug },
  }));
}) satisfies GetStaticPaths;

export async function GET(context: APIContext) {
  const site = context.site!;
  const { published: allPublished } = publicEssays(await getCollection('essays'));
  const published = essaysInLanguage(allPublished, 'en');
  const group = groupByTag(published).find(
    ({ slug }) => slug === context.params.tag,
  );

  if (!group) {
    return new Response('Tag not found', { status: 404 });
  }

  const feedUrl = new URL(`/tags/${group.slug}/rss.xml`, site);
  const tagPageUrl = new URL(`/tags/${group.slug}/`, site);

  return rss({
    title: `${group.tag} — ${SITE_TITLE}`,
    description: `Essays about ${group.tag} from ${SITE_TITLE}.`,
    site: tagPageUrl,
    xmlns: RSS_XMLNS,
    customData: `<atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />`,
    items: toRssItems(group.essays, site),
  });
}
