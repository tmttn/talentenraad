import {render, screen} from '@testing-library/react';
import {NewsList} from '../../../app/features/news/news-list';
import {makeNieuws} from '../../fixtures/content';

const nieuws = [
  makeNieuws({titel: 'Oud bericht', slug: 'oud-bericht', datum: '2024-01-05'}),
  makeNieuws({titel: 'Nieuw bericht', slug: 'nieuw-bericht', datum: '2025-03-01'}),
  makeNieuws({
    titel: 'Met beeld',
    slug: 'met-beeld',
    datum: '2024-06-01',
    afbeelding: {src: '/content/nieuws/met-beeld/foto.png', width: 800, height: 600},
  }),
];

describe('NewsList', () => {
  it('renders items newest first', () => {
    render(<NewsList nieuws={nieuws} />);
    const titles = screen.getAllByRole('heading', {level: 3}).map(heading => heading.textContent);
    expect(titles).toEqual(['Nieuw bericht', 'Met beeld', 'Oud bericht']);
  });

  it('respects the limit', () => {
    render(<NewsList nieuws={nieuws} limit={1} />);
    expect(screen.getAllByRole('article')).toHaveLength(1);
  });

  it('links to the slug and shows summary and Dutch date', () => {
    render(<NewsList nieuws={nieuws} />);
    expect(screen.getByRole('link', {name: /Nieuw bericht/})).toHaveAttribute('href', '/nieuws/nieuw-bericht');
    expect(screen.getAllByText('Een fictieve samenvatting van het bericht.')).toHaveLength(3);
    expect(screen.getByText('1 maart 2025')).toBeInTheDocument();
  });

  it('uses the list layout by default without images', () => {
    const {container} = render(<NewsList nieuws={nieuws} />);
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.querySelector('.border-l-4')).toBeInTheDocument();
  });

  it('renders the grid layout with images', () => {
    const {container} = render(<NewsList nieuws={nieuws} layout='grid' />);
    expect(container.querySelector('.border-l-4')).not.toBeInTheDocument();
    expect(container.querySelectorAll('img')).toHaveLength(1);
  });

  it('hides images when showImages is false', () => {
    const {container} = render(<NewsList nieuws={nieuws} layout='grid' showImages={false} />);
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  it('shows the empty state for an empty list', () => {
    render(<NewsList nieuws={[]} />);
    expect(screen.getByText('Nog geen nieuwsberichten')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /Facebook/})).toBeInTheDocument();
  });

});
