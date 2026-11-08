import {fireEvent, render, screen} from '@testing-library/react';
import {ActieFields} from '../../../app/features/admin/content-editor/actie-fields';

const hidden = (container: HTMLElement, name: string) =>
  JSON.parse((container.querySelector(`input[name="${name}"]`) as HTMLInputElement).value) as Array<Record<string, unknown>>;

describe('ActieFields', () => {
  it('starts a new sale with transfer ticked, one empty product and one pickup moment', () => {
    const {container} = render(<ActieFields values={{}} errors={{}} />);
    expect(screen.getByRole('checkbox', {name: /Overschrijving/})).toBeChecked();
    expect(screen.getByRole('checkbox', {name: /Cash/})).not.toBeChecked();
    expect(hidden(container, 'producten')).toHaveLength(1);
    expect(hidden(container, 'afhalen')).toHaveLength(1);
  });

  it('asks the account per sale: empty for a new one, with the usual name; a saved one keeps its own', () => {
    const {unmount} = render(<ActieFields values={{}} errors={{}} />);
    expect(screen.getByRole('textbox', {name: /Rekeningnummer \(IBAN\)/})).toHaveValue('');
    expect(screen.getByRole('textbox', {name: /Op naam van/})).toHaveValue('Talentenraad Het Talentenhuis');
    unmount();

    render(<ActieFields
      values={{bestellenVan: '2027-01-04', rekeningIban: 'BE68 5390 0754 7034', rekeningBegunstigde: 'Ouderraad'}}
      errors={{rekeningIban: 'Vul een geldig rekeningnummer (IBAN) in.'}}
    />);
    const iban = screen.getByRole('textbox', {name: /Rekeningnummer \(IBAN\)/});
    expect(iban).toHaveValue('BE68 5390 0754 7034');
    expect(iban).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Vul een geldig rekeningnummer (IBAN) in.')).toBeInTheDocument();
    expect(screen.getByRole('textbox', {name: /Op naam van/})).toHaveValue('Ouderraad');
  });

  it('edits products with options and choices', () => {
    const {container} = render(<ActieFields values={{bestellenVan: '', producten: '[]', afhalen: '[]'}} errors={{}} />);
    fireEvent.change(screen.getByRole('textbox', {name: /^Naam/}), {target: {value: 'Mand'}});
    fireEvent.change(screen.getByRole('textbox', {name: /^Prijs in euro/}), {target: {value: '25'}});
    fireEvent.click(screen.getByRole('button', {name: 'Optie toevoegen'}));
    fireEvent.change(screen.getByRole('textbox', {name: 'Product 1, optie 1: naam'}), {target: {value: 'Brood'}});
    fireEvent.change(screen.getByRole('textbox', {name: 'Product 1, optie 1, keuze 1: naam'}), {target: {value: 'Wit'}});
    fireEvent.click(screen.getByRole('button', {name: 'Keuze toevoegen'}));
    fireEvent.change(screen.getByRole('textbox', {name: 'Product 1, optie 1, keuze 2: naam'}), {target: {value: 'Glutenvrij'}});
    fireEvent.change(screen.getByRole('textbox', {name: 'Product 1, optie 1, keuze 2: meerprijs in euro'}), {target: {value: '2'}});

    expect(hidden(container, 'producten')).toEqual([{
      id: '',
      naam: 'Mand',
      info: '',
      prijs: '25',
      voorraad: '',
      maxPerBestelling: '',
      opties: [{id: '', naam: 'Brood', keuzes: [{naam: 'Wit', meerprijs: ''}, {naam: 'Glutenvrij', meerprijs: '2'}]}],
    }]);

    fireEvent.click(screen.getByRole('button', {name: 'Product 1, optie 1, keuze 1 verwijderen'}));
    expect(hidden(container, 'producten')[0].opties).toEqual([{id: '', naam: 'Brood', keuzes: [{naam: 'Glutenvrij', meerprijs: '2'}]}]);
  });

  it('adds, moves and removes products and pickup moments', () => {
    const {container} = render(<ActieFields values={{bestellenVan: '', producten: JSON.stringify([{id: 'a', naam: 'A', prijs: 100}]), afhalen: '[]'}} errors={{}} />);
    fireEvent.click(screen.getByRole('button', {name: 'Product toevoegen'}));
    fireEvent.click(screen.getByRole('button', {name: 'Product 2 omhoog'}));
    expect(hidden(container, 'producten').map(product => product.id)).toEqual(['', 'a']);
    fireEvent.click(screen.getByRole('button', {name: 'Product 1 verwijderen'}));
    expect(hidden(container, 'producten').map(product => product.id)).toEqual(['a']);

    fireEvent.change(screen.getByLabelText('Afhaalmoment 1: datum'), {target: {value: '2027-01-22'}});
    fireEvent.click(screen.getByRole('button', {name: 'Afhaalmoment toevoegen'}));
    fireEvent.click(screen.getByRole('button', {name: 'Afhaalmoment 1 omlaag'}));
    expect(hidden(container, 'afhalen').map(moment => moment.datum)).toEqual(['', '2027-01-22']);
  });

  it('shows the server errors at their fields', () => {
    render(<ActieFields
      values={{bestellenVan: '2027-01-04', wijzeOverschrijving: '', producten: '[]', afhalen: '[]'}}
      errors={{betaalwijzen: 'Kies minstens één manier om te betalen.', producten: 'Voeg minstens één product toe.', bestellenTot: 'Kies een geldige datum.'}}
    />);
    expect(screen.getByRole('checkbox', {name: /Overschrijving/})).not.toBeChecked();
    expect(screen.getByRole('checkbox', {name: /Overschrijving/})).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Voeg minstens één product toe.')).toBeInTheDocument();
    expect(screen.getByLabelText(/Bestellen tot en met/)).toHaveAttribute('aria-invalid', 'true');
  });
});
