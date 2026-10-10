import { SITE_TAGLINE } from '../consts';
import type { SourceKind } from './essays';
import type { EssayLanguage } from './i18n';

// Every piece of interface copy that differs by language. Both tables must
// satisfy this shape, so a missing translation is a type error rather than a
// silently English label on a Chinese page.
export interface UiStrings {
  tagline: string;
  primaryNav: string;
  replyByEmail: string;
  footerMotto: string;

  minutesRead: (minutes: number) => string;
  revisedOn: (date: string) => string;
  steeping: string;

  otherEditions: string;
  readIn: string;
  pairingTitle: string;
  replyPrompt: string;
  replyLink: string;
  focus: string;
  exitFocus: string;
  shareEssay: string;

  revisionNotes: string;

  continueReading: string;
  seriesPosition: (position: number, total: number) => string;
  seriesNavigation: string;
  previous: string;
  next: string;
  relatedEssays: string;

  sourceShelf: string;
  sourceShelfTitle: string;
  sourceKinds: Record<SourceKind, string>;

  tastingMenu: string;
  tastingMenuHeading: string;
  allBrews: string;
  filterByBrew: string;
  resetFilter: string;

  search: string;
  searchLabel: string;
  searchResults: string;
  searchEmpty: string;
  searchNoResults: (query: string) => string;
  searchResultCount: (count: number) => string;
  browseByTag: string;
}

const en: UiStrings = {
  tagline: SITE_TAGLINE,
  primaryNav: 'Primary',
  replyByEmail: 'Reply by email',
  footerMotto: 'Read deliberately. Sip slowly. Act considerately.',

  minutesRead: (minutes) => `${minutes} min read`,
  revisedOn: (date) => `Revised ${date}`,
  steeping: 'steeping',

  otherEditions: 'Other language editions',
  readIn: 'Read in',
  pairingTitle: 'Suggested brewing pairing',
  replyPrompt: 'Found a mistake, or want to push back?',
  replyLink: 'Reply by email.',
  focus: 'Focus',
  exitFocus: 'Exit focus',
  shareEssay: 'Share this essay',

  revisionNotes: 'Revision notes',

  continueReading: 'Continue reading',
  seriesPosition: (position, total) => `Part ${position} of ${total}`,
  seriesNavigation: 'Series navigation',
  previous: 'Previous',
  next: 'Next',
  relatedEssays: 'Related essays',

  sourceShelf: 'Source shelf',
  sourceShelfTitle: 'Reproduce or read further',
  sourceKinds: {
    paper: 'Paper',
    code: 'Code',
    notebook: 'Notebook',
    dataset: 'Dataset',
    documentation: 'Documentation',
    article: 'Article',
  },

  tastingMenu: 'Tasting menu',
  tastingMenuHeading: 'The Tasting Menu · Four Extractions',
  allBrews: 'All brews',
  filterByBrew: 'Filter essays by brew',
  resetFilter: 'Reset to show all',

  search: 'Search',
  searchLabel: 'Search essays',
  searchResults: 'Search results',
  searchEmpty:
    'Type a word or phrase from an essay: its title, excerpt, tags, or text. Your query stays in this browser.',
  searchNoResults: (query) =>
    `Nothing matches “${query}”. Try a shorter word, or browse by tag.`,
  searchResultCount: (count) =>
    count === 1 ? '1 essay found' : `${count} essays found`,
  browseByTag: 'Browse by tag',
};

const zhCN: UiStrings = {
  tagline: '让它慢慢浸泡 · 咖啡漫谈',
  primaryNav: '主导航',
  replyByEmail: '邮件回复',
  footerMotto: '认真阅读，慢慢啜饮，体贴行动。',

  minutesRead: (minutes) => `约 ${minutes} 分钟`,
  revisedOn: (date) => `修订于 ${date}`,
  steeping: '浸泡中',

  otherEditions: '其他语言版本',
  readIn: '阅读语言',
  pairingTitle: '建议搭配的咖啡',
  replyPrompt: '发现错误，或有不同意见？',
  replyLink: '欢迎邮件回复。',
  focus: '专注',
  exitFocus: '退出专注',
  shareEssay: '分享这篇文章',

  revisionNotes: '修订记录',

  continueReading: '继续阅读',
  seriesPosition: (position, total) => `第 ${position} 篇，共 ${total} 篇`,
  seriesNavigation: '系列文章导航',
  previous: '上一篇',
  next: '下一篇',
  relatedEssays: '相关文章',

  sourceShelf: '资料架',
  sourceShelfTitle: '复现与延伸阅读',
  sourceKinds: {
    paper: '论文',
    code: '代码',
    notebook: '笔记本',
    dataset: '数据集',
    documentation: '文档',
    article: '文章',
  },

  tastingMenu: '风味菜单',
  tastingMenuHeading: '萃取菜单 · 四种思考形态',
  allBrews: '全部文章',
  filterByBrew: '按萃取方式筛选',
  resetFilter: '重置并查看全部',

  search: '搜索',
  searchLabel: '搜索文章',
  searchResults: '搜索结果',
  searchEmpty: '输入文章中的词语或短语：标题、摘要、标签或正文均可。搜索只在本浏览器中进行。',
  searchNoResults: (query) => `没有与“${query}”匹配的文章。试试更短的词，或按标签浏览。`,
  searchResultCount: (count) => `找到 ${count} 篇文章`,
  browseByTag: '按标签浏览',
};

const UI_STRINGS: Record<EssayLanguage, UiStrings> = { en, 'zh-CN': zhCN };

export function uiStrings(language: EssayLanguage): UiStrings {
  return UI_STRINGS[language];
}
