import { toString } from 'mdast-util-to-string';
import type { Root } from 'mdast';
import { readingTime } from './reading-time';

// A build-time remark plugin that exposes each essay's reading time via remark
// frontmatter (`minutesRead`), so it is available wherever a post is rendered.
// The estimate itself lives in the pure `readingTime` seam (unit-tested).
interface FrontmatterVFile {
  data: { astro: { frontmatter: Record<string, unknown> } };
}

export function remarkReadingTime() {
  return (tree: Root, file: FrontmatterVFile): void => {
    file.data.astro.frontmatter.minutesRead = readingTime(toString(tree));
  };
}
