import {render, screen, waitFor} from '@testing-library/react';
import {TeamGridInfo} from '../../../app/features/team/team-grid';

const TeamGrid = TeamGridInfo.component;

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('TeamGrid', () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	it('shows loading state initially', () => {
		mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
		const {container} = render(<TeamGrid />);
		expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
	});

	it('fetches and displays members from Builder', async () => {
		const builderResponse = {
			results: [
				{
					id: '1',
					data: {
						naam: 'Builder User',
						rol: 'Lid',
						beschrijving: 'From Builder',
						actief: true,
						volgorde: 1,
					},
				},
			],
		};
		mockFetch.mockResolvedValue({
			json: () => Promise.resolve(builderResponse),
		});

		render(<TeamGrid />);

		await waitFor(() => {
			expect(screen.getByRole('heading', {level: 3, name: 'Builder User'})).toBeInTheDocument();
		});
		expect(screen.getByText('Lid')).toBeInTheDocument();
	});

	it('renders member initials', async () => {
		const builderResponse = {
			results: [
				{id: '1', data: {naam: 'Jan Janssen', rol: 'Voorzitter', actief: true}},
				{id: '2', data: {naam: 'Piet Peters', rol: 'Secretaris', actief: true}},
			],
		};
		mockFetch.mockResolvedValue({
			json: () => Promise.resolve(builderResponse),
		});

		render(<TeamGrid />);

		await waitFor(() => {
			expect(screen.getByText('JJ')).toBeInTheDocument();
		});
		expect(screen.getByText('PP')).toBeInTheDocument();
	});

	it('renders description when showDescription is true', async () => {
		const builderResponse = {
			results: [
				{id: '1', data: {naam: 'Test', rol: 'Lid', beschrijving: 'Bio text', actief: true}},
			],
		};
		mockFetch.mockResolvedValue({
			json: () => Promise.resolve(builderResponse),
		});

		render(<TeamGrid showDescription />);

		await waitFor(() => {
			expect(screen.getByText('Bio text')).toBeInTheDocument();
		});
	});

	it('hides description when showDescription is false', async () => {
		const builderResponse = {
			results: [
				{id: '1', data: {naam: 'Test', rol: 'Lid', beschrijving: 'Bio text', actief: true}},
			],
		};
		mockFetch.mockResolvedValue({
			json: () => Promise.resolve(builderResponse),
		});

		render(<TeamGrid showDescription={false} />);

		await waitFor(() => {
			expect(screen.getByText('Test')).toBeInTheDocument();
		});
		expect(screen.queryByText('Bio text')).not.toBeInTheDocument();
	});

	it('shows empty state when no members', async () => {
		mockFetch.mockResolvedValue({
			json: () => Promise.resolve({results: []}),
		});

		render(<TeamGrid />);

		await waitFor(() => {
			expect(screen.getByText('Geen teamleden gevonden')).toBeInTheDocument();
		});
	});

	describe('columns', () => {
		it('uses 3 columns by default', async () => {
			const builderResponse = {
				results: [{id: '1', data: {naam: 'Test', rol: 'Lid', actief: true}}],
			};
			mockFetch.mockResolvedValue({
				json: () => Promise.resolve(builderResponse),
			});

			const {container} = render(<TeamGrid />);

			await waitFor(() => {
				const grid = container.querySelector('.grid');
				expect(grid).toHaveClass('lg:grid-cols-3');
			});
		});

		it('uses 2 columns when specified', async () => {
			const builderResponse = {
				results: [{id: '1', data: {naam: 'Test', rol: 'Lid', actief: true}}],
			};
			mockFetch.mockResolvedValue({
				json: () => Promise.resolve(builderResponse),
			});

			const {container} = render(<TeamGrid columns={2} />);

			await waitFor(() => {
				const grid = container.querySelector('.grid');
				expect(grid).toHaveClass('md:grid-cols-2');
				expect(grid).not.toHaveClass('lg:grid-cols-3');
			});
		});

		it('uses 4 columns when specified', async () => {
			const builderResponse = {
				results: [{id: '1', data: {naam: 'Test', rol: 'Lid', actief: true}}],
			};
			mockFetch.mockResolvedValue({
				json: () => Promise.resolve(builderResponse),
			});

			const {container} = render(<TeamGrid columns={4} />);

			await waitFor(() => {
				const grid = container.querySelector('.grid');
				expect(grid).toHaveClass('lg:grid-cols-4');
			});
		});
	});

	it('filters out inactive members', async () => {
		const builderResponse = {
			results: [
				{id: '1', data: {naam: 'Active', rol: 'Lid', actief: true}},
				{id: '2', data: {naam: 'Inactive', rol: 'Lid', actief: false}},
			],
		};
		mockFetch.mockResolvedValue({
			json: () => Promise.resolve(builderResponse),
		});

		render(<TeamGrid />);

		await waitFor(() => {
			expect(screen.getByRole('heading', {level: 3, name: 'Active'})).toBeInTheDocument();
		});
		expect(screen.queryByText('Inactive')).not.toBeInTheDocument();
	});

	it('sorts members by volgorde', async () => {
		const builderResponse = {
			results: [
				{id: '1', data: {naam: 'Second', rol: 'Lid', volgorde: 2}},
				{id: '2', data: {naam: 'First', rol: 'Lid', volgorde: 1}},
			],
		};
		mockFetch.mockResolvedValue({
			json: () => Promise.resolve(builderResponse),
		});

		render(<TeamGrid />);

		await waitFor(() => {
			const headings = screen.getAllByRole('heading', {level: 3});
			expect(headings[0]).toHaveTextContent('First');
			expect(headings[1]).toHaveTextContent('Second');
		});
	});

	it('handles fetch error gracefully', async () => {
		mockFetch.mockRejectedValue(new Error('Fetch failed'));
		const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

		render(<TeamGrid />);

		await waitFor(() => {
			expect(screen.getByText('Geen teamleden gevonden')).toBeInTheDocument();
		});

		consoleError.mockRestore();
	});
});

describe('TeamGridInfo', () => {
	it('exports correct component info', () => {
		expect(TeamGridInfo.name).toBe('TeamGrid');
		expect(TeamGridInfo.component).toBeDefined();
		expect(TeamGridInfo.inputs).toBeInstanceOf(Array);
	});
});
