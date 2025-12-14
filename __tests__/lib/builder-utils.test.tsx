import {render, screen} from '@testing-library/react';
import {fetchOneEntry, isPreviewing, isEditing} from '@builder.io/sdk-react-nextjs';
import {
	ConfigurationError,
	FetchError,
	NotFoundContent,
	fetchBuilderContent,
	canShowBuilderContent,
} from '../../app/lib/builder-utils';

// Get mocked functions
const mockFetchOneEntry = fetchOneEntry as jest.MockedFunction<typeof fetchOneEntry>;
const mockIsPreviewing = isPreviewing as jest.MockedFunction<typeof isPreviewing>;
const mockIsEditing = isEditing as jest.MockedFunction<typeof isEditing>;

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

	describe('NotFoundContent', () => {
		it('renders 404 message', () => {
			render(<NotFoundContent />);

			expect(screen.getByRole('heading', {level: 1})).toHaveTextContent('404');
			expect(screen.getByText('Controleer of de content gepubliceerd is op builder.io')).toBeInTheDocument();
		});
	});

	describe('fetchBuilderContent', () => {
		it('returns content when fetch succeeds', async () => {
			const mockContent = {id: '123', name: 'Test Page'};
			mockFetchOneEntry.mockResolvedValue(mockContent as never);

			const result = await fetchBuilderContent('/', {}, 'test-api-key');

			expect(result).toEqual({content: mockContent});
			expect(mockFetchOneEntry).toHaveBeenCalledWith({
				options: {},
				apiKey: 'test-api-key',
				model: 'page',
				userAttributes: {urlPath: '/'},
				cacheSeconds: 60,
				fetchOptions: {next: {revalidate: 5}},
			});
		});

		it('returns content with search parameters', async () => {
			const mockContent = {id: '456', name: 'About Page'};
			mockFetchOneEntry.mockResolvedValue(mockContent as never);
			const searchParameters = {preview: 'true', locale: 'en'};

			const result = await fetchBuilderContent('/about', searchParameters, 'api-key');

			expect(result).toEqual({content: mockContent});
			expect(mockFetchOneEntry).toHaveBeenCalledWith({
				options: searchParameters,
				apiKey: 'api-key',
				model: 'page',
				userAttributes: {urlPath: '/about'},
				cacheSeconds: 60,
				fetchOptions: {next: {revalidate: 5}},
			});
		});

		it('returns error when fetch fails with Error instance', async () => {
			mockFetchOneEntry.mockRejectedValue(new Error('Network error'));

			const result = await fetchBuilderContent('/', {}, 'test-api-key');

			expect(result).toEqual({
				content: undefined,
				error: 'Network error',
			});
		});

		it('returns unknown error when fetch fails with non-Error', async () => {
			mockFetchOneEntry.mockRejectedValue('Something went wrong');

			const result = await fetchBuilderContent('/', {}, 'test-api-key');

			expect(result).toEqual({
				content: undefined,
				error: 'Unknown error',
			});
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
