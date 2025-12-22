import {render, screen} from '@testing-library/react';
import ActivityDetailPage, {generateMetadata} from '../../../app/(main)/activiteiten/[slug]/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
	notFound: jest.fn(() => {
		throw new Error('NEXT_NOT_FOUND');
	}),
}));

// Mock components
jest.mock('@components/ui', () => ({
	AnimatedButton: ({children, href}: {children: React.ReactNode; href: string}) => (
		<a href={href} data-testid='animated-button'>{children}</a>
	),
	AnimatedLink: ({children, href}: {children: React.ReactNode; href: string}) => (
		<a href={href} data-testid='animated-link'>{children}</a>
	),
	AddToCalendarButton: ({title}: {title: string}) => (
		<button type='button' data-testid='add-to-calendar'>Toevoegen aan agenda voor {title}</button>
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

const mockActivity = {
	id: 'test-activity-id',
	data: {
		titel: 'Test Activiteit',
		datum: '2025-06-15',
		tijd: '14:00',
		locatie: 'Test Locatie',
		samenvatting: 'Test samenvatting van de activiteit',
		inhoud: '<p>Test inhoud van de activiteit</p>',
		categorie: 'feest',
		afbeelding: 'https://example.com/image.jpg',
	},
};

describe('ActivityDetailPage', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders activity details when found', async () => {
		mockFetch.mockResolvedValue({
			json: () => Promise.resolve({results: [mockActivity]}),
		});

		const params = Promise.resolve({slug: 'test-activiteit'});
		render(await ActivityDetailPage({params}));

		expect(screen.getByRole('heading', {level: 1, name: 'Test Activiteit'})).toBeInTheDocument();
		expect(screen.getByText('Test Locatie')).toBeInTheDocument();
		expect(screen.getByText('Test inhoud van de activiteit')).toBeInTheDocument();
	});

	it('renders category badge', async () => {
		mockFetch.mockResolvedValue({
			json: () => Promise.resolve({results: [mockActivity]}),
		});

		const params = Promise.resolve({slug: 'test-activiteit'});
		render(await ActivityDetailPage({params}));

		expect(screen.getByText('feest')).toBeInTheDocument();
	});

	it('renders breadcrumb navigation', async () => {
		mockFetch.mockResolvedValue({
			json: () => Promise.resolve({results: [mockActivity]}),
		});

		const params = Promise.resolve({slug: 'test-activiteit'});
		render(await ActivityDetailPage({params}));

		expect(screen.getByRole('navigation', {name: 'Breadcrumb'})).toBeInTheDocument();
		expect(screen.getByRole('link', {name: 'Home'})).toBeInTheDocument();
		expect(screen.getByRole('link', {name: 'Kalender'})).toBeInTheDocument();
	});

	it('shows contact CTA for future events', async () => {
		const futureActivity = {
			...mockActivity,
			data: {
				...mockActivity.data,
				datum: '2030-12-31', // Far future date
			},
		};
		mockFetch.mockResolvedValue({
			json: () => Promise.resolve({results: [futureActivity]}),
		});

		const params = Promise.resolve({slug: 'test-activiteit'});
		render(await ActivityDetailPage({params}));

		expect(screen.getByText('Contact opnemen')).toBeInTheDocument();
	});

	it('shows "Afgelopen" badge for past events', async () => {
		const pastActivity = {
			...mockActivity,
			data: {
				...mockActivity.data,
				datum: '2020-01-01', // Past date
			},
		};
		mockFetch.mockResolvedValue({
			json: () => Promise.resolve({results: [pastActivity]}),
		});

		const params = Promise.resolve({slug: 'test-activiteit'});
		render(await ActivityDetailPage({params}));

		expect(screen.getByText('Afgelopen')).toBeInTheDocument();
	});

	it('calls notFound when activity is not found', async () => {
		const {notFound} = require('next/navigation');
		mockFetch.mockResolvedValue({
			json: () => Promise.resolve({results: []}),
		});

		const params = Promise.resolve({slug: 'non-existent'});

		await expect(ActivityDetailPage({params})).rejects.toThrow('NEXT_NOT_FOUND');
		expect(notFound).toHaveBeenCalled();
	});

	it('renders image when available', async () => {
		mockFetch.mockResolvedValue({
			json: () => Promise.resolve({results: [mockActivity]}),
		});

		const params = Promise.resolve({slug: 'test-activiteit'});
		render(await ActivityDetailPage({params}));

		const image = screen.getByRole('img', {name: 'Test Activiteit'});
		expect(image).toBeInTheDocument();
	});

	it('renders without image when not available', async () => {
		const activityWithoutImage = {
			...mockActivity,
			data: {
				...mockActivity.data,
				afbeelding: undefined,
			},
		};
		mockFetch.mockResolvedValue({
			json: () => Promise.resolve({results: [activityWithoutImage]}),
		});

		const params = Promise.resolve({slug: 'test-activiteit'});
		render(await ActivityDetailPage({params}));

		expect(screen.queryByRole('img', {name: 'Test Activiteit'})).not.toBeInTheDocument();
	});
});

describe('generateMetadata', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('returns activity title and description', async () => {
		mockFetch.mockResolvedValue({
			json: () => Promise.resolve({results: [mockActivity]}),
		});

		const params = Promise.resolve({slug: 'test-activiteit'});
		const metadata = await generateMetadata({params});

		expect(metadata.title).toBe('Test Activiteit | Talentenraad');
		expect(metadata.description).toBe('Test samenvatting van de activiteit');
	});

	it('returns fallback title when activity not found', async () => {
		mockFetch.mockResolvedValue({
			json: () => Promise.resolve({results: []}),
		});

		const params = Promise.resolve({slug: 'non-existent'});
		const metadata = await generateMetadata({params});

		expect(metadata.title).toBe('Activiteit niet gevonden');
	});

	it('uses date in description when no samenvatting', async () => {
		const activityWithoutDescription = {
			...mockActivity,
			data: {
				...mockActivity.data,
				samenvatting: undefined,
			},
		};
		mockFetch.mockResolvedValue({
			json: () => Promise.resolve({results: [activityWithoutDescription]}),
		});

		const params = Promise.resolve({slug: 'test-activiteit'});
		const metadata = await generateMetadata({params});

		expect(metadata.description).toContain('Activiteit op');
	});
});
