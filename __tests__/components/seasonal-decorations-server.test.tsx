import {render, screen} from '@testing-library/react';
import {SeasonalDecorationsServer, getSeasonalDecorationsConfig} from '../../app/components/seasonal-decorations-server';

// Mock the database module
jest.mock('@/lib/db', () => ({
	db: {
		query: {
			siteSettings: {
				findFirst: jest.fn(),
			},
		},
	},
	siteSettings: {key: 'key'},
}));

// Mock drizzle-orm
jest.mock('drizzle-orm', () => ({
	eq: jest.fn((a, b) => ({a, b})),
}));

// Mock child components
jest.mock('../../app/components/seasonal-decorations-context', () => ({
	SeasonalDecorationsProvider: ({children, config}: {children: React.ReactNode; config: unknown}) => (
		<div data-testid="decorations-provider" data-config={JSON.stringify(config)}>
			{children}
		</div>
	),
}));

jest.mock('../../app/components/seasonal-decorations', () => ({
	Snowfall: () => <div data-testid="snowfall">Snowfall</div>,
	SeasonalStyles: () => <style data-testid="seasonal-styles" />,
	defaultSeasonalConfig: {
		enabled: false,
		season: 'none',
		decorations: {
			christmasLights: false,
			snowfall: false,
			icicles: false,
			gingerbreadMan: false,
			christmasBalls: false,
		},
	},
}));

// Import the mocked db
import {db} from '@/lib/db';
const mockFindFirst = db.query.siteSettings.findFirst as jest.Mock;

describe('getSeasonalDecorationsConfig', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('returns config from database when available', async () => {
		const mockConfig = {
			enabled: true,
			season: 'christmas',
			decorations: {
				christmasLights: true,
				snowfall: true,
				icicles: false,
				gingerbreadMan: true,
				christmasBalls: true,
			},
		};

		mockFindFirst.mockResolvedValueOnce({value: mockConfig});

		const result = await getSeasonalDecorationsConfig();

		expect(result).toEqual(mockConfig);
	});

	it('returns default config when database returns null', async () => {
		mockFindFirst.mockResolvedValueOnce(null);

		const result = await getSeasonalDecorationsConfig();

		expect(result.enabled).toBe(false);
		expect(result.season).toBe('none');
	});

	it('returns default config when database throws error', async () => {
		mockFindFirst.mockRejectedValueOnce(new Error('DB Error'));

		const result = await getSeasonalDecorationsConfig();

		// Silently returns defaults without logging
		expect(result.enabled).toBe(false);
	});

	it('returns default config when value structure is invalid', async () => {
		mockFindFirst.mockResolvedValueOnce({value: {invalid: 'structure'}});

		const result = await getSeasonalDecorationsConfig();

		expect(result.enabled).toBe(false);
	});

	it('returns default config when db.query.siteSettings is not available', async () => {
		const originalQuery = db.query;

		// Temporarily remove query
		(db as {query?: unknown}).query = undefined;

		const result = await getSeasonalDecorationsConfig();

		// Silently returns defaults without logging
		expect(result.enabled).toBe(false);

		// Restore
		(db as {query?: unknown}).query = originalQuery;
	});
});

describe('SeasonalDecorationsServer', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders children within provider', async () => {
		mockFindFirst.mockResolvedValueOnce(null);

		const Component = await SeasonalDecorationsServer({
			children: <div data-testid="child-content">Child Content</div>,
		});
		render(Component);

		expect(screen.getByTestId('child-content')).toBeInTheDocument();
		expect(screen.getByTestId('decorations-provider')).toContainElement(screen.getByTestId('child-content'));
	});

	it('renders Snowfall component', async () => {
		mockFindFirst.mockResolvedValueOnce(null);

		const Component = await SeasonalDecorationsServer({
			children: <div>Content</div>,
		});
		render(Component);

		expect(screen.getByTestId('snowfall')).toBeInTheDocument();
	});

	it('renders SeasonalStyles component', async () => {
		mockFindFirst.mockResolvedValueOnce(null);

		const Component = await SeasonalDecorationsServer({
			children: <div>Content</div>,
		});
		render(Component);

		expect(screen.getByTestId('seasonal-styles')).toBeInTheDocument();
	});

	it('passes config to SeasonalDecorationsProvider', async () => {
		const mockConfig = {
			enabled: true,
			season: 'christmas',
			decorations: {
				christmasLights: true,
				snowfall: true,
				icicles: false,
				gingerbreadMan: false,
				christmasBalls: false,
			},
		};

		mockFindFirst.mockResolvedValueOnce({value: mockConfig});

		const Component = await SeasonalDecorationsServer({
			children: <div>Content</div>,
		});
		render(Component);

		const provider = screen.getByTestId('decorations-provider');
		const configAttr = provider.getAttribute('data-config');
		expect(JSON.parse(configAttr!)).toEqual(mockConfig);
	});
});
