import {render, screen} from '@testing-library/react';
import {HomepageDashboard} from '../../../app/features/dashboard/homepage-dashboard';
import {makeActiviteit, makeNieuws} from '../../fixtures/content';

const activiteiten = [
  makeActiviteit({titel: 'Voorbij', slug: 'voorbij', datum: '2025-01-01'}),
  makeActiviteit({
    titel: 'Tweede', slug: 'tweede', datum: '2025-04-01', categorie: 'kalender',
  }),
  makeActiviteit({titel: 'Eerste', slug: 'eerste', datum: '2025-03-10'}),
  makeActiviteit({titel: 'Derde', slug: 'derde', datum: '2025-05-01'}),
  makeActiviteit({titel: 'Vierde', slug: 'vierde', datum: '2025-06-01'}),
];

const nieuws = [
  makeNieuws({titel: 'N1', slug: 'n1', datum: '2024-01-01'}),
  makeNieuws({titel: 'N2', slug: 'n2', datum: '2025-02-01'}),
  makeNieuws({titel: 'N3', slug: 'n3', datum: '2024-06-01'}),
  makeNieuws({titel: 'N4', slug: 'n4', datum: '2023-06-01'}),
];

describe('HomepageDashboard', () => {
  it('shows the three next upcoming activities in date order', () => {
    render(<HomepageDashboard today='2025-03-01' activiteiten={activiteiten} nieuws={nieuws} />);
    expect(screen.getByText('Komende Activiteiten')).toBeInTheDocument();
    const titles = screen.getAllByRole('heading', {level: 4}).map(heading => heading.textContent);
    expect(titles.slice(0, 3)).toEqual(['Eerste', 'Tweede', 'Derde']);
    expect(screen.queryByText('Voorbij')).not.toBeInTheDocument();
    expect(screen.queryByText('Vierde')).not.toBeInTheDocument();
  });

  it('shows the three newest news items', () => {
    render(<HomepageDashboard today='2025-03-01' activiteiten={activiteiten} nieuws={nieuws} />);
    expect(screen.getByText('Laatste Nieuws')).toBeInTheDocument();
    expect(screen.getByText('N2')).toBeInTheDocument();
    expect(screen.getByText('N3')).toBeInTheDocument();
    expect(screen.getByText('N1')).toBeInTheDocument();
    expect(screen.queryByText('N4')).not.toBeInTheDocument();
  });

  it('links to slugs and shows time, location, category and summary', () => {
    render(<HomepageDashboard today='2025-03-01' activiteiten={activiteiten} nieuws={nieuws} />);
    expect(screen.getByRole('link', {name: /Eerste/})).toHaveAttribute('href', '/activiteiten/eerste');
    expect(screen.getByRole('link', {name: /N2/})).toHaveAttribute('href', '/nieuws/n2');
    expect(screen.getAllByText('14:00').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Voorbeeldzaal').length).toBeGreaterThan(0);
    expect(screen.getByText('kalender')).toHaveClass('bg-category-calendar-bg');
    expect(screen.getAllByText('Een fictieve samenvatting van het bericht.')).toHaveLength(3);
    expect(screen.getByText('1 februari 2025')).toBeInTheDocument();
  });

  it('shows view-all links', () => {
    render(<HomepageDashboard today='2025-03-01' activiteiten={activiteiten} nieuws={nieuws} />);
    expect(screen.getByRole('link', {name: /Bekijk alle activiteiten/})).toHaveAttribute('href', '/kalender');
    expect(screen.getByRole('link', {name: /Alle nieuwsberichten/})).toHaveAttribute('href', '/nieuws');
  });

  it('shows empty states without crashing', () => {
    render(<HomepageDashboard today='2025-03-01' activiteiten={[]} nieuws={[]} />);
    expect(screen.getByText('Geen activiteiten gepland')).toBeInTheDocument();
    expect(screen.getByText('Nog geen nieuws')).toBeInTheDocument();
  });

});
