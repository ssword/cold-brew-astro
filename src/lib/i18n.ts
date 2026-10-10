export const ESSAY_LANGUAGES = ['en', 'zh-CN'] as const;

export type EssayLanguage = (typeof ESSAY_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: EssayLanguage = 'en';

export const LANGUAGE_INFO = {
  en: {
    route: 'en',
    label: 'English',
    dateLocale: 'en-US',
    openGraphLocale: 'en_US',
  },
  'zh-CN': {
    route: 'zh',
    label: '中文',
    dateLocale: 'zh-CN',
    openGraphLocale: 'zh_CN',
  },
} as const satisfies Record<
  EssayLanguage,
  {
    route: string;
    label: string;
    dateLocale: string;
    openGraphLocale: string;
  }
>;

export const SUPPORTED_LOCALE_ROUTES = ['zh'] as const;

export function languageOf(data: { lang?: EssayLanguage }): EssayLanguage {
  return data.lang ?? DEFAULT_LANGUAGE;
}

export function languageFromRoute(route: string): EssayLanguage | undefined {
  return ESSAY_LANGUAGES.find(
    (language) => LANGUAGE_INFO[language].route === route,
  );
}

// Default-language routes are unprefixed; every other edition lives under
// its route segment. All locale paths below are built from this one prefix.
function localePrefix(language: EssayLanguage): string {
  return language === DEFAULT_LANGUAGE ? '' : `/${LANGUAGE_INFO[language].route}`;
}

export function localeHome(language: EssayLanguage): string {
  return `${localePrefix(language)}/`;
}

export function localeFeed(language: EssayLanguage): string {
  return `${localePrefix(language)}/rss.xml`;
}

export function localeTagsIndex(language: EssayLanguage): string {
  return `${localePrefix(language)}/tags/`;
}

export function localeSearch(language: EssayLanguage): string {
  return `${localePrefix(language)}/search/`;
}

// Frontmatter dates are calendar days parsed as UTC midnight, so they are
// formatted in UTC; the build machine's local zone would shift them a day.
export function formatEssayDate(
  date: Date,
  language: EssayLanguage,
): string {
  return new Intl.DateTimeFormat(LANGUAGE_INFO[language].dateLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

interface LocalizedEntry {
  id: string;
  data: {
    lang?: EssayLanguage;
    routeSlug?: string;
  };
}

export function essaySlug(essay: LocalizedEntry): string {
  return essay.data.routeSlug ?? essay.id;
}

export function localizedEssayHref(essay: LocalizedEntry): string {
  return `${localePrefix(languageOf(essay.data))}/essays/${essaySlug(essay)}/`;
}

export function localizedTagHref(
  slug: string,
  language: EssayLanguage,
): string {
  return `${localeTagsIndex(language)}${slug}/`;
}

export function essaysInLanguage<
  T extends { data: { lang?: EssayLanguage } },
>(essays: readonly T[], language: EssayLanguage): T[] {
  return essays.filter((essay) => languageOf(essay.data) === language);
}

export interface LanguageAlternate {
  language: EssayLanguage;
  href: string;
  label: string;
}

interface TranslatedEntry extends LocalizedEntry {
  data: LocalizedEntry['data'] & {
    translationKey?: string;
  };
}

export function languageAlternates(
  current: TranslatedEntry,
  essays: readonly TranslatedEntry[],
): LanguageAlternate[] {
  if (!current.data.translationKey) return [];

  return essays
    .filter(
      (essay) =>
        essay.data.translationKey === current.data.translationKey &&
        essay.id !== current.id,
    )
    .map((essay) => {
      const language = languageOf(essay.data);
      return {
        language,
        href: localizedEssayHref(essay),
        label: LANGUAGE_INFO[language].label,
      };
    })
    .sort((a, b) => a.language.localeCompare(b.language));
}
