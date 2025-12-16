import {render, screen, waitFor} from '@testing-library/react';
import SectionPreviewPage from '../../../app/(builder-preview)/sections/[model]/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
	useSearchParams: () => ({
		entries: () => [],
	}),
}));

// Mock Builder.io SDK
const mockFetchOneEntry = jest.fn();
const mockIsPreviewing = jest.fn();
const mockIsEditing = jest.fn();

jest.mock('@builder.io/sdk-react-nextjs', () => ({
	fetchOneEntry: (...args: unknown[]) => mockFetchOneEntry(...args),
	isPreviewing: (...args: unknown[]) => mockIsPreviewing(...args),
	isEditing: (...args: unknown[]) => mockIsEditing(...args),
	Content: jest.fn(({model}) => (
		<div data-testid='builder-content' data-model={model}>
			Builder Content
		</div>
	)),
}));

describe('SectionPreviewPage', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockIsPreviewing.mockReturnValue(false);
		mockIsEditing.mockReturnValue(false);
	});

	it('shows loading state initially', async () => {
		mockFetchOneEntry.mockImplementation(() => new Promise(() => {})); // Never resolves

		const params = Promise.resolve({model: 'test-section'});
		render(<SectionPreviewPage params={params} />);

		expect(screen.getByText('Sectie laden...')).toBeInTheDocument();
	});

	it('renders content when fetched successfully', async () => {
		mockFetchOneEntry.mockResolvedValue({
			id: 'test-id',
			data: {title: 'Test Section'},
		});

		const params = Promise.resolve({model: 'test-section'});
		render(<SectionPreviewPage params={params} />);

		await waitFor(() => {
			expect(screen.getByTestId('builder-content')).toBeInTheDocument();
		});
	});

	it('shows error state when content not found and not in preview mode', async () => {
		mockFetchOneEntry.mockResolvedValue(null);
		mockIsPreviewing.mockReturnValue(false);
		mockIsEditing.mockReturnValue(false);

		const params = Promise.resolve({model: 'non-existent'});
		render(<SectionPreviewPage params={params} />);

		await waitFor(() => {
			expect(screen.getByText('Sectie niet gevonden')).toBeInTheDocument();
		});
	});

	it('does not show error in preview mode even without content', async () => {
		mockFetchOneEntry.mockResolvedValue(null);
		mockIsPreviewing.mockReturnValue(true);

		const params = Promise.resolve({model: 'test-section'});
		render(<SectionPreviewPage params={params} />);

		await waitFor(() => {
			expect(mockFetchOneEntry).toHaveBeenCalled();
		});

		// In preview mode, should render content component even without content
		await waitFor(() => {
			expect(screen.queryByText('Sectie niet gevonden')).not.toBeInTheDocument();
		});
	});

	it('does not show error in editing mode even without content', async () => {
		mockFetchOneEntry.mockResolvedValue(null);
		mockIsEditing.mockReturnValue(true);

		const params = Promise.resolve({model: 'test-section'});
		render(<SectionPreviewPage params={params} />);

		await waitFor(() => {
			expect(mockFetchOneEntry).toHaveBeenCalled();
		});

		await waitFor(() => {
			expect(screen.queryByText('Sectie niet gevonden')).not.toBeInTheDocument();
		});
	});

	it('handles fetch errors gracefully', async () => {
		const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
		mockFetchOneEntry.mockRejectedValue(new Error('Network error'));

		const params = Promise.resolve({model: 'test-section'});
		render(<SectionPreviewPage params={params} />);

		await waitFor(() => {
			expect(consoleSpy).toHaveBeenCalled();
		});

		await waitFor(() => {
			expect(screen.getByText('Sectie niet gevonden')).toBeInTheDocument();
		});

		consoleSpy.mockRestore();
	});

	it('passes model name to Content component', async () => {
		mockFetchOneEntry.mockResolvedValue({
			id: 'test-id',
			data: {},
		});

		const params = Promise.resolve({model: 'announcement-bar'});
		render(<SectionPreviewPage params={params} />);

		await waitFor(() => {
			expect(screen.getByTestId('builder-content')).toHaveAttribute('data-model', 'announcement-bar');
		});
	});

	it('refetches when model changes', async () => {
		mockFetchOneEntry.mockResolvedValue({id: 'test-id', data: {}});

		const params1 = Promise.resolve({model: 'model-1'});
		const {rerender} = render(<SectionPreviewPage params={params1} />);

		await waitFor(() => {
			expect(mockFetchOneEntry).toHaveBeenCalledWith(
				expect.objectContaining({model: 'model-1'}),
			);
		});

		mockFetchOneEntry.mockClear();
		const params2 = Promise.resolve({model: 'model-2'});
		rerender(<SectionPreviewPage params={params2} />);

		await waitFor(() => {
			expect(mockFetchOneEntry).toHaveBeenCalledWith(
				expect.objectContaining({model: 'model-2'}),
			);
		});
	});
});
