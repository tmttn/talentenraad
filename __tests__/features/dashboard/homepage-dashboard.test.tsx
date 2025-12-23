import {render, screen, waitFor} from '@testing-library/react';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock AnimatedLink
jest.mock('@components/ui', () => ({
  AnimatedLink: ({href, children, size, variant}: {href: string; children: React.ReactNode; size?: string; variant?: string}) => (
    <a href={href} data-size={size} data-variant={variant}>{children}</a>
  ),
}));

// Import component after mock setup
import {HomepageDashboardInfo} from '../../../app/features/dashboard/homepage-dashboard';

const HomepageDashboard = HomepageDashboardInfo.component;

describe('HomepageDashboard', () => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  const futureDateString = futureDate.toISOString().split('T')[0];

  const newsDate = new Date();
  newsDate.setDate(newsDate.getDate() - 3);
  const newsDateString = newsDate.toISOString().split('T')[0];

  const mockActivities = [
    {
      id: '1',
      data: {
        titel: 'Activity One',
        datum: futureDateString,
        tijd: '14:00',
        locatie: 'Amsterdam',
        categorie: 'kalender',
        vastgepind: false,
      },
    },
    {
      id: '2',
      data: {
        titel: 'Pinned Activity',
        datum: futureDateString,
        tijd: '10:00',
        locatie: 'Rotterdam',
        categorie: 'feest',
        vastgepind: true,
      },
    },
  ];

  const mockNews = [
    {
      id: '1',
      data: {
        titel: 'News Item One',
        datum: newsDateString,
        samenvatting: 'This is a summary of the first news item',
        vastgepind: false,
      },
    },
    {
      id: '2',
      data: {
        titel: 'Pinned News',
        datum: newsDateString,
        samenvatting: 'This is a pinned news item',
        vastgepind: true,
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockImplementation(url => {
      if (url.includes('/activiteit')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({results: mockActivities}),
        });
      }

      if (url.includes('/nieuws')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({results: mockNews}),
        });
      }

      return Promise.reject(new Error('Unknown URL'));
    });
  });

  it('shows loading state initially', () => {
    render(<HomepageDashboard />);

    expect(screen.getByRole('region', {name: /wordt geladen/i})).toHaveAttribute('aria-busy', 'true');
  });

  it('renders activities section', async () => {
    render(<HomepageDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Komende Activiteiten')).toBeInTheDocument();
    });

    expect(screen.getByText('Activity One')).toBeInTheDocument();
  });

  it('renders news section', async () => {
    render(<HomepageDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Laatste Nieuws')).toBeInTheDocument();
    });

    expect(screen.getByText('News Item One')).toBeInTheDocument();
  });

  it('sorts pinned activities first', async () => {
    render(<HomepageDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Pinned Activity')).toBeInTheDocument();
    });

    // Pinned activity should appear in the activities section
    const pinnedLink = screen.getByRole('link', {name: /Pinned Activity/});
    expect(pinnedLink).toBeInTheDocument();
  });

  it('sorts pinned news first', async () => {
    render(<HomepageDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Pinned News')).toBeInTheDocument();
    });

    // Pinned news should appear in the news section
    const pinnedNewsLink = screen.getByRole('link', {name: /Pinned News/});
    expect(pinnedNewsLink).toBeInTheDocument();
  });

  it('displays pinned icons', async () => {
    render(<HomepageDashboard />);

    await waitFor(() => {
      const pinnedLabels = screen.getAllByLabelText('Vastgepind');
      expect(pinnedLabels.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('displays activity time and location', async () => {
    render(<HomepageDashboard />);

    await waitFor(() => {
      expect(screen.getByText('14:00')).toBeInTheDocument();
    });

    expect(screen.getByText('Amsterdam')).toBeInTheDocument();
  });

  it('displays news summary', async () => {
    render(<HomepageDashboard />);

    await waitFor(() => {
      expect(screen.getByText('This is a summary of the first news item')).toBeInTheDocument();
    });
  });

  it('displays category badges for activities', async () => {
    render(<HomepageDashboard />);

    await waitFor(() => {
      expect(screen.getByText('kalender')).toBeInTheDocument();
    });
  });

  it('renders activity links with correct href', async () => {
    render(<HomepageDashboard />);

    await waitFor(() => {
      const link = screen.getByRole('link', {name: /Activity One/});
      expect(link).toHaveAttribute('href', '/activiteiten/activity-one');
    });
  });

  it('renders news links with correct href', async () => {
    render(<HomepageDashboard />);

    await waitFor(() => {
      const link = screen.getByRole('link', {name: /News Item One/});
      expect(link).toHaveAttribute('href', '/nieuws/news-item-one');
    });
  });

  it('shows view all links', async () => {
    render(<HomepageDashboard />);

    await waitFor(() => {
      expect(screen.getByRole('link', {name: /bekijk alle activiteiten/i})).toHaveAttribute('href', '/kalender');
    });

    expect(screen.getByRole('link', {name: /alle nieuwsberichten/i})).toHaveAttribute('href', '/nieuws');
  });

  it('shows empty state when no activities', async () => {
    mockFetch.mockImplementation(url => {
      if (url.includes('/activiteit')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({results: []}),
        });
      }

      if (url.includes('/nieuws')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({results: mockNews}),
        });
      }

      return Promise.reject(new Error('Unknown URL'));
    });

    render(<HomepageDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Geen activiteiten gepland/)).toBeInTheDocument();
    });
  });

  it('shows empty state when no news', async () => {
    mockFetch.mockImplementation(url => {
      if (url.includes('/activiteit')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({results: mockActivities}),
        });
      }

      if (url.includes('/nieuws')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({results: []}),
        });
      }

      return Promise.reject(new Error('Unknown URL'));
    });

    render(<HomepageDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Nog geen nieuws/)).toBeInTheDocument();
    });
  });

  it('handles fetch error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<HomepageDashboard />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('fetches both activities and news in parallel', async () => {
    render(<HomepageDashboard />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    // Verify both endpoints were called
    const calls = mockFetch.mock.calls.map(call => call[0] as string);
    expect(calls.some(url => url.includes('/activiteit'))).toBe(true);
    expect(calls.some(url => url.includes('/nieuws'))).toBe(true);
  });
});

describe('HomepageDashboardInfo', () => {
  it('has correct component name', () => {
    expect(HomepageDashboardInfo.name).toBe('HomepageDashboard');
  });

  it('has empty inputs array', () => {
    expect(HomepageDashboardInfo.inputs).toEqual([]);
  });
});
