import {render, screen} from '@testing-library/react';
import {isPreviewing, isEditing} from '@builder.io/sdk-react-nextjs';
import {
	ConfigurationError,
	FetchError,
	fetchBuilderContent,
	canShowBuilderContent,
} from '../../app/lib/builder-utils';

// Get mocked functions
const mockIsPreviewing = isPreviewing as jest.MockedFunction<typeof isPreviewing>;
const mockIsEditing = isEditing as jest.MockedFunction<typeof isEditing>;

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('builder-utils', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('ConfigurationError', () => {
		it('renders configuration error message', () => {
			render(<ConfigurationError />);

			expect(screen.getByRole('heading', {level: 1})).toHaveTextContent('Configuration Error');
			expect(screen.getByText('NEXT_PUBLIC_BUILDER_API_KEY is not set')).toBeInTheDocument();
		});
	});

	describe('FetchError', () => {
		it('renders fetch error with provided message', () => {
			const errorMessage = 'Network error occurred';
			render(<FetchError message={errorMessage} />);

			expect(screen.getByRole('heading', {level: 1})).toHaveTextContent('Error fetching content');
			expect(screen.getByText(errorMessage)).toBeInTheDocument();
		});

		it('renders fetch error with different message', () => {
			const errorMessage = 'API rate limit exceeded';
			render(<FetchError message={errorMessage} />);

			expect(screen.getByText(errorMessage)).toBeInTheDocument();
		});
	});

	describe('fetchBuilderContent', () => {
		it('returns content when fetch succeeds', async () => {
			const mockContent = {id: '123', name: 'Test Page', data: {url: '/'}};
			mockFetch.mockResolvedValue({
				ok: true,
				json: async () => ({results: [mockContent]}),
			});

			const result = await fetchBuilderContent('/', {}, 'test-api-key');

			expect(result).toEqual({content: mockContent});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('cdn.builder.io'),
				{cache: 'no-store'},
			);
		});

		it('returns null content when no results', async () => {
			mockFetch.mockResolvedValue({
				ok: true,
				json: async () => ({results: []}),
			});

			const result = await fetchBuilderContent('/nonexistent', {}, 'api-key');

			expect(result).toEqual({content: null});
		});

		it('returns error when fetch fails with non-ok response', async () => {
			mockFetch.mockResolvedValue({
				ok: false,
				status: 500,
			});

			const result = await fetchBuilderContent('/', {}, 'test-api-key');

			expect(result).toEqual({
				content: undefined,
				error: 'HTTP 500',
			});
		});

		it('returns error when fetch throws', async () => {
			mockFetch.mockRejectedValue(new Error('Network error'));

			const result = await fetchBuilderContent('/', {}, 'test-api-key');

			expect(result).toEqual({
				content: undefined,
				error: 'Network error',
			});
		});

		it('returns unknown error when fetch throws non-Error', async () => {
			mockFetch.mockRejectedValue('Something went wrong');

			const result = await fetchBuilderContent('/', {}, 'test-api-key');

			expect(result).toEqual({
				content: undefined,
				error: 'Unknown error',
			});
		});

		it('includes URL path in userAttributes parameter', async () => {
			mockFetch.mockResolvedValue({
				ok: true,
				json: async () => ({results: []}),
			});

			await fetchBuilderContent('/about', {}, 'api-key');

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('userAttributes.urlPath=%2Fabout'),
				expect.anything(),
			);
		});
	});

	describe('canShowBuilderContent', () => {
		it('returns true when content exists', () => {
			mockIsPreviewing.mockReturnValue(false);
			mockIsEditing.mockReturnValue(false);

			const content = {id: '123'};
			const result = canShowBuilderContent(content as never, {});

			expect(result).toBe(true);
		});

		it('returns true when in preview mode', () => {
			mockIsPreviewing.mockReturnValue(true);
			mockIsEditing.mockReturnValue(false);

			const result = canShowBuilderContent(undefined, {});

			expect(result).toBe(true);
		});

		it('returns true when in editing mode', () => {
			mockIsPreviewing.mockReturnValue(false);
			mockIsEditing.mockReturnValue(true);

			const result = canShowBuilderContent(undefined, {});

			expect(result).toBe(true);
		});

		it('returns false when no content and not in preview/edit mode', () => {
			mockIsPreviewing.mockReturnValue(false);
			mockIsEditing.mockReturnValue(false);

			const result = canShowBuilderContent(undefined, {});

			expect(result).toBe(false);
		});

		it('returns false when content is null and not in preview/edit mode', () => {
			mockIsPreviewing.mockReturnValue(false);
			mockIsEditing.mockReturnValue(false);

			const result = canShowBuilderContent(null as never, {});

			expect(result).toBe(false);
		});
	});
});
