import {render, screen} from '@testing-library/react';
import {ActivitiesList} from '../../../app/features/activities/activities-list';
import {makeActiviteit} from '../../fixtures/content';

const activiteiten = [
  makeActiviteit({titel: 'Voorbij', slug: 'voorbij', datum: '2025-02-28'}),
  makeActiviteit({
    titel: 'Vandaag', slug: 'vandaag', datum: '2025-03-01', categorie: 'kalender',
  }),
  makeActiviteit({
    titel: 'Later', slug: 'later', datum: '2025-04-20', categorie: 'activiteit',
  }),
  makeActiviteit({
    titel: 'Eerst', slug: 'eerst', datum: '2025-03-05', samenvatting: 'x'.repeat(200),
  }),
];

describe('ActivitiesList', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 2, 1, 12));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows only upcoming activities (today counts), earliest first', () => {
    render(<ActivitiesList activiteiten={activiteiten} />);
    const titles = screen.getAllByRole('heading', {level: 3}).map(heading => heading.textContent);
    expect(titles).toEqual(['Vandaag', 'Eerst', 'Later']);
    expect(screen.queryByText('Voorbij')).not.toBeInTheDocument();
  });

  it('respects the limit', () => {
    render(<ActivitiesList activiteiten={activiteiten} limit={2} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('links to the item slug', () => {
    render(<ActivitiesList activiteiten={activiteiten} />);
    expect(screen.getByRole('link', {name: /Later/})).toHaveAttribute('href', '/activiteiten/later');
  });

  it('formats the date in Dutch', () => {
    render(<ActivitiesList activiteiten={[makeActiviteit({datum: '2025-03-05'})]} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('MRT')).toBeInTheDocument();
  });

  it('shows time and location, and hides location when asked', () => {
    const {rerender} = render(<ActivitiesList activiteiten={activiteiten} />);
    expect(screen.getAllByText('14:00').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Voorbeeldzaal').length).toBeGreaterThan(0);
    rerender(<ActivitiesList activiteiten={activiteiten} showLocation={false} />);
    expect(screen.queryByText('Voorbeeldzaal')).not.toBeInTheDocument();
  });

  it('shows a truncated description only when asked', () => {
    const {rerender} = render(<ActivitiesList activiteiten={activiteiten} />);
    expect(screen.queryByText(/^x+\.\.\.$/)).not.toBeInTheDocument();
    rerender(<ActivitiesList activiteiten={activiteiten} showDescription />);
    expect(screen.getByText(`${'x'.repeat(150)}...`)).toBeInTheDocument();
  });

  it('shows a view-all link unless disabled', () => {
    const {rerender} = render(<ActivitiesList activiteiten={activiteiten} />);
    expect(screen.getByRole('link', {name: /Bekijk alle activiteiten/})).toHaveAttribute('href', '/kalender');
    rerender(<ActivitiesList activiteiten={activiteiten} showViewAll={false} />);
    expect(screen.queryByText(/Bekijk alle activiteiten/)).not.toBeInTheDocument();
  });

  it('renders category badges', () => {
    render(<ActivitiesList activiteiten={activiteiten} />);
    expect(screen.getByText('kalender')).toHaveClass('bg-category-calendar-bg');
    expect(screen.getByText('activiteit')).toHaveClass('bg-category-activity-bg');
    expect(screen.getByText('feest')).toHaveClass('bg-category-event-bg');
  });

  it('shows the empty state for an empty list', () => {
    render(<ActivitiesList activiteiten={[]} />);
    expect(screen.getByText('Nog geen activiteiten gepland')).toBeInTheDocument();
    expect(screen.queryByText(/Bekijk alle activiteiten/)).not.toBeInTheDocument();
  });

  it('shows the empty state when everything is in the past', () => {
    render(<ActivitiesList activiteiten={[activiteiten[0]]} />);
    expect(screen.getByText('Nog geen activiteiten gepland')).toBeInTheDocument();
  });

});
