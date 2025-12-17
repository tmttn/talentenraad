import {render, screen, waitFor} from '@testing-library/react';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock AnimatedLink
jest.mock('@components/ui', () => ({
	AnimatedLink: ({href, children}: {href: string; children: React.ReactNode}) => (
		<a href={href}>{children}</a>
	),
}));

// Import component after mock setup
import {CalendarSectionInfo} from '../../../app/features/activities/calendar-section';

const CalendarSection = CalendarSectionInfo.component;

describe('CalendarSection', () => {
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
				titel: 'Event One',
				datum: futureDateString,
				tijd: '14:00',
			},
		},
		{
			id: '2',
			data: {
				titel: 'Event Two',
				datum: futureDate2String,
				tijd: '10:00',
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
		render(<CalendarSection />);

		// Loading skeleton with pulse animation
		expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
	});

	it('renders events after loading', async () => {
		render(<CalendarSection />);

		await waitFor(() => {
			expect(screen.getByText('Event One')).toBeInTheDocument();
		});

		expect(screen.getByText('Event Two')).toBeInTheDocument();
	});

	it('displays time for events', async () => {
		render(<CalendarSection />);

		await waitFor(() => {
			expect(screen.getByText('14:00')).toBeInTheDocument();
		});

		expect(screen.getByText('10:00')).toBeInTheDocument();
	});

	it('shows view all link when showViewAll is true', async () => {
		render(<CalendarSection showViewAll={true} viewAllLink="/kalender" />);

		await waitFor(() => {
			expect(screen.getByText('Event One')).toBeInTheDocument();
		});

		expect(screen.getByRole('link', {name: /Bekijk alle activiteiten/i})).toHaveAttribute('href', '/kalender');
	});

	it('hides view all link when showViewAll is false', async () => {
		render(<CalendarSection showViewAll={false} />);

		await waitFor(() => {
			expect(screen.getByText('Event One')).toBeInTheDocument();
		});

		expect(screen.queryByRole('link', {name: /Bekijk alle activiteiten/i})).not.toBeInTheDocument();
	});

	it('uses custom viewAllLink', async () => {
		render(<CalendarSection showViewAll={true} viewAllLink="/custom-link" />);

		await waitFor(() => {
			expect(screen.getByText('Event One')).toBeInTheDocument();
		});

		expect(screen.getByRole('link', {name: /Bekijk alle activiteiten/i})).toHaveAttribute('href', '/custom-link');
	});

	it('renders event links with correct slug', async () => {
		render(<CalendarSection />);

		await waitFor(() => {
			const link = screen.getByRole('link', {name: /Event One/i});
			expect(link).toHaveAttribute('href', '/activiteiten/event-one');
		});
	});

	it('shows empty state when no events', async () => {
		mockFetch.mockResolvedValue({
			ok: true,
			json: async () => ({results: []}),
		});

		render(<CalendarSection />);

		await waitFor(() => {
			expect(screen.getByText(/Geen activiteiten gepland/)).toBeInTheDocument();
		});
	});

	it('respects limit prop', async () => {
		const manyActivities = Array.from({length: 10}, (_, i) => {
			const date = new Date();
			date.setDate(date.getDate() + i + 1);
			return {
				id: String(i),
				data: {
					titel: `Event ${i + 1}`,
					datum: date.toISOString().split('T')[0],
				},
			};
		});

		mockFetch.mockResolvedValue({
			ok: true,
			json: async () => ({results: manyActivities}),
		});

		render(<CalendarSection limit={3} />);

		await waitFor(() => {
			expect(screen.getByText('Event 1')).toBeInTheDocument();
		});

		expect(screen.getByText('Event 2')).toBeInTheDocument();
		expect(screen.getByText('Event 3')).toBeInTheDocument();
		expect(screen.queryByText('Event 4')).not.toBeInTheDocument();
	});

	it('handles fetch error gracefully', async () => {
		const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
		mockFetch.mockRejectedValue(new Error('Network error'));

		render(<CalendarSection />);

		await waitFor(() => {
			expect(consoleSpy).toHaveBeenCalled();
		});

		consoleSpy.mockRestore();
	});

	it('formats date in Dutch', async () => {
		render(<CalendarSection />);

		await waitFor(() => {
			expect(screen.getByText('Event One')).toBeInTheDocument();
		});

		// Check that the day number is displayed
		const dayNumber = futureDate.getDate();
		expect(screen.getByText(String(dayNumber))).toBeInTheDocument();
	});

	it('only fetches once on mount', async () => {
		render(<CalendarSection />);

		await waitFor(() => {
			expect(screen.getByText('Event One')).toBeInTheDocument();
		});

		// Fetch should only be called once due to hasFetched ref
		expect(mockFetch).toHaveBeenCalledTimes(1);
	});
});

describe('CalendarSectionInfo', () => {
	it('has correct component name', () => {
		expect(CalendarSectionInfo.name).toBe('CalendarSection');
	});

	it('has correct inputs configuration', () => {
		expect(CalendarSectionInfo.inputs).toEqual(
			expect.arrayContaining([
				expect.objectContaining({name: 'limit', type: 'number'}),
				expect.objectContaining({name: 'showViewAll', type: 'boolean'}),
				expect.objectContaining({name: 'viewAllLink', type: 'string'}),
			]),
		);
	});
});
