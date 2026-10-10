import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { publicEssays } from '../../lib/essays';
import { LANGUAGE_INFO, languageFromRoute } from '../../lib/i18n';
import { buildSearchIndex, SEARCH_LANGUAGES } from '../../lib/search';

// One static index per searchable edition, built from the public selection:
// drafts are never indexed, in any environment.
export function getStaticPaths() {
  return SEARCH_LANGUAGES.map((language) => ({
    params: { lang: LANGUAGE_INFO[language].route },
  }));
}

export async function GET({ params }: APIContext) {
  const language = languageFromRoute(params.lang!)!;
  const { published } = publicEssays(await getCollection('essays'));
  return new Response(JSON.stringify(buildSearchIndex(published, language)), {
    headers: { 'Content-Type': 'application/json' },
  });
}
