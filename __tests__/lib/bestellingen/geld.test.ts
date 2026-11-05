import {euroInvoer, formatEuro, parseEuro} from '@lib/bestellingen/geld';

describe('formatEuro', () => {
  it('writes cents as euros in nl-BE', () => {
    expect(formatEuro(1250)).toBe('€ 12,50');
    expect(formatEuro(0)).toBe('€ 0,00');
    expect(formatEuro(5)).toBe('€ 0,05');
    expect(formatEuro(123_456)).toBe('€ 1.234,56');
    expect(formatEuro(-200)).toBe('-€ 2,00');
  });

  it('gives an input value without the sign', () => {
    expect(euroInvoer(1250)).toBe('12,50');
    expect(euroInvoer(123_456)).toBe('1234,56');
  });
});

describe('parseEuro', () => {
  it('reads what people type', () => {
    expect(parseEuro('12')).toBe(1200);
    expect(parseEuro('12,5')).toBe(1250);
    expect(parseEuro('12,50')).toBe(1250);
    expect(parseEuro('12.50')).toBe(1250);
    expect(parseEuro('€ 12,50')).toBe(1250);
    expect(parseEuro(' 0 ')).toBe(0);
  });

  it('refuses the rest', () => {
    expect(parseEuro('')).toBeUndefined();
    expect(parseEuro('-1')).toBeUndefined();
    expect(parseEuro('12,505')).toBeUndefined();
    expect(parseEuro('abc')).toBeUndefined();
    expect(parseEuro('1.234,56')).toBeUndefined();
  });
});
