import {formatMededeling, isGeldigeMededeling, mededelingCijfers, mededelingVoor} from '@lib/bestellingen/mededeling';

describe('gestructureerde mededeling', () => {
  it('adds the modulo 97 check to the running number', () => {
    expect(mededelingVoor(14)).toBe('000000001414');
    expect(mededelingVoor(900_000_014)).toBe('090000001464');
    expect(mededelingVoor(97)).toBe('000000009797');
    expect(() => mededelingVoor(0)).toThrow();
  });

  it('formats and checks', () => {
    expect(formatMededeling('000000001414')).toBe('+++000/0000/01414+++');
    expect(isGeldigeMededeling('+++000/0000/01414+++')).toBe(true);
    expect(isGeldigeMededeling('000/0000/01414')).toBe(true);
    expect(isGeldigeMededeling('+++000/0000/01415+++')).toBe(false);
    expect(isGeldigeMededeling('Jan 000000001414')).toBe(false);
    expect(mededelingCijfers('+++000/0000/01414+++')).toBe('000000001414');
    expect(mededelingCijfers('K7P-4QX')).toBeUndefined();
  });
});
