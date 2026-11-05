import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {BestelFormulier, type BestelActie} from '../../../app/features/bestellen/bestel-formulier';
import type {BestelState} from '../../../app/(main)/acties/[slug]/actions';
import {testActie} from '../../helpers/acties';

vi.mock('../../../app/(main)/acties/[slug]/actions', () => ({bestel: vi.fn()}));

const basis = testActie();
const actie: BestelActie = {
  slug: basis.slug,
  producten: basis.producten,
  afhalen: basis.afhalen,
  vraag: basis.vraag,
  wijzen: basis.betalen.wijzen,
  afhaalLabels: {vrijdag: 'Vrijdag 22 januari, 17:00 - 19:00', zaterdag: 'Zaterdag 23 januari, 10:00 - 12:00'},
};

const renderForm = (action = vi.fn<(state: BestelState, data: FormData) => Promise<BestelState>>(), over: Record<string, number> = {margherita: 3}) =>
  render(<BestelFormulier actie={actie} over={over} formToken='token' action={action} />);

describe('BestelFormulier', () => {
  it('counts with the stepper and keeps a running total', () => {
    renderForm();
    const meer = screen.getByRole('button', {name: 'Eén Margherita meer'});
    expect(screen.getByRole('button', {name: 'Eén Margherita minder'})).toBeDisabled();
    fireEvent.click(meer);
    fireEvent.click(meer);
    fireEvent.click(screen.getByRole('button', {name: 'Eén Ontbijtmand glutenvrij meer'}));
    expect(screen.getByRole('spinbutton', {name: 'Aantal Margherita'})).toHaveValue(2);
    expect(screen.getByText('2 × Margherita')).toBeInTheDocument();
    expect(screen.getByText('1 × Ontbijtmand (glutenvrij)')).toBeInTheDocument();
    expect(screen.getByText('€ 47,00')).toBeInTheDocument();
  });

  it('stops at the stock and at the maximum over all choices', () => {
    renderForm();
    const meer = screen.getByRole('button', {name: 'Eén Margherita meer'});
    for (let i = 0; i < 5; i++) {
      fireEvent.click(meer);
    }

    expect(screen.getByRole('spinbutton', {name: 'Aantal Margherita'})).toHaveValue(3);
    expect(meer).toBeDisabled();

    fireEvent.change(screen.getByRole('spinbutton', {name: 'Aantal Ontbijtmand wit'}), {target: {value: '3'}});
    fireEvent.click(screen.getByRole('button', {name: 'Eén Ontbijtmand glutenvrij meer'}));
    expect(screen.getByRole('button', {name: 'Eén Ontbijtmand glutenvrij meer'})).toBeDisabled();
  });

  it('shows sold out products without a stepper', () => {
    renderForm(undefined, {margherita: 0});
    expect(screen.getByText('Uitverkocht')).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Eén Margherita meer'})).not.toBeInTheDocument();
  });

  it('checks in the browser before sending', () => {
    const action = vi.fn();
    renderForm(action);
    fireEvent.click(screen.getByRole('button', {name: 'Bestellen'}));
    expect(action).not.toHaveBeenCalled();
    expect(screen.getByText('Kies minstens één product.')).toBeInTheDocument();
    expect(screen.getByText('Vul je naam in.')).toBeInTheDocument();
    expect(screen.getByRole('textbox', {name: 'Naam'})).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Er klopt nog iets niet.');
  });

  it('sends a complete order and shows server errors at the fields', async () => {
    const action = vi.fn<(state: BestelState, data: FormData) => Promise<BestelState>>().mockResolvedValue({
      status: 'error',
      message: 'Iets uit je bestelling is net uitverkocht. Kijk je bestelling na.',
      fouten: {'product:margherita': 'Nog 1 Margherita over.'},
      values: {naam: 'Ouder A'},
    });
    renderForm(action);
    fireEvent.click(screen.getByRole('button', {name: 'Eén Margherita meer'}));
    fireEvent.change(screen.getByRole('textbox', {name: 'Naam'}), {target: {value: 'Ouder A'}});
    fireEvent.change(screen.getByRole('textbox', {name: /E-mail/}), {target: {value: 'ouder@example.com'}});
    fireEvent.click(screen.getByRole('radio', {name: /Zaterdag 23 januari/}));
    fireEvent.submit(screen.getByRole('form', {name: 'Bestellen'}));

    await waitFor(() => {
      expect(action).toHaveBeenCalled();
    });
    const data = action.mock.calls[0][1];
    expect(data.get('aantal:margherita')).toBe('1');
    expect(data.get('afhaalId')).toBe('zaterdag');
    expect(data.get('actie')).toBe('pizzaverkoop');
    expect(await screen.findByText('Nog 1 Margherita over.')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('net uitverkocht');
  });

  it('thanks quietly after a spam answer', async () => {
    renderForm(vi.fn().mockResolvedValue({status: 'spam'}));
    fireEvent.click(screen.getByRole('button', {name: 'Eén Margherita meer'}));
    fireEvent.change(screen.getByRole('textbox', {name: 'Naam'}), {target: {value: 'Ouder A'}});
    fireEvent.change(screen.getByRole('textbox', {name: /E-mail/}), {target: {value: 'ouder@example.com'}});
    fireEvent.click(screen.getByRole('radio', {name: /Vrijdag 22 januari/}));
    fireEvent.submit(screen.getByRole('form', {name: 'Bestellen'}));
    expect(await screen.findByText('Bedankt voor je bestelling!')).toBeInTheDocument();
  });
});
