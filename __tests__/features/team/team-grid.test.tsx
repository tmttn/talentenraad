import {render, screen} from '@testing-library/react';
import {TeamGrid, TeamGridInfo} from '../../../app/features/team/team-grid';
import {makeTeamlid} from '../../fixtures/content';

const leden = [
  makeTeamlid(),
  makeTeamlid({
    naam: 'Piet Proef', rol: 'Lid', slug: 'piet-proef', html: '<p>Fictieve bio</p>',
  }),
];

describe('TeamGrid', () => {
  it('renders names, roles and initials', () => {
    render(<TeamGrid leden={leden} columns={3} showDescription />);
    expect(screen.getByRole('heading', {level: 3, name: 'Jan Voorbeeld'})).toBeInTheDocument();
    expect(screen.getByText('Voorzitter')).toBeInTheDocument();
    expect(screen.getByText('JV')).toBeInTheDocument();
    expect(screen.getByText('PP')).toBeInTheDocument();
  });

  it('shows descriptions only when asked', () => {
    const {rerender} = render(<TeamGrid leden={leden} columns={3} showDescription />);
    expect(screen.getByText('Fictieve bio')).toBeInTheDocument();
    rerender(<TeamGrid leden={leden} columns={3} showDescription={false} />);
    expect(screen.queryByText('Fictieve bio')).not.toBeInTheDocument();
  });

  it('keeps the order it is given', () => {
    render(<TeamGrid leden={[...leden].reverse()} columns={3} showDescription={false} />);
    const names = screen.getAllByRole('heading', {level: 3}).map(heading => heading.textContent);
    expect(names).toEqual(['Piet Proef', 'Jan Voorbeeld']);
  });

  it('uses 3 or 4 columns on large screens', () => {
    const {container, rerender} = render(<TeamGrid leden={leden} columns={3} showDescription />);
    expect(container.querySelector('.lg\\:grid-cols-3')).toBeInTheDocument();
    rerender(<TeamGrid leden={leden} columns={4} showDescription />);
    expect(container.querySelector('.lg\\:grid-cols-4')).toBeInTheDocument();
  });

  it('shows the empty state for an empty list', () => {
    render(<TeamGrid leden={[]} columns={3} showDescription />);
    expect(screen.getByText('Geen teamleden gevonden')).toBeInTheDocument();
  });

  it('exports builder info', () => {
    expect(TeamGridInfo.name).toBe('TeamGrid');
  });
});
