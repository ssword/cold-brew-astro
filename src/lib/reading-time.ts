const WORDS_PER_MINUTE = 220;
const CJK_CHARACTERS_PER_MINUTE = 500;

const CJK_CHARACTER =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu;

export function readingTime(text: string): number {
  const cjkCharacters = text.match(CJK_CHARACTER)?.length ?? 0;
  const words = text
    .replace(CJK_CHARACTER, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  if (words === 0 && cjkCharacters === 0) return 0;

  return Math.ceil(
    words / WORDS_PER_MINUTE +
      cjkCharacters / CJK_CHARACTERS_PER_MINUTE,
  );
}
