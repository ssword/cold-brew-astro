import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readingTime } from '../../src/lib/reading-time';

// Acceptance gate for the seed corpus (issue #10). It reads the real essays so
// it tracks the published set, not synthetic fixtures: the 12 essays must exist,
// split ~3 steeping / ~9 brewed, vary in length, and collectively exercise every
// reading feature. Rendering correctness itself is covered by essay-reading.spec.

const DIR = join(dirname(fileURLToPath(import.meta.url)), '../../src/content/essays');

interface Essay {
  id: string;
  status: string;
  body: string;
}

function parse(file: string): Essay {
  const raw = readFileSync(join(DIR, file), 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`missing frontmatter: ${file}`);
  const [, frontmatter, body] = m;
  const status = frontmatter.match(/^status:\s*(\S+)/m)?.[1]?.trim() ?? '';
  return { id: file.replace(/\.md$/, ''), status, body };
}

const all = readdirSync(DIR)
  .filter((f) => f.endsWith('.md'))
  .map(parse);
const published = all.filter((e) => e.status === 'steeping' || e.status === 'brewed');

const stripDisplayMath = (b: string) => b.replace(/\$\$[\s\S]*?\$\$/g, '');
const hasCode = (b: string) => /```/.test(b);
const hasInlineMath = (b: string) => /(^|[^$])\$[^$\n]+\$([^$]|$)/.test(stripDisplayMath(b));
const hasDisplayMath = (b: string) => /\$\$[\s\S]*?\$\$/.test(b);
const hasFootnotes = (b: string) => /\[\^[^\]]+\]/.test(b) && /^\[\^[^\]]+\]:/m.test(b);
const hasPullQuote = (b: string) => /^>\s+/m.test(b);
const count = (pred: (b: string) => boolean) => published.filter((e) => pred(e.body)).length;

describe('seed corpus (issue #10)', () => {
  it('publishes at least 12 essays, roughly 3 steeping and 9 brewed', () => {
    const steeping = published.filter((e) => e.status === 'steeping').length;
    const brewed = published.filter((e) => e.status === 'brewed').length;
    expect(published.length).toBeGreaterThanOrEqual(12);
    expect(steeping).toBeGreaterThanOrEqual(3);
    expect(brewed).toBeGreaterThanOrEqual(9);
  });

  it('varies reading times meaningfully across the set', () => {
    const minutes = published.map((e) => readingTime(e.body));
    const spread = Math.max(...minutes) - Math.min(...minutes);
    expect(spread).toBeGreaterThanOrEqual(4);
  });

  it('collectively exercises every reading feature, spread across essays', () => {
    expect(count(hasCode)).toBeGreaterThanOrEqual(3);
    expect(count(hasInlineMath)).toBeGreaterThanOrEqual(3);
    expect(count(hasDisplayMath)).toBeGreaterThanOrEqual(2);
    expect(count(hasFootnotes)).toBeGreaterThanOrEqual(2);
    expect(count(hasPullQuote)).toBeGreaterThanOrEqual(3);
  });
});
