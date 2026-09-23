import type { RSSFeedItem } from '@astrojs/rss';
import { localizedEssayHref } from './i18n';
import type { EssayLanguage } from './i18n';

interface FeedEssay {
  id: string;
  data: {
    title: string;
    excerpt: string;
    pubDate: Date;
    updatedDate?: Date;
    tags: string[];
    lang?: EssayLanguage;
    routeSlug?: string;
  };
  rendered?: {
    html: string;
  };
}

export const RSS_XMLNS = {
  atom: 'http://www.w3.org/2005/Atom',
} as const;

function renderedHtmlOf(essay: FeedEssay): string {
  if (!essay.rendered?.html) {
    throw new Error(`Essay "${essay.id}" has no rendered HTML for its RSS item`);
  }
  return essay.rendered.html;
}

/**
 * Feed readers render outside the site's URL context, so root-relative and
 * fragment-only links must be resolved against the essay's canonical URL.
 */
export function absolutizeFeedHtml(html: string, essayUrl: URL): string {
  return html.replace(/\b(href|src)="([^"]+)"/g, (match, attribute, value) => {
    try {
      return `${attribute}="${new URL(value, essayUrl).href}"`;
    } catch {
      return match;
    }
  });
}

export function toRssItems(
  essays: readonly FeedEssay[],
  site: URL,
): RSSFeedItem[] {
  return essays.map((essay) => {
    const url = new URL(localizedEssayHref(essay), site);
    return {
      title: essay.data.title,
      pubDate: essay.data.pubDate,
      description: essay.data.excerpt,
      link: url.href,
      categories: essay.data.tags,
      content: absolutizeFeedHtml(renderedHtmlOf(essay), url),
      customData: essay.data.updatedDate
        ? `<atom:updated>${essay.data.updatedDate.toISOString()}</atom:updated>`
        : undefined,
    };
  });
}
