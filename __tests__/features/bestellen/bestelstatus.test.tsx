import {render, screen} from '@testing-library/react';
import {Bestelstatus} from '../../../app/features/bestellen/bestelstatus';
import type {OrderLine} from '@lib/db/schema';

const regel = (overrides: Partial<OrderLine>): OrderLine => ({
  id: 'r1', orderId: 'o1', volgorde: 0, productId: 'margherita', naam: 'Margherita', keuzes: [], prijsCent: 1000, aantal: 2, meegegeven: false, ...overrides,
});
const order = {
  nummer: 14, status: 'wacht' as const, totaalCent: 3200, afhaalLabel: 'Vrijdag 22 januari, 17:00 - 19:00', afhaalPlaats: 'Refter', afgehaaldOp: null,
  regels: [regel({}), regel({id: 'r2', naam: 'Ontbijtmand', keuzes: [{optie: 'Brood', keuze: 'Glutenvrij'}], prijsCent: 1200, aantal: 1})],
};
const betalen = {iban: 'BE68 5390 0754 7034', begunstigde: 'Talentenraad', mededeling: '+++000/0000/01414+++', uiterlijk: 'vrijdag 15 januari', cash: false};

describe('Bestelstatus', () => {
  it('shows how to pay while waiting', () => {
    render(<Bestelstatus order={order} titel='Pizzaverkoop' betalen={betalen} />);
    expect(screen.getByText('Wacht op betaling')).toBeInTheDocument();
    expect(screen.getByText('Betaal uiterlijk vrijdag 15 januari')).toBeInTheDocument();
    expect(screen.getByText('+++000/0000/01414+++')).toBeInTheDocument();
    expect(screen.getByText('1 × Ontbijtmand (glutenvrij)')).toBeInTheDocument();
    expect(screen.queryByText(/Liever cash/)).not.toBeInTheDocument();
  });

  it('shows the QR code and short code once paid', () => {
    render(<Bestelstatus order={{...order, status: 'betaald'}} titel='Pizzaverkoop' qr={{svg: '<svg role="img" aria-label="QR-code"></svg>', korteCode: 'K7P-4QX'}} />);
    expect(screen.getByText('Betaald · klaar om af te halen')).toBeInTheDocument();
    expect(screen.getByRole('img', {name: 'QR-code'})).toBeInTheDocument();
    expect(screen.getByText('K7P-4QX')).toBeInTheDocument();
    expect(screen.getByText('Totaal, betaald')).toBeInTheDocument();
  });

  it('says a cancelled paid order will be paid back and hides pickup', () => {
    render(<Bestelstatus order={{...order, status: 'terugbetalen'}} titel='Pizzaverkoop' />);
    expect(screen.getByText('Geannuleerd · we storten het bedrag terug')).toBeInTheDocument();
    expect(screen.queryByText('Refter')).not.toBeInTheDocument();
  });
});
