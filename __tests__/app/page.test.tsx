import {render, screen} from '@testing-library/react';

const mockFetchBuilderContent = jest.fn();
const mockCanShowBuilderContent = jest.fn();

jest.mock('../../app/lib/builder-utils', () => ({
	builderPublicApiKey: 'test-api-key',
	fetchBuilderContent: (...args: unknown[]) => mockFetchBuilderContent(...args),
	canShowBuilderContent: (...args: unknown[]) => mockCanShowBuilderContent(...args),
	ConfigurationError: () => <div>Configuration Error</div>,
	FetchError: ({message}: {message: string}) => <div>Error: {message}</div>,
	NotFoundContent: () => <div>404 Not Found</div>,
}));

jest.mock('../../app/components/builder-content', () => ({
	BuilderContent: ({content}: {content: unknown}) => (
		<div data-testid='builder-content'>{content ? 'Has Content' : 'No Content'}</div>
	),
}));

import Page from '../../app/(main)/page';

describe('Home Page', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders BuilderContent when content is found', async () => {
		mockFetchBuilderContent.mockResolvedValue({content: {id: '123'}});
		mockCanShowBuilderContent.mockReturnValue(true);

		const searchParams = Promise.resolve({});
		const Component = await Page({
			params: Promise.resolve({slug: []}),
			searchParams,
		});
		render(Component);

		expect(screen.getByTestId('builder-content')).toBeInTheDocument();
		expect(mockFetchBuilderContent).toHaveBeenCalledWith('/', {}, 'test-api-key');
	});

	it('renders FetchError when fetch fails', async () => {
		mockFetchBuilderContent.mockResolvedValue({content: undefined, error: 'Network error'});

		const searchParams = Promise.resolve({});
		const Component = await Page({
			params: Promise.resolve({slug: []}),
			searchParams,
		});
		render(Component);

		expect(screen.getByText('Error: Network error')).toBeInTheDocument();
	});

	it('renders NotFoundContent when content cannot be shown', async () => {
		mockFetchBuilderContent.mockResolvedValue({content: null});
		mockCanShowBuilderContent.mockReturnValue(false);

		const searchParams = Promise.resolve({});
		const Component = await Page({
			params: Promise.resolve({slug: []}),
			searchParams,
		});
		render(Component);

		expect(screen.getByText('404 Not Found')).toBeInTheDocument();
	});

	it('passes search parameters to fetchBuilderContent', async () => {
		mockFetchBuilderContent.mockResolvedValue({content: {id: '123'}});
		mockCanShowBuilderContent.mockReturnValue(true);

		const searchParams = Promise.resolve({preview: 'true'});
		const Component = await Page({
			params: Promise.resolve({slug: []}),
			searchParams,
		});
		render(Component);

		expect(mockFetchBuilderContent).toHaveBeenCalledWith('/', {preview: 'true'}, 'test-api-key');
	});
});

describe('Home Page without API key', () => {
	beforeEach(() => {
		jest.resetModules();
	});

	it('renders ConfigurationError when API key is missing', async () => {
		jest.doMock('../../app/lib/builder-utils', () => ({
			builderPublicApiKey: undefined,
			fetchBuilderContent: mockFetchBuilderContent,
			canShowBuilderContent: mockCanShowBuilderContent,
			ConfigurationError: () => <div>Configuration Error</div>,
			FetchError: ({message}: {message: string}) => <div>Error: {message}</div>,
			NotFoundContent: () => <div>404 Not Found</div>,
		}));

		const {default: PageWithoutKey} = await import('../../app/(main)/page');
		const searchParams = Promise.resolve({});
		const Component = await PageWithoutKey({
			params: Promise.resolve({slug: []}),
			searchParams,
		});
		render(Component);

		expect(screen.getByText('Configuration Error')).toBeInTheDocument();
	});
});
