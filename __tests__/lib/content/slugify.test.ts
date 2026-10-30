import {legacySlug, slugify} from '@lib/content/slugify';

describe('slugify', () => {
  it('keeps the legacy leading dash', () => {
    expect(legacySlug('🎉 De Talentenfuif 2025 komt eraan!')).toBe('-de-talentenfuif-2025-komt-eraan');
  });

  it('strips emoji and edge dashes', () => {
    expect(slugify('🎉 De Talentenfuif 2025 komt eraan!')).toBe('de-talentenfuif-2025-komt-eraan');
    expect(slugify('Kerstspel en Kerstinstuif 2025')).toBe('kerstspel-en-kerstinstuif-2025');
    expect(slugify('Moederdag Ontbijtmanden 2025')).toBe('moederdag-ontbijtmanden-2025');
  });

  it('removes diacritics', () => {
    expect(slugify('Café één')).toBe('cafe-een');
  });
});
