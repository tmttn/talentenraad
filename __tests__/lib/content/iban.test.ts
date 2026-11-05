import {formatIban, isGeldigeIban, isVoorbeeldRekening, voorbeeldIban} from '@lib/content/iban';

describe('IBAN', () => {
  it('accepts the example number and rejects a typo', () => {
    expect(isGeldigeIban('BE68 5390 0754 7034')).toBe(true);
    expect(isGeldigeIban('be68539007547034')).toBe(true);
    expect(isGeldigeIban('BE68 5390 0754 7035')).toBe(false);
    expect(isGeldigeIban('BE68 5390 0754 703')).toBe(false);
    expect(isGeldigeIban('NL91 ABNA 0417 1643 00')).toBe(true);
    expect(isGeldigeIban('')).toBe(false);
  });

  it('formats in groups of four and recognizes the example number', () => {
    expect(formatIban('be68539007547034')).toBe('BE68 5390 0754 7034');
    expect(isVoorbeeldRekening('BE68 5390 0754 7034')).toBe(true);
    expect(isVoorbeeldRekening(voorbeeldIban)).toBe(true);
    expect(isVoorbeeldRekening('NL91 ABNA 0417 1643 00')).toBe(false);
  });
});
