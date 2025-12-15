import {render, screen} from '@testing-library/react';

const mockFetchBuilderContent = jest.fn();
const mockCanShowBuilderContent = jest.fn();

jest.mock('../../../app/lib/builder-utils', () => ({
	builderPublicApiKey: 'test-api-key',
	fetchBuilderContent: (...args: unknown[]) => mockFetchBuilderContent(...args),
	canShowBuilderContent: (...args: unknown[]) => mockCanShowBuilderContent(...args),
	ConfigurationError: () => <div>Configuration Error</div>,
	FetchError: ({message}: {message: string}) => <div>Error: {message}</div>,
	NotFoundContent: () => <div>404 Not Found</div>,
}));

jest.mock('../../../app/components/builder/builder-content', () => ({
	BuilderContent: ({content}: {content: unknown}) => (
		<div data-testid='builder-content'>{content ? 'Has Content' : 'No Content'}</div>
	),
}));

jest.mock('../../../app/components/layout/page-with-announcements', () => ({
	PageWithAnnouncements: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

import Page from '../../../app/(main)/[...page]/page';

describe('[...page] Dynamic Route', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders BuilderContent for single segment path', async () => {
		mockFetchBuilderContent.mockResolvedValue({content: {id: '123'}});
		mockCanShowBuilderContent.mockReturnValue(true);

		const Component = await Page({
			params: Promise.resolve({page: ['about']}),
			searchParams: Promise.resolve({}),
		});
		render(Component);

		expect(screen.getByTestId('builder-content')).toBeInTheDocument();
		expect(mockFetchBuilderContent).toHaveBeenCalledWith('/about', {}, 'test-api-key');
	});

	it('renders BuilderContent for multi-segment path', async () => {
		mockFetchBuilderContent.mockResolvedValue({content: {id: '456'}});
		mockCanShowBuilderContent.mockReturnValue(true);

		const Component = await Page({
			params: Promise.resolve({page: ['blog', 'posts', 'my-article']}),
			searchParams: Promise.resolve({}),
		});
		render(Component);

		expect(mockFetchBuilderContent).toHaveBeenCalledWith('/blog/posts/my-article', {}, 'test-api-key');
	});

	it('handles empty page array', async () => {
		mockFetchBuilderContent.mockResolvedValue({content: {id: '789'}});
		mockCanShowBuilderContent.mockReturnValue(true);

		const Component = await Page({
			params: Promise.resolve({page: []}),
			searchParams: Promise.resolve({}),
		});
		render(Component);

		expect(mockFetchBuilderContent).toHaveBeenCalledWith('/', {}, 'test-api-key');
	});

	it('handles undefined page', async () => {
		mockFetchBuilderContent.mockResolvedValue({content: {id: '101'}});
		mockCanShowBuilderContent.mockReturnValue(true);

		const Component = await Page({
			params: Promise.resolve({page: undefined as unknown as string[]}),
			searchParams: Promise.resolve({}),
		});
		render(Component);

		expect(mockFetchBuilderContent).toHaveBeenCalledWith('/', {}, 'test-api-key');
	});

	it('renders FetchError when fetch fails', async () => {
		mockFetchBuilderContent.mockResolvedValue({content: undefined, error: 'API Error'});

		const Component = await Page({
			params: Promise.resolve({page: ['test']}),
			searchParams: Promise.resolve({}),
		});
		render(Component);

		expect(screen.getByText('Error: API Error')).toBeInTheDocument();
	});

	it('renders NotFoundContent when content cannot be shown', async () => {
		mockFetchBuilderContent.mockResolvedValue({content: null});
		mockCanShowBuilderContent.mockReturnValue(false);

		const Component = await Page({
			params: Promise.resolve({page: ['nonexistent']}),
			searchParams: Promise.resolve({}),
		});
		render(Component);

		expect(screen.getByText('404 Not Found')).toBeInTheDocument();
	});

	it('passes search parameters correctly', async () => {
		mockFetchBuilderContent.mockResolvedValue({content: {id: '123'}});
		mockCanShowBuilderContent.mockReturnValue(true);

		const Component = await Page({
			params: Promise.resolve({page: ['page']}),
			searchParams: Promise.resolve({preview: 'true', locale: 'nl'}),
		});
		render(Component);

		expect(mockFetchBuilderContent).toHaveBeenCalledWith(
			'/page',
			{preview: 'true', locale: 'nl'},
			'test-api-key',
		);
	});
});

describe('[...page] without API key', () => {
	beforeEach(() => {
		jest.resetModules();
	});

	it('renders ConfigurationError when API key is missing', async () => {
		jest.doMock('../../../app/lib/builder-utils', () => ({
			builderPublicApiKey: undefined,
			fetchBuilderContent: mockFetchBuilderContent,
			canShowBuilderContent: mockCanShowBuilderContent,
			ConfigurationError: () => <div>Configuration Error</div>,
			FetchError: ({message}: {message: string}) => <div>Error: {message}</div>,
			NotFoundContent: () => <div>404 Not Found</div>,
		}));

		const {default: PageWithoutKey} = await import('../../../app/(main)/[...page]/page');
		const Component = await PageWithoutKey({
			params: Promise.resolve({page: ['test']}),
			searchParams: Promise.resolve({}),
		});
		render(Component);

		expect(screen.getByText('Configuration Error')).toBeInTheDocument();
	});
});

describe('[...page] revalidate export', () => {
	it('exports ISR revalidate setting', async () => {
		const {revalidate} = await import('../../../app/(main)/[...page]/page');
		expect(revalidate).toBe(5);
	});
});
