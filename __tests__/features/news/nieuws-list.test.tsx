import {render, screen, waitFor} from '@testing-library/react';
import {NieuwsListInfo} from '../../../app/features/news/nieuws-list';

// Mock the linkStyles import
jest.mock('../../../app/components/ui', () => ({
	linkStyles: '.animated-link { transition: all 0.2s; }',
}));

const NieuwsList = NieuwsListInfo.component;

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('NieuwsList', () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	it('shows loading state initially', () => {
		mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
		const {container} = render(<NieuwsList />);
		const section = container.querySelector('section');
		expect(section).toHaveAttribute('aria-busy', 'true');
	});

	it('renders title and subtitle', async () => {
		mockFetch.mockResolvedValue({
			json: () => Promise.resolve({results: []}),
		});

		render(<NieuwsList title='News Title' subtitle='News subtitle' />);

		await waitFor(() => {
			expect(screen.getByRole('heading', {level: 2, name: 'News Title'})).toBeInTheDocument();
		});
		expect(screen.getByText('News subtitle')).toBeInTheDocument();
	});

	it('renders news items', async () => {
		const mockNews = {
			results: [
				{
					id: '1',
					data: {
						titel: 'News Item 1',
						datum: '2025-01-15',
						samenvatting: 'Summary 1',
					},
				},
				{
					id: '2',
					data: {
						titel: 'News Item 2',
						datum: '2025-01-14',
						samenvatting: 'Summary 2',
					},
				},
			],
		};
		mockFetch.mockResolvedValue({
			json: () => Promise.resolve(mockNews),
		});

		render(<NieuwsList />);

		await waitFor(() => {
			expect(screen.getByRole('heading', {level: 3, name: /news item 1/i})).toBeInTheDocument();
		});
		expect(screen.getByRole('heading', {level: 3, name: /news item 2/i})).toBeInTheDocument();
		expect(screen.getByText('Summary 1')).toBeInTheDocument();
	});

	it('renders empty state when no news', async () => {
		mockFetch.mockResolvedValue({
			json: () => Promise.resolve({results: []}),
		});

		render(<NieuwsList />);

		await waitFor(() => {
			expect(screen.getByText('Nog geen nieuwsberichten')).toBeInTheDocument();
		});
	});

	it('shows pinned icon for pinned items', async () => {
		const mockNews = {
			results: [
				{
					id: '1',
					data: {
						titel: 'Pinned News',
						datum: '2025-01-15',
						samenvatting: 'Summary',
						vastgepind: true,
					},
				},
			],
		};
		mockFetch.mockResolvedValue({
			json: () => Promise.resolve(mockNews),
		});

		render(<NieuwsList />);

		await waitFor(() => {
			expect(screen.getByLabelText('Vastgepind')).toBeInTheDocument();
		});
	});

	it('sorts pinned items first', async () => {
		const mockNews = {
			results: [
				{
					id: '2',
					data: {
						titel: 'Regular',
						datum: '2025-01-16',
						samenvatting: 'Summary',
						vastgepind: false,
					},
				},
				{
					id: '1',
					data: {
						titel: 'Pinned',
						datum: '2025-01-15',
						samenvatting: 'Summary',
						vastgepind: true,
					},
				},
			],
		};
		mockFetch.mockResolvedValue({
			json: () => Promise.resolve(mockNews),
		});

		render(<NieuwsList />);

		await waitFor(() => {
			const headings = screen.getAllByRole('heading', {level: 3});
			expect(headings[0]).toHaveTextContent('Pinned');
			expect(headings[1]).toHaveTextContent('Regular');
		});
	});

	describe('layouts', () => {
		it('uses list layout by default', async () => {
			const mockNews = {
				results: [{id: '1', data: {titel: 'Test', datum: '2025-01-15', samenvatting: 'Sum'}}],
			};
			mockFetch.mockResolvedValue({
				json: () => Promise.resolve(mockNews),
			});

			const {container} = render(<NieuwsList />);

			await waitFor(() => {
				const feed = container.querySelector('[role="feed"]');
				expect(feed).toHaveClass('space-y-6');
			});
		});

		it('uses grid layout when specified', async () => {
			const mockNews = {
				results: [{id: '1', data: {titel: 'Test', datum: '2025-01-15', samenvatting: 'Sum'}}],
			};
			mockFetch.mockResolvedValue({
				json: () => Promise.resolve(mockNews),
			});

			const {container} = render(<NieuwsList layout='grid' />);

			await waitFor(() => {
				const feed = container.querySelector('[role="feed"]');
				expect(feed).toHaveClass('grid');
			});
		});
	});

	it('handles fetch error gracefully', async () => {
		mockFetch.mockRejectedValue(new Error('Fetch failed'));
		const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

		render(<NieuwsList />);

		await waitFor(() => {
			// Should show empty state or error message
			const section = screen.getByRole('region', {name: /nieuws/i});
			expect(section).toBeInTheDocument();
		});

		consoleError.mockRestore();
	});

	it('generates correct slug links', async () => {
		const mockNews = {
			results: [
				{id: '1', data: {titel: 'Test Article Title', datum: '2025-01-15', samenvatting: 'Sum'}},
			],
		};
		mockFetch.mockResolvedValue({
			json: () => Promise.resolve(mockNews),
		});

		render(<NieuwsList />);

		await waitFor(() => {
			const link = screen.getByRole('link');
			expect(link).toHaveAttribute('href', '/nieuws/test-article-title');
		});
	});

	it('formats dates in Dutch', async () => {
		const mockNews = {
			results: [
				{id: '1', data: {titel: 'Test', datum: '2025-01-15', samenvatting: 'Sum'}},
			],
		};
		mockFetch.mockResolvedValue({
			json: () => Promise.resolve(mockNews),
		});

		render(<NieuwsList />);

		await waitFor(() => {
			// Dutch date format should include "januari"
			expect(screen.getByText(/15.*januari.*2025/i)).toBeInTheDocument();
		});
	});
});

describe('NieuwsListInfo', () => {
	it('exports correct component info', () => {
		expect(NieuwsListInfo.name).toBe('NieuwsList');
		expect(NieuwsListInfo.component).toBeDefined();
		expect(NieuwsListInfo.inputs).toBeInstanceOf(Array);
	});
});
