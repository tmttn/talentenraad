import {render, screen, waitFor} from '@testing-library/react';
import {TeamGridInfo} from '../../../app/features/team/team-grid';

const TeamGrid = TeamGridInfo.component;

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('TeamGrid', () => {
	const sampleMembers = [
		{name: 'Jan Janssen', role: 'Voorzitter', description: 'Bio'},
		{name: 'Piet Peters', role: 'Secretaris'},
	];

	beforeEach(() => {
		mockFetch.mockReset();
	});

	describe('with fetchFromBuilder=false', () => {
		it('renders title when provided', () => {
			render(<TeamGrid title='Team Title' members={sampleMembers} fetchFromBuilder={false} />);
			expect(screen.getByRole('heading', {level: 2, name: 'Team Title'})).toBeInTheDocument();
		});

		it('renders subtitle when provided', () => {
			render(<TeamGrid subtitle='Team subtitle' members={sampleMembers} fetchFromBuilder={false} />);
			expect(screen.getByText('Team subtitle')).toBeInTheDocument();
		});

		it('renders members from props', () => {
			render(<TeamGrid members={sampleMembers} fetchFromBuilder={false} />);
			expect(screen.getByRole('heading', {level: 3, name: 'Jan Janssen'})).toBeInTheDocument();
			expect(screen.getByText('Voorzitter')).toBeInTheDocument();
			expect(screen.getByRole('heading', {level: 3, name: 'Piet Peters'})).toBeInTheDocument();
		});

		it('renders member initials', () => {
			render(<TeamGrid members={sampleMembers} fetchFromBuilder={false} />);
			expect(screen.getByText('JJ')).toBeInTheDocument();
			expect(screen.getByText('PP')).toBeInTheDocument();
		});

		it('renders description when showDescription is true', () => {
			render(<TeamGrid members={sampleMembers} fetchFromBuilder={false} showDescription />);
			expect(screen.getByText('Bio')).toBeInTheDocument();
		});

		it('hides description when showDescription is false', () => {
			render(<TeamGrid members={sampleMembers} fetchFromBuilder={false} showDescription={false} />);
			expect(screen.queryByText('Bio')).not.toBeInTheDocument();
		});

		it('shows empty state when no members', () => {
			render(<TeamGrid members={[]} fetchFromBuilder={false} />);
			expect(screen.getByText('Geen teamleden gevonden')).toBeInTheDocument();
		});
	});

	describe('columns', () => {
		it('uses 3 columns by default', () => {
			const {container} = render(<TeamGrid members={sampleMembers} fetchFromBuilder={false} />);
			const grid = container.querySelector('.grid');
			expect(grid).toHaveClass('lg:grid-cols-3');
		});

		it('uses 2 columns when specified', () => {
			const {container} = render(<TeamGrid members={sampleMembers} fetchFromBuilder={false} columns={2} />);
			const grid = container.querySelector('.grid');
			expect(grid).toHaveClass('md:grid-cols-2');
			expect(grid).not.toHaveClass('lg:grid-cols-3');
		});

		it('uses 4 columns when specified', () => {
			const {container} = render(<TeamGrid members={sampleMembers} fetchFromBuilder={false} columns={4} />);
			const grid = container.querySelector('.grid');
			expect(grid).toHaveClass('lg:grid-cols-4');
		});
	});

	describe('with fetchFromBuilder=true', () => {
		it('shows loading state initially', () => {
			mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
			const {container} = render(<TeamGrid />);
			const section = container.querySelector('section');
			expect(section).toHaveAttribute('aria-busy', 'true');
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

		it('falls back to props on fetch error', async () => {
			mockFetch.mockRejectedValue(new Error('Fetch failed'));
			const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

			render(<TeamGrid members={sampleMembers} />);

			await waitFor(() => {
				expect(screen.getByRole('heading', {level: 3, name: 'Jan Janssen'})).toBeInTheDocument();
			});

			consoleError.mockRestore();
		});

		it('falls back to props when no results', async () => {
			mockFetch.mockResolvedValue({
				json: () => Promise.resolve({results: []}),
			});

			render(<TeamGrid members={sampleMembers} />);

			await waitFor(() => {
				expect(screen.getByRole('heading', {level: 3, name: 'Jan Janssen'})).toBeInTheDocument();
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
	});
});

describe('TeamGridInfo', () => {
	it('exports correct component info', () => {
		expect(TeamGridInfo.name).toBe('TeamGrid');
		expect(TeamGridInfo.component).toBeDefined();
		expect(TeamGridInfo.inputs).toBeInstanceOf(Array);
	});
});
