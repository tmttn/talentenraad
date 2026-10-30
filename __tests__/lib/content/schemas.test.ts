import {
  activiteitSchema,
  datumSchema,
  faqSchema,
  nieuwsSchema,
  paginaSchemas,
  siteSchema,
  tekstSchema,
  teamlidSchema,
} from '@lib/content/schemas';

const basis = {titel: 'T', beschrijving: 'B', hero: {titel: 'H', ondertitel: 'O'}};
const cta = {titel: 'C', tekst: 'T', knoppen: [{tekst: 'A', link: '/a'}]};

describe('datumSchema', () => {
  it('normalizes dates and strings', () => {
    expect(datumSchema.parse('2025-02-07')).toBe('2025-02-07');
    expect(() => datumSchema.parse('7 februari')).toThrow();
    expect(() => datumSchema.parse('2025-02-30')).toThrow(/Ongeldige datum/);
    expect(() => datumSchema.parse('2025-13-01')).toThrow();
    expect(datumSchema.parse('2024-02-29')).toBe('2024-02-29');
    expect(() => datumSchema.parse(new Date('2025-02-07T00:00:00Z'))).toThrow();
  });
});

describe('collection schemas', () => {
  it('applies activiteit defaults and rejects bad categorie', () => {
    expect(activiteitSchema.parse({titel: 'X', datum: '2025-01-01', categorie: 'feest', samenvatting: 'Y'}))
      .toMatchObject({concept: false, aliassen: []});
    expect(() => activiteitSchema.parse({titel: 'X', datum: '2025-01-01', categorie: 'bbq', samenvatting: 'Y'})).toThrow();
  });

  it('parses nieuws, faq, tekst', () => {
    expect(nieuwsSchema.parse({titel: 'X', datum: '2025-01-01', samenvatting: 'Y'}))
      .toMatchObject({datum: '2025-01-01', aliassen: [], concept: false});
    expect(faqSchema.parse({vraag: 'Q'}).volgorde).toBe(99);
    expect(tekstSchema.parse({titel: 'T', beschrijving: 'B'}).concept).toBe(false);
  });

  it('validates teamlid', () => {
    expect(() => teamlidSchema.parse({naam: 'A', rol: 'Lid', categorie: 'helper'})).toThrow();
    expect(teamlidSchema.parse({naam: 'A', rol: 'Lid', categorie: 'lid'}).volgorde).toBe(99);
  });
});

describe('paginaSchemas', () => {
  const home = {...basis, cta, dashboardTitel: 'D', infokaart: {titel: 'I'}, faqTitel: 'F'};

  it('accepts a valid home page', () => {
    expect(paginaSchemas.home.parse(home).concept).toBe(false);
  });

  it('rejects cta without or with too many knoppen', () => {
    expect(() => paginaSchemas.home.parse({...home, cta: {...cta, knoppen: []}})).toThrow();
    const drie = [1, 2, 3].map(n => ({tekst: String(n), link: '/'}));
    expect(() => paginaSchemas.home.parse({...home, cta: {...cta, knoppen: drie}})).toThrow();
  });

  it('allows a missing cta', () => {
    const {cta: _cta, ...zonder} = home;
    expect(paginaSchemas.home.parse(zonder).cta).toBeUndefined();
  });

  it('parses the other pages', () => {
    expect(paginaSchemas.nieuws.parse(basis).titel).toBe('T');
    expect(paginaSchemas.kalender.parse({
      ...basis,
      lijst: {titel: 'a', ondertitel: 'b'},
      archief: {titel: 'c', ondertitel: 'd'},
    }).lijst.titel).toBe('a');
    expect(paginaSchemas.contact.parse({
      ...basis,
      formulier: {titel: 'a', tekst: 'b'},
      infokaart: {titel: 'c'},
    }).formulier.tekst).toBe('b');
    expect(paginaSchemas['over-ons'].parse({
      ...basis,
      infokaart: {titel: 'i'},
      bestuur: {titel: 'a', tekst: 'b'},
      leden: {titel: 'c', tekst: 'd'},
    }).leden.titel).toBe('c');
  });

  it('validates sponsors', () => {
    const legeTekst = {goud: 'a', zilver: 'b', brons: 'c', partner: 'd'};
    expect(paginaSchemas.sponsors.parse({...basis, sponsors: [{naam: 'N', niveau: 'goud', logo: './l.png'}], legeTekst}).sponsors).toHaveLength(1);
    expect(() => paginaSchemas.sponsors.parse({...basis, sponsors: [{naam: 'N', niveau: 'platina'}], legeTekst})).toThrow();
  });
});

describe('siteSchema', () => {
  it('exposes aankondiging types', () => {
    expect(siteSchema.shape.aankondiging.shape.type.options).toEqual(['info', 'waarschuwing', 'belangrijk']);
  });
});
