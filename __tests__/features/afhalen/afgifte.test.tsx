import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {Afgifte} from '../../../app/features/afhalen/afgifte';
import type {OrderMetRegels} from '@lib/bestellingen/bestellingen';
import {testOrder, testRegel} from '../../helpers/orders';

const order = (overrides: Partial<OrderMetRegels> = {}): OrderMetRegels => ({
  ...testOrder({
    naam: 'Sara Peeters',
    email: 'sara.peeters@example.com',
    telefoon: '0470 12 34 56',
    kindNaam: 'Lotte',
    kindKlas: '3B',
    nummer: 14,
    korteCode: 'K7P4QX',
    totaalCent: 3200,
    status: 'betaald',
  }),
  id: 'o1',
  betaalwijze: null,
  betaalbron: null,
  betaaldOp: null,
  betaaldDoor: null,
  afgehaaldOp: null,
  afgehaaldDoor: null,
  geannuleerdOp: null,
  geannuleerdDoor: null,
  annuleerReden: null,
  terugbetaaldOp: null,
  terugbetaaldDoor: null,
  notitie: null,
  bevestigingVerstuurdOp: null,
  qrVerstuurdOp: null,
  gewistOp: null,
  regels: [
    {...testRegel('o1', {aantal: 2}), id: 'r1', meegegeven: false},
    {
      ...testRegel('o1', {
        volgorde: 1, productId: 'ontbijtmand', naam: 'Ontbijtmand', keuzes: [{optie: 'Brood', keuze: 'Glutenvrij'}],
      }), id: 'r2', meegegeven: false,
    },
  ],
  ...overrides,
} as OrderMetRegels);

const waar = {actie: 'pizzaverkoop', moment: 'vrijdag'};
const teller = {afgehaald: 38, totaal: 52};
const actions = {geefMeeAction: vi.fn(), cashAction: vi.fn()};

describe('Afgifte', () => {
  it('shows a paid order of this moment with its products, large, and "Alles meegegeven"', () => {
    render(<Afgifte order={order()} waar={waar} teller={teller} magCash={false} {...actions} />);

    expect(screen.getByRole('status')).toHaveTextContent('Betaald · juist afhaalmoment');
    expect(screen.getByRole('heading', {name: 'Sara Peeters'})).toBeInTheDocument();
    expect(screen.getByText('Kind: Lotte · 3B')).toBeInTheDocument();
    expect(screen.getByText('Bestelling nr. 14 · K7P-4QX')).toBeInTheDocument();
    expect(screen.getByText('2×')).toBeInTheDocument();
    expect(screen.getByText('Glutenvrij')).toBeInTheDocument();
    expect(screen.getByText('38 van 52')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Alles meegegeven'})).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  });

  it('never shows e-mail, phone or the amount of a paid order', () => {
    const {container} = render(<Afgifte order={order({notitie: 'Haalt ook op voor nr. 15'})} waar={waar} teller={teller} magCash {...actions} />);

    expect(container).not.toHaveTextContent('sara.peeters@example.com');
    expect(container).not.toHaveTextContent('0470');
    expect(container).not.toHaveTextContent('32,00');
    expect(screen.getByText('Haalt ook op voor nr. 15')).toBeInTheDocument();
  });

  it('stops an unpaid order: the open amount, no hand-over, cash only with bank access', () => {
    const {rerender} = render(<Afgifte order={order({status: 'wacht'})} waar={waar} teller={teller} magCash={false} {...actions} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Nog niet betaald');
    expect(screen.getByRole('alert')).toHaveTextContent('Open bedrag: € 32,00');
    expect(screen.queryByRole('button', {name: 'Alles meegegeven'})).not.toBeInTheDocument();
    expect(screen.queryByRole('button', {name: /cash ontvangen/})).not.toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Volgende scannen'})).toHaveAttribute('href', '/admin/afhalen/pizzaverkoop/vrijdag');
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);

    rerender(<Afgifte order={order({status: 'wacht'})} waar={waar} teller={teller} magCash {...actions} />);
    expect(screen.getByRole('button', {name: '€ 32,00 cash ontvangen'})).toBeInTheDocument();
  });

  it('tells when and by whom an order was handed over already', () => {
    render(<Afgifte
      order={order({status: 'afgehaald', afgehaaldOp: new Date('2027-01-22T16:42:00Z'), afgehaaldDoor: 'Sara'})}
      waar={waar} teller={teller} magCash={false} now={new Date('2027-01-22T17:00:00Z')} {...actions}
    />);

    expect(screen.getByRole('alert')).toHaveTextContent('Al afgehaald om 17:42 door Sara');
    expect(screen.queryByRole('button', {name: 'Alles meegegeven'})).not.toBeInTheDocument();
  });

  it('warns about another pickup moment but still lets a paid order go', () => {
    render(<Afgifte order={order({afhaalId: 'zaterdag', afhaalLabel: 'Zaterdag 23 januari, 10:00 - 12:00'})} waar={waar} teller={teller} magCash={false} {...actions} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Ander afhaalmoment: zaterdag 23 januari, 10:00 - 12:00');
    expect(screen.getByRole('button', {name: 'Alles meegegeven'})).toBeInTheDocument();
  });

  it('stops a cancelled order and shows the bank error', () => {
    render(<Afgifte order={order({status: 'geannuleerd'})} waar={waar} teller={teller} magCash={false} fout='geen-bank' {...actions} />);

    const alerts = screen.getAllByRole('alert');
    expect(alerts[0]).toHaveTextContent('Alleen wie toegang heeft tot de bankrekening kan cash ontvangen.');
    expect(alerts[1]).toHaveTextContent('Geannuleerd');
  });

  it('links admins to the order management and the parent page', () => {
    render(<Afgifte order={order()} waar={waar} teller={teller} magCash={false} beheerHref='/admin/bestellingen/pizzaverkoop/14' ouderHref='/b/x?ouder=1' {...actions} />);

    expect(screen.getByRole('link', {name: 'Bestelling in het beheer'})).toHaveAttribute('href', '/admin/bestellingen/pizzaverkoop/14');
    expect(screen.getByRole('link', {name: 'Zoals de ouder het ziet'})).toHaveAttribute('href', '/b/x?ouder=1');
  });
});
