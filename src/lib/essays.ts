import {
  localizedEssayHref,
  languageOf,
  type EssayLanguage,
} from './i18n';

export type Lifecycle = 'draft' | 'steeping' | 'brewed';
export const BREW_TYPES = [
  'cold-brew',
  'espresso',
  'cappuccino',
  'affogato',
] as const;
export type BrewType = (typeof BREW_TYPES)[number];

export interface BrewVesselInfo {
  id: BrewType;
  name: Record<EssayLanguage, string>;
  subtitle: Record<EssayLanguage, string>;
  description: Record<EssayLanguage, string>;
  badgeBorder: string;
  badgeBg: string;
  badgeText: string;
}

export const BREW_VESSELS: Record<BrewType, BrewVesselInfo> = {
  'cold-brew': {
    id: 'cold-brew',
    name: { en: 'Cold Brew', 'zh-CN': '冷萃' },
    subtitle: { en: 'Living Treatise', 'zh-CN': '慢浸长文' },
    description: {
      en: 'Slow-steeped, living essays maintained and revised over time.',
      'zh-CN': '慢速浸泡、持续维护与修订的长期长篇思考。',
    },
    badgeBorder: 'border-sand/30',
    badgeBg: 'bg-sand/10',
    badgeText: 'text-sand',
  },
  espresso: {
    id: 'espresso',
    name: { en: 'Espresso', 'zh-CN': '浓缩' },
    subtitle: { en: 'Concentrated Shot', 'zh-CN': '高压短思' },
    description: {
      en: 'High-pressure, concentrated thoughts and micro-theorems in one breath.',
      'zh-CN': '高压萃取、一气呵成的精炼洞见与微型论断。',
    },
    badgeBorder: 'border-copper/40',
    badgeBg: 'bg-copper/15',
    badgeText: 'text-copper',
  },
  cappuccino: {
    id: 'cappuccino',
    name: { en: 'Cappuccino', 'zh-CN': '卡布奇诺' },
    subtitle: { en: 'Layered Explainer', 'zh-CN': '分层解析' },
    description: {
      en: 'Accessible intuition on top, rigorous mathematical proof below.',
      'zh-CN': '直觉泡沫在上，数学严谨在下，兼顾易读与深度。',
    },
    badgeBorder: 'border-cream/30',
    badgeBg: 'bg-cream/10',
    badgeText: 'text-cream',
  },
  affogato: {
    id: 'affogato',
    name: { en: 'Affogato', 'zh-CN': '阿芙佳朵' },
    subtitle: { en: 'Sweet & Wild', 'zh-CN': '甜苦交融' },
    description: {
      en: 'Where computer science collides with philosophy, craft, and life.',
      'zh-CN': '技术碰撞生活与哲学的跨界探索，醇苦浇灌甜美。',
    },
    badgeBorder: 'border-amber-200/30',
    badgeBg: 'bg-amber-100/10',
    badgeText: 'text-amber-200',
  },
};

interface EssayLike {
  data: {
    status: Lifecycle;
    brew?: BrewType;
    pubDate: Date;
    tags: string[];
    lang?: EssayLanguage;
  };
}

export function selectEssays<T extends EssayLike>(
  entries: readonly T[],
  options: { includeDrafts: boolean },
) {
  const published = entries
    .filter((e) => options.includeDrafts || e.data.status !== 'draft')
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
  const tags = [...new Set(published.flatMap((e) => e.data.tags))].sort();
  return { published, tags };
}

// The feed is public: drafts are never included, regardless of environment.
export function publicEssays<T extends EssayLike>(entries: readonly T[]) {
  return selectEssays(entries, { includeDrafts: false });
}

// Content pages: drafts follow the environment's draft-visibility policy. The
// `import.meta.env.DEV` read lives here and nowhere else (drafts in dev, hidden
// in prod); call sites simply ask for the published essays.
export function publishedEssays<T extends EssayLike>(
  entries: readonly T[],
  includeDrafts = import.meta.env.DEV,
) {
  return selectEssays(entries, { includeDrafts });
}

export function tagSlug(tag: string): string {
  return tag
    .normalize('NFKC')
    .toLowerCase()
    .trim()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

export function essayHref(id: string): string {
  return `/essays/${id}/`;
}

type Rendered = { remarkPluginFrontmatter: Record<string, unknown> };

// The single place an essay's reading time is read off remark frontmatter; the
// `as number` cast lives here and nowhere else.
export function minutesReadOf(rendered: Rendered): number {
  return rendered.remarkPluginFrontmatter.minutesRead as number;
}

export interface DisplayEssay<T> {
  essay: T;
  minutesRead: number;
  href: string;
}

// Maps Astro's `render()` over selected essays to produce display-ready essays.
// `render` is injected so this module stays Astro-free and unit-testable.
export async function toDisplayEssays<
  T extends {
    id: string;
    data: { lang?: EssayLanguage; routeSlug?: string };
  },
>(
  essays: readonly T[],
  render: (essay: T) => Promise<Rendered>,
): Promise<DisplayEssay<T>[]> {
  return Promise.all(
    essays.map(async (essay) => ({
      essay,
      minutesRead: minutesReadOf(await render(essay)),
      href: localizedEssayHref(essay),
    })),
  );
}

export function groupByTag<T extends EssayLike>(published: readonly T[]) {
  const byTag = new Map<string, T[]>();
  for (const essay of published) {
    for (const tag of essay.data.tags) {
      const list = byTag.get(tag) ?? [];
      list.push(essay);
      byTag.set(tag, list);
    }
  }
  return [...byTag.entries()]
    .map(([tag, essays]) => ({ tag, slug: tagSlug(tag), essays }))
    .sort((a, b) => (a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : 0));
}

interface EssayReference {
  id: string;
}

interface TrailEssayLike {
  id: string;
  data: {
    title: string;
    lang?: EssayLanguage;
    series?: string;
    seriesOrder?: number;
    relatedEssays?: readonly EssayReference[];
  };
}

export interface EssayTrail<T> {
  series?: {
    title: string;
    position: number;
    total: number;
  };
  previous?: T;
  next?: T;
  related: T[];
}

/**
 * Resolves the explicit reading path for one essay.
 *
 * Series order supplies previous/next navigation. Manually curated related
 * references preserve their frontmatter order, while entries that are not in
 * the supplied public corpus (for example drafts in production) stay hidden.
 */
export function buildEssayTrail<T extends TrailEssayLike>(
  current: T,
  published: readonly T[],
): EssayTrail<T> {
  const seriesMembers = current.data.series
    ? published
        .filter(
          (essay) =>
            essay.data.series === current.data.series &&
            languageOf(essay.data) === languageOf(current.data),
        )
        .sort((a, b) => (a.data.seriesOrder ?? 0) - (b.data.seriesOrder ?? 0))
    : [];

  if (current.data.series) {
    const orders = seriesMembers.map((essay) => essay.data.seriesOrder);
    if (new Set(orders).size !== orders.length) {
      throw new Error(`Series "${current.data.series}" contains duplicate seriesOrder values`);
    }
  }

  const position = seriesMembers.findIndex((essay) => essay.id === current.id);
  const previous = position > 0 ? seriesMembers[position - 1] : undefined;
  const next =
    position >= 0 && position < seriesMembers.length - 1
      ? seriesMembers[position + 1]
      : undefined;

  const byId = new Map(published.map((essay) => [essay.id, essay]));
  const excluded = new Set([current.id, previous?.id, next?.id]);
  const related: T[] = [];
  const seen = new Set<string>();

  for (const reference of current.data.relatedEssays ?? []) {
    const essay = byId.get(reference.id);
    if (!essay || excluded.has(essay.id) || seen.has(essay.id)) continue;
    related.push(essay);
    seen.add(essay.id);
  }

  return {
    series:
      current.data.series && position >= 0
        ? {
            title: current.data.series,
            position: position + 1,
            total: seriesMembers.length,
          }
        : undefined,
    previous,
    next,
    related,
  };
}
