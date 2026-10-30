// @vitest-environment node
import {
  assertUniqueSlugs,
  extractTexts,
  findDisallowedEmails,
  htmlToMarkdown,
  slugsFor,
  stripPersonalEmails,
} from '../../../scripts/migrate-content/transform';

const allow = ['voorzitterouderraad@talentenhuis.be', 'contact@apd-gba.be'];

describe('slugsFor', () => {
  it('returns a clean slug and the legacy slug as alias', () => {
    expect(slugsFor('🎉 De Talentenfuif 2025 komt eraan!')).toEqual({
      slug: 'de-talentenfuif-2025-komt-eraan',
      aliassen: ['-de-talentenfuif-2025-komt-eraan'],
    });
  });

  it('has no alias when the legacy slug is identical', () => {
    expect(slugsFor('Moederdag Ontbijtmanden 2025').aliassen).toEqual([]);
  });
});

describe('stripPersonalEmails', () => {
  it('removes a Contact fragment for a non-allowed address', () => {
    expect(stripPersonalEmails('Mededeling: naam\nContact: ouder@voorbeeld.be', allow)).toBe('Mededeling: naam');
  });

  it('removes a hard line break and a mailto link around the address', () => {
    const input = 'Mededeling: naam  \nContact: [ouder@voorbeeld.be](mailto:ouder@voorbeeld.be)\n\nVolgende alinea';
    expect(stripPersonalEmails(input, allow)).toBe('Mededeling: naam\n\nVolgende alinea');
  });

  it('keeps allowed addresses', () => {
    expect(stripPersonalEmails('Mail voorzitterouderraad@talentenhuis.be', allow)).toContain('voorzitterouderraad@');
    expect(stripPersonalEmails('Contact: contact@apd-gba.be', allow)).toBe('Contact: contact@apd-gba.be');
  });
});

describe('findDisallowedEmails', () => {
  it('lists unique addresses outside the allowlist', () => {
    expect(findDisallowedEmails('x a@b.be y contact@apd-gba.be a@b.be', allow)).toEqual(['a@b.be']);
  });
});

describe('assertUniqueSlugs', () => {
  it('throws on duplicate slugs', () => {
    expect(() => assertUniqueSlugs([
      {collectie: 'nieuws', slug: 'a', aliassen: []},
      {collectie: 'nieuws', slug: 'a', aliassen: []},
    ])).toThrow(/a/);
  });

  it('throws when an alias collides with another slug', () => {
    expect(() => assertUniqueSlugs([
      {collectie: 'nieuws', slug: 'a', aliassen: ['b']},
      {collectie: 'nieuws', slug: 'b', aliassen: []},
    ])).toThrow();
  });

  it('allows the same slug in different collections', () => {
    expect(() => assertUniqueSlugs([
      {collectie: 'nieuws', slug: 'a', aliassen: []},
      {collectie: 'activiteiten', slug: 'a', aliassen: []},
    ])).not.toThrow();
  });
});

describe('htmlToMarkdown', () => {
  it('converts html to ATX markdown', () => {
    expect(htmlToMarkdown('<p>Hallo <strong>wereld</strong></p><h3>Kop</h3>')).toBe('Hallo **wereld**\n\n### Kop');
  });

  it('uses dash bullets', () => {
    expect(htmlToMarkdown('<ul><li>een</li><li>twee</li></ul>')).toBe('-   een\n-   twee');
  });
});

describe('extractTexts', () => {
  it('flattens the block tree in document order and strips html from text', () => {
    const blocks = [
      {component: {name: 'Hero', options: {size: 'small'}}, children: [
        {component: {name: 'Text', options: {text: '<h1 style="x">Titel &amp; meer</h1>'}}},
        {children: [{component: {name: 'Typography', options: {text: 'Lead', variant: 'lead'}}}]},
      ]},
      {component: {name: 'NewsList', options: {limit: 3}}},
    ];
    expect(extractTexts(blocks)).toEqual([
      {component: 'Hero', options: {size: 'small'}},
      {component: 'Text', options: {text: '<h1 style="x">Titel &amp; meer</h1>'}, text: 'Titel & meer'},
      {component: 'Typography', options: {text: 'Lead', variant: 'lead'}, text: 'Lead'},
      {component: 'NewsList', options: {limit: 3}},
    ]);
  });
});
