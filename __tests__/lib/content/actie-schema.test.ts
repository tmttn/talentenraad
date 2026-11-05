import {actieSchema, siteSchema} from '@lib/content/schemas';

const geldig = {
  titel: 'Pizzaverkoop',
  samenvatting: 'Bestel je pizza.',
  bestellen: {van: '2027-01-04', tot: '2027-01-17'},
  betalen: {wijzen: ['overschrijving']},
  afhalen: [{id: 'vrijdag', datum: '2027-01-22', uur: '17:00 - 19:00', plaats: 'Refter'}],
  producten: [{id: 'margherita', naam: 'Margherita', prijs: 1000}],
};

const fout = (input: unknown) => {
  const result = actieSchema.safeParse(input);
  return result.success ? undefined : result.error.issues.map(issue => issue.message).join(' | ');
};

describe('actieSchema', () => {
  it('fills the defaults', () => {
    const actie = actieSchema.parse(geldig);
    expect(actie.betalen.binnenDagen).toBe(5);
    expect(actie.vraag).toEqual({kind: false});
    expect(actie.producten[0]).toMatchObject({maxPerBestelling: 10, opties: []});
    expect(actie).toMatchObject({concept: false, aliassen: []});
  });

  it('refuses a period that ends before it starts', () => {
    expect(fout({...geldig, bestellen: {van: '2027-01-17', tot: '2027-01-04'}})).toContain('De laatste besteldag ligt vóór de eerste.');
  });

  it('refuses a price in euros, a negative stock and an unknown field', () => {
    expect(fout({...geldig, producten: [{id: 'a', naam: 'A', prijs: 12.5}]})).toContain('Vul bij elk product een geldige prijs in, bv. 12,50.');
    expect(fout({...geldig, producten: [{id: 'a', naam: 'A', prijs: 100, voorraad: -1}]})).toContain('voorraad');
    expect(fout({...geldig, kleur: 'rood'})).toBeDefined();
  });

  it('needs a way to pay, a pickup moment and a product', () => {
    expect(fout({...geldig, betalen: {wijzen: []}})).toContain('Kies minstens één manier om te betalen.');
    expect(fout({...geldig, afhalen: []})).toContain('Voeg minstens één afhaalmoment toe.');
    expect(fout({...geldig, producten: []})).toContain('Voeg minstens één product toe.');
  });

  it('refuses duplicate codes and choice names', () => {
    expect(fout({...geldig, producten: [{id: 'a', naam: 'A', prijs: 1}, {id: 'a', naam: 'B', prijs: 1}]})).toContain('Twee producten hebben dezelfde code.');
    expect(fout({
      ...geldig,
      producten: [{id: 'a', naam: 'Mand', prijs: 1, opties: [{id: 'brood', naam: 'Brood', keuzes: [{naam: 'Wit'}, {naam: 'wit'}]}]}],
    })).toContain('Twee keuzes bij Brood hebben dezelfde naam.');
  });

  it('allows at most 12 combinations per product', () => {
    const keuzes = (n: number) => Array.from({length: n}, (_, index) => ({naam: `K${index}`}));
    const product = (a: number, b: number) => ({
      id: 'p', naam: 'P', prijs: 1, opties: [{id: 'a', naam: 'A', keuzes: keuzes(a)}, {id: 'b', naam: 'B', keuzes: keuzes(b)}],
    });
    expect(fout({...geldig, producten: [product(3, 4)]})).toBeUndefined();
    expect(fout({...geldig, producten: [product(13, 1)]})).toContain('Te veel combinaties');
  });
});

describe('siteSchema bestellingen', () => {
  const site = {
    navigatie: [],
    footer: {tagline: '', adres: {straat: '', gemeente: ''}, email: '', groepen: [], sociaal: [], copyright: ''},
    cta: {titel: '', tekst: '', knop: {tekst: 'a', link: '/'}},
    decoraties: {
      enabled: false,
      season: 'none',
      decorations: {christmasLights: false, snowfall: false, icicles: false, gingerbreadMan: false, christmasBalls: false},
    },
    aankondiging: {actief: false, tekst: '', type: 'info'},
  };

  it('defaults to the example account', () => {
    expect(siteSchema.parse(site).bestellingen.rekening).toEqual({iban: 'BE68 5390 0754 7034', begunstigde: 'Talentenraad Het Talentenhuis'});
  });

  it('formats a valid IBAN and refuses an invalid one', () => {
    const met = (iban: string) => ({...site, bestellingen: {rekening: {iban, begunstigde: 'X'}}});
    expect(siteSchema.parse(met('be68539007547034')).bestellingen.rekening.iban).toBe('BE68 5390 0754 7034');
    expect(siteSchema.safeParse(met('BE68 5390 0754 7035')).success).toBe(false);
  });
});
