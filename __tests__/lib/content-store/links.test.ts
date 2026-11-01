import {describe, expect, it} from 'vitest';
import {linkMelding, linkWaarde} from '@lib/content/schemas';

describe('linkWaarde', () => {
  it.each(['/kalender', '/', 'https://talentenhuis.be/x?y=1#z', 'https://example.com/x', 'mailto:iemand@example.com'])('accepts %s', value => {
    expect(linkWaarde.safeParse(value).success).toBe(true);
  });

  it.each(['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,x', 'http://example.com', '//evil.example', 'kalender', ' javascript:x', '/a b', '/\\evil.example', '/\u0001x', 'https://', 'mailto:', 'JAVASCRIPT:x', 'https:// x'])('rejects %s', value => {
    const result = linkWaarde.safeParse(value);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(linkMelding);
    }
  });
});
