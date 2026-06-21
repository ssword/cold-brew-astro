import type { ThemeRegistrationRaw } from 'shiki';

// Custom Shiki theme keyed to the cold-brew palette (issue #4, scheme A):
// panel background, cream text, copper keywords, amber strings, soft-amber
// numbers, muted-italic comments. The amber token hues are syntax-internal and
// intentionally not part of the global @theme palette.
export const coldBrew: ThemeRegistrationRaw = {
  name: 'cold-brew',
  type: 'dark',
  colors: {
    'editor.background': '#1B1311',
    'editor.foreground': '#E8DED4',
  },
  settings: [
    { settings: { background: '#1B1311', foreground: '#E8DED4' } },
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: '#9E8774', fontStyle: 'italic' },
    },
    {
      scope: ['keyword', 'keyword.control', 'storage', 'storage.type', 'storage.modifier'],
      settings: { foreground: '#D9914A' },
    },
    {
      scope: ['string', 'string.quoted', 'string.template', 'constant.other.symbol'],
      settings: { foreground: '#E6B873' },
    },
    {
      scope: ['constant.numeric', 'constant.language', 'constant.language.boolean'],
      settings: { foreground: '#CDA86A' },
    },
    {
      scope: ['entity.name.function', 'support.function', 'meta.function-call'],
      settings: { foreground: '#E8DED4' },
    },
    {
      scope: ['variable', 'meta.definition.variable', 'variable.other'],
      settings: { foreground: '#E8DED4' },
    },
    {
      scope: ['entity.name.type', 'support.type', 'support.class', 'entity.name.class'],
      settings: { foreground: '#E8DED4' },
    },
    {
      scope: ['keyword.operator', 'punctuation'],
      settings: { foreground: '#9E8774' },
    },
  ],
};
