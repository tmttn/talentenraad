// @vitest-environment node
import path from 'node:path';
import matter from 'gray-matter';
import {CORE_SCHEMA, load} from 'js-yaml';
import {readMarkdownFile} from '@lib/content/files';
import {actieSchema} from '@lib/content/schemas';
import {
  actieFormWaarden, actieFoutVeld, afhalenInvoer, leesProductRijen, productenInvoer, type ProductRij,
} from '@lib/content-store/actie-form';
import {parseEntryForm, serializeEntry} from '@lib/content-store/serialize';

const voorbeeld = path.resolve('content/acties/pizzaverkoop-2027/index.md');
const rij = (overrides: Partial<ProductRij>): ProductRij => ({
  id: '', naam: '', info: '', prijs: '', voorraad: '', maxPerBestelling: '', opties: [], ...overrides,
});

const parseText = (text: string) => matter(text, {engines: {yaml: {parse: source => load(source, {schema: CORE_SCHEMA}) as object}}});

describe('actie form round-trip', () => {
  it('turns the example into form values and back into the same sale', () => {
    const {data, body} = readMarkdownFile(voorbeeld);
    // The example is real content that editors change: take its draft flag as it is, never assume it
    const values = {
      titel: String(data.titel), samenvatting: String(data.samenvatting), inhoud: body, concept: data.concept === true ? 'on' : '', ...actieFormWaarden(data),
    };
    expect(values.producten).toContain('"prijs":"10,00"');

    const parsed = parseEntryForm('acties', values);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) {
      return;
    }

    const text = serializeEntry('acties', parsed.frontmatter, parsed.body);
    const again = parseText(text);
    expect(actieSchema.parse(again.data)).toEqual(actieSchema.parse(data));
    expect(text).not.toContain('maxPerBestelling');
    expect(text).not.toContain('vraag');
  });

  it('writes options with surcharges and a child question', () => {
    const parsed = parseEntryForm('acties', {
      titel: 'Ontbijtmanden',
      samenvatting: 'Voor moederdag.',
      bestellenVan: '2027-04-14',
      bestellenTot: '2027-05-02',
      binnenDagen: '5',
      wijzeCash: 'on',
      rekeningIban: 'be68 5390 0754 7034',
      rekeningBegunstigde: 'Talentenraad Het Talentenhuis',
      vraagKind: 'on',
      afhalen: JSON.stringify([{id: '', datum: '2027-05-09', uur: '8:00 - 10:00', plaats: 'Refter'}]),
      producten: JSON.stringify([rij({
        naam: 'Ontbijtmand voor 2',
        prijs: '25',
        voorraad: '120',
        maxPerBestelling: '4',
        opties: [{id: '', naam: 'Brood', keuzes: [{naam: 'Wit', meerprijs: ''}, {naam: 'Glutenvrij', meerprijs: '2,00'}, {naam: '', meerprijs: ''}]}],
      })]),
    });

    expect(parsed).toMatchObject({ok: true, slugSource: 'Ontbijtmanden'});
    if (!parsed.ok) {
      return;
    }

    expect(parsed.frontmatter).toMatchObject({
      betalen: {wijzen: ['cash'], binnenDagen: 5, rekening: {iban: 'BE68 5390 0754 7034', begunstigde: 'Talentenraad Het Talentenhuis'}},
      vraag: {kind: true},
      afhalen: [{id: 'zondag', datum: '2027-05-09'}],
      producten: [{
        id: 'ontbijtmand-voor-2',
        prijs: 2500,
        voorraad: 120,
        maxPerBestelling: 4,
        opties: [{id: 'brood', naam: 'Brood', keuzes: [{naam: 'Wit'}, {naam: 'Glutenvrij', meerprijs: 200}]}],
      }],
    });
  });
});

describe('parseActieForm errors', () => {
  const basis = {
    titel: 'Pizza',
    samenvatting: 'S',
    bestellenVan: '2027-01-04',
    bestellenTot: '2027-01-17',
    wijzeOverschrijving: 'on',
    rekeningIban: 'BE68 5390 0754 7034',
    rekeningBegunstigde: 'Talentenraad',
    afhalen: JSON.stringify([{id: 'vrijdag', datum: '2027-01-22', uur: '17:00', plaats: 'Refter'}]),
    producten: JSON.stringify([rij({naam: 'Margherita', prijs: '10'})]),
  };
  const errors = (values: Record<string, string>) => {
    const parsed = parseEntryForm('acties', values);
    return parsed.ok ? {} : parsed.errors;
  };

  it('puts each message at its field', () => {
    expect(errors(basis)).toEqual({});
    expect(errors({...basis, wijzeOverschrijving: ''})).toEqual({betaalwijzen: 'Kies minstens één manier om te betalen.'});
    expect(errors({...basis, bestellenTot: '2027-01-01'})).toEqual({bestellenTot: 'De laatste besteldag ligt vóór de eerste.'});
    expect(errors({...basis, binnenDagen: 'vijf'})).toEqual({binnenDagen: 'Vul een aantal dagen in tussen 0 en 60.'});
    expect(errors({...basis, rekeningIban: 'BE68 5390 0754 7035'})).toEqual({rekeningIban: 'Vul een geldig rekeningnummer (IBAN) in.'});
    expect(errors({...basis, rekeningIban: ''})).toEqual({rekeningIban: 'Vul het rekeningnummer in.'});
    expect(errors({...basis, rekeningBegunstigde: ''})).toEqual({rekeningBegunstigde: 'Vul in op wiens naam de rekening staat.'});
    expect(errors({...basis, producten: JSON.stringify([rij({naam: 'A', prijs: '10'}), rij({naam: 'B', prijs: 'abc'})])}))
      .toEqual({producten: 'Product 2: Vul bij elk product een geldige prijs in, bv. 12,50.'});
    expect(errors({...basis, producten: '[]'})).toEqual({producten: 'Voeg minstens één product toe.'});
    expect(errors({...basis, afhalen: JSON.stringify([{datum: '2027-01-22', uur: '', plaats: 'R'}])}))
      .toEqual({afhalen: 'Afhaalmoment 1: Vul bij elk afhaalmoment een uur in, bv. 17:00 - 19:00.'});
  });

  it('maps schema paths', () => {
    expect(actieFoutVeld(['bestellen', 'van'], 'x')).toEqual(['bestellenVan', 'x']);
    expect(actieFoutVeld(['betalen', 'wijzen', 0], 'x')).toEqual(['betaalwijzen', 'x']);
    expect(actieFoutVeld(['betalen', 'rekening', 'iban'], 'x')).toEqual(['rekeningIban', 'x']);
    expect(actieFoutVeld(['betalen', 'rekening', 'begunstigde'], 'x')).toEqual(['rekeningBegunstigde', 'x']);
    expect(actieFoutVeld(['betalen', 'rekening'], 'x')).toEqual(['rekeningIban', 'x']);
    expect(actieFoutVeld(['titel'], 'x')).toEqual(['titel', 'x']);
  });
});

describe('codes', () => {
  it('keeps existing codes and makes new ones unique', () => {
    const producten = productenInvoer([
      rij({id: 'margherita', naam: 'Margherita (nieuw recept)', prijs: '10'}),
      rij({naam: 'Margherita', prijs: '10'}),
      rij({naam: '', prijs: '', info: ''}),
      rij({naam: '!!!', prijs: '1'}),
    ]) as Array<{id: string}>;
    expect(producten.map(product => product.id)).toEqual(['margherita', 'margherita-2', 'product']);
  });

  it('names pickup moments after the weekday', () => {
    const momenten = afhalenInvoer([
      {id: '', datum: '2027-01-22', uur: '17:00', plaats: 'R'},
      {id: '', datum: '2027-01-29', uur: '17:00', plaats: 'R'},
      {id: '', datum: '', uur: '', plaats: ''},
    ]) as Array<{id: string}>;
    expect(momenten.map(moment => moment.id)).toEqual(['vrijdag', 'vrijdag-2']);
  });

  it('reads only well-formed rows', () => {
    expect(leesProductRijen('{kapot')).toEqual([]);
    expect(leesProductRijen('[{"naam": "A", "prijs": 1250}]')[0]).toMatchObject({naam: 'A', prijs: '12,50'});
  });
});
