import rss from '@astrojs/rss';
import type { APIContext, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { publicEssays } from '../../lib/essays';
import { essaysInLanguage } from '../../lib/i18n';
import { RSS_XMLNS, toRssItems } from '../../lib/feeds';
import { SITE_TITLE } from '../../consts';

export const getStaticPaths = (() => [
  { params: { lang: 'zh' } },
]) satisfies GetStaticPaths;

export async function GET(context: APIContext) {
  const { published: allPublished } = publicEssays(
    await getCollection('essays'),
  );
  const published = essaysInLanguage(allPublished, 'zh-CN');
  const site = context.site!;
  const feedUrl = new URL('/zh/rss.xml', site);

  return rss({
    title: `${SITE_TITLE} 中文`,
    description: '慢慢思考深度学习、语言模型与统计学。',
    site: new URL('/zh/', site),
    xmlns: RSS_XMLNS,
    customData: `<atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />`,
    items: toRssItems(published, site),
  });
}
