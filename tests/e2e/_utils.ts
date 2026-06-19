export type Rgb = [number, number, number];

export function parseRgb(s: string): Rgb {
  const m = s.match(/(\d+(?:\.\d+)?)/g);
  if (!m || m.length < 3) throw new Error(`cannot parse color: ${s}`);
  return [Number(m[0]), Number(m[1]), Number(m[2])];
}

export function relativeLuminance([r, g, b]: Rgb): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}
