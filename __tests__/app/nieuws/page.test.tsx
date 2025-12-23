import {render, screen} from '@testing-library/react';
import NewsDetailPage, {generateMetadata} from '../../../app/(main)/nieuws/[slug]/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

// Mock components
jest.mock('@components/ui', () => ({
  AnimatedLink: ({children, href}: {children: React.ReactNode; href: string}) => (
    <a href={href} data-testid='animated-link'>{children}</a>
  ),
}));

jest.mock('@components/layout/page-with-announcements', () => ({
  PageWithAnnouncements: ({children}: {children: React.ReactNode}) => (
    <div data-testid='page-with-announcements'>{children}</div>
  ),
}));

// Mock flags
jest.mock('@/lib/flags', () => ({
  clapsButton: jest.fn().mockResolvedValue(true),
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockNewsItem = {
  id: 'test-news-id',
  data: {
    titel: 'Test Nieuwsbericht',
    datum: '2025-03-15',
    samenvatting: 'Dit is een samenvatting van het nieuwsbericht',
    inhoud: '<p>Dit is de volledige inhoud van het nieuwsbericht.</p>',
    afbeelding: 'https://example.com/news-image.jpg',
  },
};

describe('NewsDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders news item details when found', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({results: [mockNewsItem]}),
    });

    const params = Promise.resolve({slug: 'test-nieuwsbericht'});
    render(await NewsDetailPage({params}));

    expect(screen.getByRole('heading', {level: 1, name: 'Test Nieuwsbericht'})).toBeInTheDocument();
    expect(screen.getByText('Dit is een samenvatting van het nieuwsbericht')).toBeInTheDocument();
  });

  it('renders breadcrumb navigation', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({results: [mockNewsItem]}),
    });

    const params = Promise.resolve({slug: 'test-nieuwsbericht'});
    render(await NewsDetailPage({params}));

    expect(screen.getByRole('navigation', {name: 'Breadcrumb'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Home'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Nieuws'})).toBeInTheDocument();
  });

  it('renders back link', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({results: [mockNewsItem]}),
    });

    const params = Promise.resolve({slug: 'test-nieuwsbericht'});
    render(await NewsDetailPage({params}));

    expect(screen.getByText('Terug naar nieuws')).toBeInTheDocument();
  });

  it('calls notFound when news item is not found', async () => {
    const {notFound} = require('next/navigation');
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({results: []}),
    });

    const params = Promise.resolve({slug: 'non-existent'});

    await expect(NewsDetailPage({params})).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });

  it('renders image when available', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({results: [mockNewsItem]}),
    });

    const params = Promise.resolve({slug: 'test-nieuwsbericht'});
    render(await NewsDetailPage({params}));

    const image = screen.getByRole('img', {name: 'Test Nieuwsbericht'});
    expect(image).toBeInTheDocument();
  });

  it('renders without image when not available', async () => {
    const newsWithoutImage = {
      ...mockNewsItem,
      data: {
        ...mockNewsItem.data,
        afbeelding: undefined,
      },
    };
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({results: [newsWithoutImage]}),
    });

    const params = Promise.resolve({slug: 'test-nieuwsbericht'});
    render(await NewsDetailPage({params}));

    expect(screen.queryByRole('img', {name: 'Test Nieuwsbericht'})).not.toBeInTheDocument();
  });

  it('renders HTML content', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({results: [mockNewsItem]}),
    });

    const params = Promise.resolve({slug: 'test-nieuwsbericht'});
    render(await NewsDetailPage({params}));

    expect(screen.getByText('Dit is de volledige inhoud van het nieuwsbericht.')).toBeInTheDocument();
  });

  it('renders without content when not available', async () => {
    const newsWithoutContent = {
      ...mockNewsItem,
      data: {
        ...mockNewsItem.data,
        inhoud: undefined,
      },
    };
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({results: [newsWithoutContent]}),
    });

    const params = Promise.resolve({slug: 'test-nieuwsbericht'});
    const {container} = render(await NewsDetailPage({params}));

    expect(container.querySelector('.prose')).not.toBeInTheDocument();
  });

  it('finds news item by slug generated from title', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({results: [mockNewsItem]}),
    });

    const params = Promise.resolve({slug: 'test-nieuwsbericht'});
    render(await NewsDetailPage({params}));

    expect(screen.getByRole('heading', {level: 1, name: 'Test Nieuwsbericht'})).toBeInTheDocument();
  });

  it('finds news item by id', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({results: [mockNewsItem]}),
    });

    const params = Promise.resolve({slug: 'test-news-id'});
    render(await NewsDetailPage({params}));

    expect(screen.getByRole('heading', {level: 1, name: 'Test Nieuwsbericht'})).toBeInTheDocument();
  });
});

describe('generateMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns news item title and description', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({results: [mockNewsItem]}),
    });

    const params = Promise.resolve({slug: 'test-nieuwsbericht'});
    const metadata = await generateMetadata({params});

    expect(metadata.title).toBe('Test Nieuwsbericht | Talentenraad');
    expect(metadata.description).toBe('Dit is een samenvatting van het nieuwsbericht');
  });

  it('returns fallback title when news item not found', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({results: []}),
    });

    const params = Promise.resolve({slug: 'non-existent'});
    const metadata = await generateMetadata({params});

    expect(metadata.title).toBe('Nieuws niet gevonden');
  });
});
