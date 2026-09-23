import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import sharp from 'sharp';
import { publishedEssays } from '../../../lib/essays';
import {
  essaySlug,
  LANGUAGE_INFO,
  languageOf,
} from '../../../lib/i18n';
import {
  renderSocialCardSvg,
  type SocialCardData,
} from '../../../lib/social-card';

export const getStaticPaths = (async () => {
  const { published } = publishedEssays(await getCollection('essays'));

  return published.map((essay) => {
    const language = languageOf(essay.data);
    return {
      params: {
        lang: LANGUAGE_INFO[language].route,
        slug: essaySlug(essay),
      },
      props: {
        card: {
          title: essay.data.title,
          excerpt: essay.data.excerpt,
          pubDate: essay.data.pubDate,
          tags: essay.data.tags,
          language,
        } satisfies SocialCardData,
      },
    };
  });
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const svg = renderSocialCardSvg(props.card as SocialCardData);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
