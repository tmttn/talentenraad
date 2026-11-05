import {
  actieStatus, afhaalLabel, kanBestellen, leesVeldnaam, plusDagen, productVarianten, veldnaam, weekdag,
} from '@lib/bestellingen/acties';

const periode = {bestellen: {van: '2027-01-04', tot: '2027-01-17'}};

describe('actieStatus', () => {
  it('is open from the first up to and including the last day', () => {
    expect(actieStatus(periode, '2027-01-03')).toBe('binnenkort');
    expect(actieStatus(periode, '2027-01-04')).toBe('open');
    expect(actieStatus(periode, '2027-01-17')).toBe('open');
    expect(actieStatus(periode, '2027-01-18')).toBe('gesloten');
  });
});

describe('dates', () => {
  it('labels a pickup moment', () => {
    expect(afhaalLabel({datum: '2027-01-22', uur: '17:00 - 19:00'})).toBe('Vrijdag 22 januari, 17:00 - 19:00');
    expect(weekdag('2027-01-23')).toBe('zaterdag');
  });

  it('adds days across a month', () => {
    expect(plusDagen('2027-01-29', 5)).toBe('2027-02-03');
    expect(plusDagen('2027-01-29', 0)).toBe('2027-01-29');
  });
});

describe('productVarianten', () => {
  it('gives one variant without options', () => {
    expect(productVarianten({prijs: 1000, opties: []})).toEqual([{sleutel: '', keuzes: [], prijs: 1000, label: ''}]);
  });

  it('combines every choice with surcharges', () => {
    const varianten = productVarianten({
      prijs: 2500,
      opties: [
        {id: 'brood', naam: 'Brood', keuzes: [{naam: 'Wit', meerprijs: 0}, {naam: 'Bruin', meerprijs: 0}, {naam: 'Glutenvrij', meerprijs: 200}]},
        {id: 'drank', naam: 'Drank', keuzes: [{naam: 'Cava', meerprijs: 800}, {naam: 'Fruitsap', meerprijs: 0}]},
      ],
    });

    expect(varianten).toHaveLength(6);
    expect(varianten[0]).toEqual({
      sleutel: 'Wit/Cava',
      keuzes: [{optie: 'Brood', keuze: 'Wit'}, {optie: 'Drank', keuze: 'Cava'}],
      prijs: 3300,
      label: 'Wit, cava',
    });
    expect(varianten.find(variant => variant.sleutel === 'Glutenvrij/Fruitsap')?.prijs).toBe(2700);
  });

  it('encodes names so a slash in a choice stays one choice', () => {
    const [variant] = productVarianten({prijs: 0, opties: [{id: 'a', naam: 'A', keuzes: [{naam: 'Half/half', meerprijs: 0}]}]});
    expect(variant.sleutel).toBe('Half%2Fhalf');
  });
});

describe('veldnaam', () => {
  it('round-trips product and variant', () => {
    expect(veldnaam('mand', '')).toBe('aantal:mand');
    expect(leesVeldnaam(veldnaam('mand', ''))).toEqual({productId: 'mand', sleutel: ''});
    expect(leesVeldnaam(veldnaam('mand', 'Wit/Cava'))).toEqual({productId: 'mand', sleutel: 'Wit/Cava'});
    expect(leesVeldnaam('naam')).toBeUndefined();
  });
});

describe('kanBestellen', () => {
  const actie = {...periode, concept: false};
  const voorbeeld = 'BE68 5390 0754 7034';
  const echt = 'NL91 ABNA 0417 1643 00';

  it('follows the ordering period', () => {
    expect(kanBestellen(actie, echt, '2027-01-03', true)).toEqual({open: false, reden: 'binnenkort'});
    expect(kanBestellen(actie, echt, '2027-01-10', true)).toEqual({open: true});
    expect(kanBestellen(actie, echt, '2027-01-18', true)).toEqual({open: false, reden: 'gesloten'});
  });

  it('stays closed in production with the example account or as a draft', () => {
    expect(kanBestellen(actie, voorbeeld, '2027-01-10', true)).toEqual({open: false, reden: 'voorbeeldrekening'});
    expect(kanBestellen({...actie, concept: true}, echt, '2027-01-10', true)).toEqual({open: false, reden: 'concept'});
    expect(kanBestellen({...actie, concept: true}, voorbeeld, '2027-01-10', false)).toEqual({open: true});
  });
});
