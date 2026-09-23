import {
  essaySlug,
  LANGUAGE_INFO,
  languageOf,
  type EssayLanguage,
} from './i18n';

interface SocialCardEntry {
  id: string;
  data: {
    lang?: EssayLanguage;
    routeSlug?: string;
  };
}

export interface SocialCardData {
  title: string;
  excerpt: string;
  pubDate: Date;
  tags: readonly string[];
  language: EssayLanguage;
}

export function socialCardHref(essay: SocialCardEntry): string {
  const language = languageOf(essay.data);
  return `/og/${LANGUAGE_INFO[language].route}/${essaySlug(essay)}.png`;
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function wrapLatinTitle(title: string, maxLength = 25): string[] {
  const lines: string[] = [];
  let line = '';

  for (const word of title.trim().split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && next.length > maxLength) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function wrapCjkTitle(title: string, maxLength = 11): string[] {
  const characters = [...title.trim()];
  return Array.from(
    { length: Math.ceil(characters.length / maxLength) },
    (_, index) =>
      characters.slice(index * maxLength, (index + 1) * maxLength).join(''),
  ).slice(0, 3);
}

export function renderSocialCardSvg(data: SocialCardData): string {
  const chinese = data.language === 'zh-CN';
  const lines = chinese
    ? wrapCjkTitle(data.title)
    : wrapLatinTitle(data.title);
  const titleSize = lines.length > 2 ? 64 : chinese ? 74 : 78;
  const titleStart = lines.length > 2 ? 238 : 265;
  const lineHeight = Math.round(titleSize * 1.08);
  const date = new Intl.DateTimeFormat(
    LANGUAGE_INFO[data.language].dateLocale,
    { year: 'numeric', month: 'long', day: 'numeric' },
  ).format(data.pubDate);
  const tags = data.tags.slice(0, 3).join('  ·  ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="82%" cy="16%" r="75%">
      <stop offset="0%" stop-color="#4a352e" stop-opacity="0.78"/>
      <stop offset="100%" stop-color="#0f0a09" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#d4bda6"/>
      <stop offset="100%" stop-color="#d4bda6" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#0f0a09"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <circle cx="1060" cy="92" r="210" fill="none" stroke="#d4bda6" stroke-opacity="0.10" stroke-width="2"/>
  <circle cx="1060" cy="92" r="174" fill="none" stroke="#d4bda6" stroke-opacity="0.06" stroke-width="1"/>
  <path d="M1015 240 C970 192 1038 146 997 96 C962 54 1022 25 998 -12" fill="none" stroke="#eed9c4" stroke-opacity="0.10" stroke-width="3" stroke-linecap="round"/>

  <g transform="translate(86 66)">
    <path d="M15 5C5 12 2 28 10 40c8 12 24 15 34 8 10-7 13-23 5-35C41 1 25-2 15 5Z" fill="none" stroke="#d4bda6" stroke-width="2"/>
    <path d="M42 5C32 15 24 27 12 43" fill="none" stroke="#d4bda6" stroke-width="2" stroke-linecap="round"/>
    <text x="66" y="38" fill="#eed9c4" font-family="Fraunces Variable, Georgia, serif" font-size="38" font-weight="300">cold brew</text>
  </g>
  <text x="88" y="164" fill="#9e8774" font-family="JetBrains Mono Variable, monospace" font-size="18" letter-spacing="4">${chinese ? '让它慢慢浸泡' : 'LET IT STEEP'}</text>
  <rect x="88" y="194" width="450" height="2" fill="url(#rule)"/>

  ${lines
    .map(
      (line, index) =>
        `<text x="86" y="${titleStart + index * lineHeight}" fill="#eed9c4" font-family="${chinese ? 'Noto Serif SC Variable, Noto Serif SC, Songti SC, serif' : 'Fraunces Variable, Georgia, serif'}" font-size="${titleSize}" font-weight="350" letter-spacing="${chinese ? '1' : '-1.5'}">${escapeXml(line)}</text>`,
    )
    .join('\n  ')}

  <text x="88" y="552" fill="#d4bda6" font-family="${chinese ? 'Noto Sans SC Variable, Noto Sans SC, PingFang SC, sans-serif' : 'Inter Variable, Arial, sans-serif'}" font-size="20">${escapeXml(tags)}</text>
  <text x="1112" y="552" text-anchor="end" fill="#9e8774" font-family="JetBrains Mono Variable, monospace" font-size="17" letter-spacing="1">${escapeXml(date)}</text>
  <rect x="88" y="584" width="1024" height="1" fill="#d4bda6" fill-opacity="0.20"/>
</svg>`;
}
