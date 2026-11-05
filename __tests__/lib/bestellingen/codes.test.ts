// @vitest-environment node
import {
  formatKorteCode, isTokenVorm, korteCodeTekens, nieuweKorteCode, nieuwToken, normaliseerKorteCode,
} from '@lib/bestellingen/codes';

describe('order codes', () => {
  it('makes 128-bit tokens', () => {
    const token = nieuwToken();
    expect(isTokenVorm(token)).toBe(true);
    expect(Buffer.from(token, 'base64url')).toHaveLength(16);
    expect(nieuwToken()).not.toBe(token);
    expect(isTokenVorm('../../etc/passwd')).toBe(false);
  });

  it('makes short codes without look-alikes', () => {
    expect(korteCodeTekens).not.toMatch(/[0O1I]/);
    for (let i = 0; i < 1000; i++) {
      expect(nieuweKorteCode()).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
    }
  });

  it('formats and normalizes what people type', () => {
    expect(formatKorteCode('K7P4QX')).toBe('K7P-4QX');
    expect(normaliseerKorteCode(' k7p-4qx ')).toBe('K7P4QX');
  });
});
