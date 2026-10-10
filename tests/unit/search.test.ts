import { describe, expect, it } from 'vitest';
import { htmlToSearchText } from '../../src/lib/search';

describe('htmlToSearchText', () => {
  it('keeps inline-marked words whole and separates blocks', () => {
    expect(htmlToSearchText('<p>over<em>fit</em> models</p><p>generalize</p>')).toBe(
      'overfit models generalize',
    );
  });

  it('decodes entities so escaped text matches what a reader sees', () => {
    expect(htmlToSearchText('<p>p &lt; 0.05 &amp; &#x201C;significance&#8221;</p>')).toBe(
      'p < 0.05 & “significance”',
    );
  });
});
