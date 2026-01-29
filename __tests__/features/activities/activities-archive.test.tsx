import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Import component after mock setup
import {ActivitiesArchiveInfo} from '../../../app/features/activities/activities-archive';

const ActivitiesArchive = ActivitiesArchiveInfo.component;

describe('ActivitiesArchive', () => {
  // Use a date guaranteed to be in the current year
  const pastDate = new Date(new Date().getFullYear(), 0, 2);
  const pastDateString = pastDate.toISOString().split('T')[0];

  const pastDate2 = new Date();
  pastDate2.setFullYear(pastDate2.getFullYear() - 1);
  const pastDate2String = pastDate2.toISOString().split('T')[0];

  const mockActivities = [
    {
      id: '1',
      data: {
        titel: 'Past Activity 1',
        datum: pastDateString,
        tijd: '14:00',
        locatie: 'Amsterdam',
        samenvatting: 'A past event',
        categorie: 'kalender',
      },
    },
    {
      id: '2',
      data: {
        titel: 'Past Activity 2',
        datum: pastDate2String,
        tijd: '10:00',
        locatie: 'Rotterdam',
        samenvatting: 'Another past event',
        categorie: 'feest',
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({results: mockActivities}),
    });
  });

  it('shows loading state initially', () => {
    render(<ActivitiesArchive />);

    // The section has aria-busy="true" during loading
    const section = document.querySelector('section[aria-busy="true"]');
    expect(section).toBeInTheDocument();
  });

  it('renders archive section with toggle button', async () => {
    render(<ActivitiesArchive />);

    await waitFor(() => {
      expect(screen.getByRole('button', {name: /archief/i})).toBeInTheDocument();
    });

    expect(screen.getByText(/2 activiteiten/)).toBeInTheDocument();
  });

  it('expands archive when button is clicked', async () => {
    const user = userEvent.setup();
    render(<ActivitiesArchive />);

    await waitFor(() => {
      expect(screen.getByRole('button', {name: /archief/i})).toBeInTheDocument();
    });

    const toggleButton = screen.getByRole('button', {name: /archief/i});
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggleButton);

    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Past Activity 1')).toBeInTheDocument();
  });

  it('collapses archive when button is clicked again', async () => {
    const user = userEvent.setup();
    render(<ActivitiesArchive />);

    await waitFor(() => {
      expect(screen.getByRole('button', {name: /archief/i})).toBeInTheDocument();
    });

    const toggleButton = screen.getByRole('button', {name: /archief/i});

    // Expand
    await user.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

    // Collapse
    await user.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('groups activities by year', async () => {
    const user = userEvent.setup();
    render(<ActivitiesArchive />);

    await waitFor(() => {
      expect(screen.getByRole('button', {name: /archief/i})).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', {name: /archief/i}));

    // Should show year headings
    const currentYear = new Date().getFullYear().toString();
    const lastYear = (new Date().getFullYear() - 1).toString();

    expect(screen.getByRole('heading', {name: new RegExp(currentYear)})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: new RegExp(lastYear)})).toBeInTheDocument();
  });

  it('renders activity links with correct href', async () => {
    const user = userEvent.setup();
    render(<ActivitiesArchive />);

    await waitFor(() => {
      expect(screen.getByRole('button', {name: /archief/i})).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', {name: /archief/i}));

    const link = screen.getByRole('link', {name: /Past Activity 1/});
    expect(link).toHaveAttribute('href', '/activiteiten/past-activity-1');
  });

  it('displays category badges', async () => {
    const user = userEvent.setup();
    render(<ActivitiesArchive />);

    await waitFor(() => {
      expect(screen.getByRole('button', {name: /archief/i})).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', {name: /archief/i}));

    expect(screen.getByText('kalender')).toBeInTheDocument();
    expect(screen.getByText('feest')).toBeInTheDocument();
  });

  it('displays location when available', async () => {
    const user = userEvent.setup();
    render(<ActivitiesArchive />);

    await waitFor(() => {
      expect(screen.getByRole('button', {name: /archief/i})).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', {name: /archief/i}));

    expect(screen.getByText(/Amsterdam/)).toBeInTheDocument();
  });

  it('returns null when no past activities', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [{
          id: '1',
          data: {
            titel: 'Future Event',
            datum: futureDate.toISOString().split('T')[0],
            categorie: 'kalender',
          },
        }],
      }),
    });

    const {container} = render(<ActivitiesArchive />);

    await waitFor(() => {
      // Component should render nothing (null)
      expect(container.querySelector('section')?.getAttribute('aria-busy')).not.toBe('true');
    });
  });

  it('handles fetch error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockFetch.mockRejectedValue(new Error('Network error'));

    const {container} = render(<ActivitiesArchive />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('respects limit prop', async () => {
    const manyActivities = Array.from({length: 30}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (i + 1));
      return {
        id: String(i),
        data: {
          titel: `Activity ${i}`,
          datum: date.toISOString().split('T')[0],
          categorie: 'kalender',
        },
      };
    });

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({results: manyActivities}),
    });

    render(<ActivitiesArchive limit={5} />);

    await waitFor(() => {
      expect(screen.getByText(/5 activiteiten/)).toBeInTheDocument();
    });
  });
});

describe('ActivitiesArchiveInfo', () => {
  it('has correct component name', () => {
    expect(ActivitiesArchiveInfo.name).toBe('ActivitiesArchive');
  });

  it('has correct inputs configuration', () => {
    expect(ActivitiesArchiveInfo.inputs).toEqual(expect.arrayContaining([
      expect.objectContaining({name: 'limit', type: 'number'}),
      expect.objectContaining({name: 'showYear', type: 'boolean'}),
    ]));
  });
});
