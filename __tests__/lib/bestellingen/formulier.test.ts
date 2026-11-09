import {controleerBestelling, leesBestelFormulier, stuksPerProduct} from '@lib/bestellingen/formulier';
import {testActie} from '../../helpers/acties';

const actie = testActie();
const basis = {naam: 'Ouder A', email: 'ouder@example.com', afhaalId: 'vrijdag'};

describe('leesBestelFormulier', () => {
  it('reads quantities per variant, empty is zero', () => {
    const data = new FormData();
    data.set('aantal:margherita', '2');
    data.set('aantal:mand:Wit', '');
    data.set('aantal:mand:Glutenvrij', '1');
    data.set('naam', '  Ouder A ');
    const {invoer, fouten, gewijzigd} = leesBestelFormulier(actie, data);
    expect(invoer.regels).toEqual([{productId: 'margherita', sleutel: '', aantal: 2}, {productId: 'mand', sleutel: 'Glutenvrij', aantal: 1}]);
    expect(invoer.naam).toBe('Ouder A');
    expect(fouten).toEqual({});
    expect(gewijzigd).toBe(false);
    expect(stuksPerProduct(invoer.regels)).toEqual(new Map([['margherita', 2], ['mand', 1]]));
  });

  it('reports a quantity that is not a number at its product', () => {
    expect(leesBestelFormulier(actie, {'aantal:margherita': 'twee'}).fouten).toEqual({'product:margherita': 'Vul een aantal in, bv. 2.'});
    expect(leesBestelFormulier(actie, {'aantal:margherita': '-1'}).fouten).toEqual({'product:margherita': 'Vul een aantal in, bv. 2.'});
  });

  it('notices products or choices the sale no longer has, but not empty ones', () => {
    expect(leesBestelFormulier(actie, {'aantal:quattro': '1'}).gewijzigd).toBe(true);
    expect(leesBestelFormulier(actie, {'aantal:quattro': '0', 'aantal:mand:Bruin': ''}).gewijzigd).toBe(false);
  });
});

describe('controleerBestelling', () => {
  const met = (velden: Record<string, string>) => controleerBestelling(actie, leesBestelFormulier(actie, {...basis, ...velden}).invoer);

  it('accepts a complete order and an optional phone', () => {
    expect(met({'aantal:margherita': '1'})).toEqual({});
    expect(met({'aantal:margherita': '1', telefoon: '+32 470 12 34 56'})).toEqual({});
  });

  it('says what is missing', () => {
    expect(met({naam: 'A', email: 'ouder@example', telefoon: 'bel me', afhaalId: ''})).toEqual({
      naam: 'Vul je volledige naam in.',
      email: 'Vul een volledig e-mailadres in, bv. naam@voorbeeld.be',
      telefoon: 'Vul een geldig telefoonnummer in, of laat het leeg.',
      afhaalId: 'Kies wanneer je afhaalt.',
      producten: 'Kies minstens één product.',
    });
  });

  it('counts the maximum over all variants of a product', () => {
    expect(met({'aantal:mand:Wit': '2', 'aantal:mand:Glutenvrij': '3'})).toEqual({'product:mand': 'Maximaal 4 Ontbijtmand per bestelling.'});
  });

  it('asks the child only when the sale needs it', () => {
    const metKind = testActie({vraag: {kind: true}});
    const fouten = controleerBestelling(metKind, leesBestelFormulier(metKind, {...basis, 'aantal:margherita': '1'}).invoer);
    expect(fouten).toEqual({kindNaam: 'Vul de naam van je kind in.', kindKlas: 'Vul de klas van je kind in.'});
  });

  it('lets the board leave the e-mail empty, but not fill in a wrong one', () => {
    const zonder = (email: string) => controleerBestelling(actie, leesBestelFormulier(actie, {...basis, email, 'aantal:margherita': '1'}).invoer, {emailVerplicht: false});
    expect(zonder('')).toEqual({});
    expect(zonder('oma@')).toEqual({email: 'Vul een volledig e-mailadres in, bv. naam@voorbeeld.be'});
    expect(met({email: '', 'aantal:margherita': '1'})).toEqual({email: 'Vul je e-mailadres in, bv. naam@voorbeeld.be'});
  });
});
