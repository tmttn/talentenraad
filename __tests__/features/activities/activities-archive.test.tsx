import {fireEvent, render, screen} from '@testing-library/react';
import {ActivitiesArchive, ActivitiesArchiveInfo} from '../../../app/features/activities/activities-archive';
import {makeActiviteit} from '../../fixtures/content';

const activiteiten = [
  makeActiviteit({titel: 'Oud', slug: 'oud', datum: '2023-11-02'}),
  makeActiviteit({
    titel: 'Recent', slug: 'recent', datum: '2025-02-28', categorie: 'kalender',
  }),
  makeActiviteit({titel: 'Midden', slug: 'midden', datum: '2024-05-01'}),
  makeActiviteit({titel: 'Vandaag', slug: 'vandaag', datum: '2025-03-01'}),
  makeActiviteit({titel: 'Toekomst', slug: 'toekomst', datum: '2025-09-01'}),
];

const renderArchive = (props: Partial<Parameters<typeof ActivitiesArchive>[0]> = {}) => render(
  <ActivitiesArchive activiteiten={activiteiten} title='Archief' subtitle='Voorbije activiteiten' {...props} />,
);

describe('ActivitiesArchive', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 2, 1, 12));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows only past activities, newest first, with title and count', () => {
    renderArchive();
    expect(screen.getByText('Archief')).toBeInTheDocument();
    expect(screen.getByText('(3 activiteiten)')).toBeInTheDocument();
    const titles = screen.getAllByRole('heading', {level: 4}).map(heading => heading.textContent);
    expect(titles).toEqual(['Recent', 'Midden', 'Oud']);
    expect(screen.queryByText('Vandaag')).not.toBeInTheDocument();
    expect(screen.queryByText('Toekomst')).not.toBeInTheDocument();
  });

  it('exposes the subtitle to assistive tech', () => {
    renderArchive();
    expect(screen.getByRole('button', {description: 'Voorbije activiteiten'})).toBeInTheDocument();
  });

  it('toggles expansion', () => {
    renderArchive();
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('groups by year, newest year first', () => {
    renderArchive();
    const years = screen.getAllByRole('heading', {level: 3}).map(heading => heading.textContent);
    // each heading starts with the per-year count badge
    expect(years).toEqual(['12025', '12024', '12023']);
  });

  it('links to the slug and shows location and category', () => {
    renderArchive();
    expect(screen.getByRole('link', {name: /Recent/})).toHaveAttribute('href', '/activiteiten/recent');
    expect(screen.getAllByText(/Voorbeeldzaal/).length).toBeGreaterThan(0);
    expect(screen.getByText('kalender')).toHaveClass('bg-blue-100');
  });

  it('respects the limit', () => {
    renderArchive({limit: 1});
    expect(screen.getByText('(1 activiteiten)')).toBeInTheDocument();
  });

  it('hides the year in dates when showYear is false', () => {
    renderArchive({showYear: false});
    expect(screen.getByText(/^28 februari/)).toBeInTheDocument();
    expect(screen.queryByText(/28 februari 2025/)).not.toBeInTheDocument();
  });

  it('renders nothing without past activities', () => {
    const {container} = renderArchive({activiteiten: [activiteiten[3], activiteiten[4]]});
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing for an empty list', () => {
    const {container} = renderArchive({activiteiten: []});
    expect(container).toBeEmptyDOMElement();
  });

  it('exports builder info', () => {
    expect(ActivitiesArchiveInfo.name).toBe('ActivitiesArchive');
  });
});
