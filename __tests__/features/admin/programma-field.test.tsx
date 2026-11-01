import {fireEvent, render, screen} from '@testing-library/react';
import {parseRows, ProgrammaField} from '../../../app/features/admin/content-editor/programma-field';

const hidden = (container: HTMLElement) => JSON.parse((container.querySelector('input[type="hidden"]') as HTMLInputElement).value) as unknown;

describe('ProgrammaField', () => {
  it('starts from the given rows and sends them as JSON', () => {
    const {container} = render(<ProgrammaField name='programma' initial={JSON.stringify([{uur: '14:00', titel: 'Kerstspel'}])} />);
    expect(screen.getByRole('textbox', {name: 'Programmapunt 1: uur'})).toHaveValue('14:00');
    expect(hidden(container)).toEqual([{uur: '14:00', titel: 'Kerstspel', info: ''}]);
  });

  it('adds, edits, moves and removes rows', () => {
    const {container} = render(<ProgrammaField name='programma' />);
    fireEvent.click(screen.getByRole('button', {name: 'Programmapunt toevoegen'}));
    fireEvent.click(screen.getByRole('button', {name: 'Programmapunt toevoegen'}));
    fireEvent.change(screen.getByRole('textbox', {name: 'Programmapunt 1: titel'}), {target: {value: 'Eerst'}});
    fireEvent.change(screen.getByRole('textbox', {name: 'Programmapunt 2: titel'}), {target: {value: 'Daarna'}});

    fireEvent.click(screen.getByRole('button', {name: 'Programmapunt 2 omhoog'}));
    expect(hidden(container)).toEqual([{uur: '', titel: 'Daarna', info: ''}, {uur: '', titel: 'Eerst', info: ''}]);
    expect(screen.getByRole('button', {name: 'Programmapunt 1 omhoog'})).toBeDisabled();

    fireEvent.click(screen.getByRole('button', {name: 'Programmapunt 1 verwijderen'}));
    expect(hidden(container)).toEqual([{uur: '', titel: 'Eerst', info: ''}]);
  });

  it('marks the empty required inputs when the server reports an error', () => {
    render(<ProgrammaField name='programma' initial={JSON.stringify([{uur: '', titel: 'Kerstspel'}])} error='Vul bij elk programmapunt een uur in.' />);
    expect(screen.getByText('Vul bij elk programmapunt een uur in.')).toBeInTheDocument();
    expect(screen.getByRole('textbox', {name: 'Programmapunt 1: uur'})).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('textbox', {name: 'Programmapunt 1: titel'})).not.toHaveAttribute('aria-invalid');
  });

  it('reads only well-formed rows', () => {
    expect(parseRows(undefined)).toEqual([]);
    expect(parseRows('{kapot')).toEqual([]);
    expect(parseRows('"tekst"')).toEqual([]);
    expect(parseRows('[{"uur": 14, "titel": "A"}]')).toEqual([{uur: '', titel: 'A', info: ''}]);
  });
});
