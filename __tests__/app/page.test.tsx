/**
 * Tests for Home Page
 *
 * These tests verify the component structure and rendering behavior.
 */

import {render, screen} from '@testing-library/react';

const mockFetchBuilderContent = jest.fn();

jest.mock('../../app/lib/builder-utils', () => ({
	builderPublicApiKey: 'test-api-key',
	fetchBuilderContent: (...args: unknown[]) => mockFetchBuilderContent(...args),
	extractSeoData: () => ({}),
	ConfigurationError: () => <div>Configuration Error</div>,
}));

jest.mock('../../app/components/builder/builder-content', () => ({
	BuilderContent: ({content}: {content: unknown}) => (
		<div data-testid='builder-content'>{content ? 'Has Content' : 'No Content'}</div>
	),
}));

jest.mock('../../app/components/layout/page-with-announcements', () => ({
	PageWithAnnouncements: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

import Page from '../../app/(main)/page';

describe('Home Page', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders page content when content exists', async () => {
		mockFetchBuilderContent.mockResolvedValue({content: {id: '123'}});

		const Component = await Page({
			params: Promise.resolve({slug: []}),
			searchParams: Promise.resolve({}),
		});

		render(Component);

		expect(screen.getByTestId('builder-content')).toBeInTheDocument();
		expect(screen.getByText('Has Content')).toBeInTheDocument();
	});

	it('fetches content for home page with correct path', async () => {
		mockFetchBuilderContent.mockResolvedValue({content: {id: '123'}});

		await Page({
			params: Promise.resolve({slug: []}),
			searchParams: Promise.resolve({}),
		});

		expect(mockFetchBuilderContent).toHaveBeenCalledWith('/', {}, 'test-api-key');
	});

	it('passes search parameters to fetchBuilderContent', async () => {
		mockFetchBuilderContent.mockResolvedValue({content: {id: '123'}});

		await Page({
			params: Promise.resolve({slug: []}),
			searchParams: Promise.resolve({preview: 'true'}),
		});

		expect(mockFetchBuilderContent).toHaveBeenCalledWith('/', {preview: 'true'}, 'test-api-key');
	});

	it('renders ConfigurationError when API key is missing', async () => {
		jest.resetModules();
		jest.doMock('../../app/lib/builder-utils', () => ({
			builderPublicApiKey: undefined,
			fetchBuilderContent: mockFetchBuilderContent,
			extractSeoData: () => ({}),
			ConfigurationError: () => <div>Configuration Error</div>,
		}));

		const {default: PageWithoutKey} = await import('../../app/(main)/page');
		const Component = await PageWithoutKey({
			params: Promise.resolve({slug: []}),
			searchParams: Promise.resolve({}),
		});
		render(Component);

		expect(screen.getByText('Configuration Error')).toBeInTheDocument();
	});
});
