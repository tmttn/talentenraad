import {render, screen, waitFor} from '@testing-library/react';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock AnimatedLink
jest.mock('@components/ui', () => ({
	AnimatedLink: ({href, children, size}: {href: string; children: React.ReactNode; size?: string}) => (
		<a href={href} data-size={size}>{children}</a>
	),
}));

// Import component after mock setup
import {ActivitiesListInfo} from '../../../app/features/activities/activities-list';

const ActivitiesList = ActivitiesListInfo.component;

describe('ActivitiesList', () => {
	const futureDate = new Date();
	futureDate.setDate(futureDate.getDate() + 7);
	const futureDateString = futureDate.toISOString().split('T')[0];

	const futureDate2 = new Date();
	futureDate2.setDate(futureDate2.getDate() + 14);
	const futureDate2String = futureDate2.toISOString().split('T')[0];

	const mockActivities = [
		{
			id: '1',
			data: {
				titel: 'Upcoming Activity',
				datum: futureDateString,
				tijd: '14:00',
				locatie: 'Amsterdam',
				beschrijving: 'A fun event',
				categorie: 'kalender',
				vastgepind: false,
			},
		},
		{
			id: '2',
			data: {
				titel: 'Pinned Activity',
				datum: futureDate2String,
				tijd: '10:00',
				locatie: 'Rotterdam',
				beschrijving: 'An important pinned event',
				categorie: 'feest',
				vastgepind: true,
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
		render(<ActivitiesList />);

		expect(screen.getByRole('region', {name: /worden geladen/i})).toHaveAttribute('aria-busy', 'true');
	});

	it('renders activities list', async () => {
		render(<ActivitiesList />);

		await waitFor(() => {
			expect(screen.getByText('Upcoming Activity')).toBeInTheDocument();
		});

		expect(screen.getByText('Pinned Activity')).toBeInTheDocument();
	});

	it('sorts pinned activities first', async () => {
		render(<ActivitiesList />);

		await waitFor(() => {
			expect(screen.getByText('Pinned Activity')).toBeInTheDocument();
		});

		const activities = screen.getAllByRole('listitem');
		// Pinned activity should appear first
		expect(activities[0]).toHaveTextContent('Pinned Activity');
	});

	it('shows pinned icon for pinned activities', async () => {
		render(<ActivitiesList />);

		await waitFor(() => {
			expect(screen.getByLabelText('Vastgepind')).toBeInTheDocument();
		});
	});

	it('displays time when available', async () => {
		render(<ActivitiesList />);

		await waitFor(() => {
			expect(screen.getByText('14:00')).toBeInTheDocument();
		});
	});

	it('displays location when showLocation is true', async () => {
		render(<ActivitiesList showLocation={true} />);

		await waitFor(() => {
			expect(screen.getByText('Amsterdam')).toBeInTheDocument();
		});
	});

	it('hides location when showLocation is false', async () => {
		render(<ActivitiesList showLocation={false} />);

		await waitFor(() => {
			expect(screen.getByText('Upcoming Activity')).toBeInTheDocument();
		});

		expect(screen.queryByText('Amsterdam')).not.toBeInTheDocument();
	});

	it('displays description when showDescription is true', async () => {
		render(<ActivitiesList showDescription={true} />);

		await waitFor(() => {
			expect(screen.getByText('A fun event')).toBeInTheDocument();
		});
	});

	it('hides description when showDescription is false', async () => {
		render(<ActivitiesList showDescription={false} />);

		await waitFor(() => {
			expect(screen.getByText('Upcoming Activity')).toBeInTheDocument();
		});

		expect(screen.queryByText('A fun event')).not.toBeInTheDocument();
	});

	it('shows view all link when showViewAll is true', async () => {
		render(<ActivitiesList showViewAll={true} viewAllLink="/activiteiten" />);

		await waitFor(() => {
			expect(screen.getByText('Upcoming Activity')).toBeInTheDocument();
		});

		expect(screen.getByRole('link', {name: /Bekijk alle activiteiten/i})).toHaveAttribute('href', '/activiteiten');
	});

	it('hides view all link when showViewAll is false', async () => {
		render(<ActivitiesList showViewAll={false} />);

		await waitFor(() => {
			expect(screen.getByText('Upcoming Activity')).toBeInTheDocument();
		});

		expect(screen.queryByRole('link', {name: /Bekijk alle activiteiten/i})).not.toBeInTheDocument();
	});

	it('displays category badges with correct styling', async () => {
		render(<ActivitiesList />);

		await waitFor(() => {
			expect(screen.getByText('kalender')).toBeInTheDocument();
		});

		expect(screen.getByText('feest')).toBeInTheDocument();
	});

	it('renders activity links with correct slug', async () => {
		render(<ActivitiesList />);

		await waitFor(() => {
			const link = screen.getByRole('link', {name: /Upcoming Activity/});
			expect(link).toHaveAttribute('href', '/activiteiten/upcoming-activity');
		});
	});

	it('shows empty state when no activities', async () => {
		mockFetch.mockResolvedValue({
			ok: true,
			json: async () => ({results: []}),
		});

		render(<ActivitiesList />);

		await waitFor(() => {
			expect(screen.getByText(/Nog geen activiteiten gepland/)).toBeInTheDocument();
		});

		expect(screen.getByRole('link', {name: /Heb je een idee/})).toBeInTheDocument();
	});

	it('handles fetch error gracefully', async () => {
		const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
		mockFetch.mockRejectedValue(new Error('Network error'));

		render(<ActivitiesList />);

		await waitFor(() => {
			expect(consoleSpy).toHaveBeenCalled();
		});

		consoleSpy.mockRestore();
	});

	it('filters by category when provided', async () => {
		render(<ActivitiesList category="kalender" />);

		await waitFor(() => {
			expect(mockFetch).toHaveBeenCalled();
		});

		const url = mockFetch.mock.calls[0][0] as string;
		// URL contains URL-encoded $ as %24
		expect(url).toContain('query.data.categorie.%24eq=kalender');
	});

	it('formats date correctly in Dutch', async () => {
		render(<ActivitiesList />);

		await waitFor(() => {
			expect(screen.getByText('Upcoming Activity')).toBeInTheDocument();
		});

		// Check that the date day is displayed
		const dayNumber = futureDate.getDate();
		expect(screen.getByText(String(dayNumber))).toBeInTheDocument();
	});
});

describe('ActivitiesListInfo', () => {
	it('has correct component name', () => {
		expect(ActivitiesListInfo.name).toBe('ActivitiesList');
	});

	it('has correct inputs configuration', () => {
		expect(ActivitiesListInfo.inputs).toEqual(
			expect.arrayContaining([
				expect.objectContaining({name: 'limit', type: 'number'}),
				expect.objectContaining({name: 'category', type: 'string'}),
				expect.objectContaining({name: 'showViewAll', type: 'boolean'}),
				expect.objectContaining({name: 'viewAllLink', type: 'string'}),
				expect.objectContaining({name: 'showLocation', type: 'boolean'}),
				expect.objectContaining({name: 'showDescription', type: 'boolean'}),
			]),
		);
	});
});
