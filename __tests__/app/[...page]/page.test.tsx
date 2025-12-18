/**
 * Tests for [...page] Dynamic Route
 *
 * These tests verify the component structure and rendering behavior.
 * The 404 detection is now handled directly in the Page component.
 */

import {render, screen} from '@testing-library/react';

const mockFetchBuilderContent = jest.fn();
const mockCanShowBuilderContent = jest.fn();

jest.mock('../../../app/lib/builder-utils', () => ({
	builderPublicApiKey: 'test-api-key',
	fetchBuilderContent: (...args: unknown[]) => mockFetchBuilderContent(...args),
	canShowBuilderContent: (...args: unknown[]) => mockCanShowBuilderContent(...args),
	extractSeoData: () => ({}),
	ConfigurationError: () => <div>Configuration Error</div>,
}));

jest.mock('../../../app/components/builder/builder-content', () => ({
	BuilderContent: ({content}: {content: unknown}) => (
		<div data-testid='builder-content'>{content ? 'Has Content' : 'No Content'}</div>
	),
}));

jest.mock('../../../app/components/layout/page-with-announcements', () => ({
	PageWithAnnouncements: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

jest.mock('../../../app/lib/seo', () => ({
	generateMetadata: jest.fn(),
	generateBreadcrumbSchema: () => ({}),
	JsonLd: () => null,
	siteConfig: {name: 'Test', description: 'Test desc'},
}));

jest.mock('next/navigation', () => ({
	notFound: jest.fn(),
}));

import Page from '../../../app/(main)/[...page]/page';
import {notFound} from 'next/navigation';

describe('[...page] Dynamic Route', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockCanShowBuilderContent.mockReturnValue(true);
	});

	it('renders page content when content exists', async () => {
		mockFetchBuilderContent.mockResolvedValue({content: {id: '123'}});

		const Component = await Page({
			params: Promise.resolve({page: ['about']}),
			searchParams: Promise.resolve({}),
		});

		render(Component);

		expect(screen.getByTestId('builder-content')).toBeInTheDocument();
		expect(screen.getByText('Has Content')).toBeInTheDocument();
	});

	it('calls notFound when content is not valid', async () => {
		mockFetchBuilderContent.mockResolvedValue({content: null});
		mockCanShowBuilderContent.mockReturnValue(false);

		await Page({
			params: Promise.resolve({page: ['non-existing-page']}),
			searchParams: Promise.resolve({}),
		});

		expect(notFound).toHaveBeenCalled();
	});

	it('fetches content for single segment path', async () => {
		mockFetchBuilderContent.mockResolvedValue({content: {id: '123'}});

		await Page({
			params: Promise.resolve({page: ['about']}),
			searchParams: Promise.resolve({}),
		});

		expect(mockFetchBuilderContent).toHaveBeenCalledWith('/about', {}, 'test-api-key');
	});

	it('fetches content for multi-segment path', async () => {
		mockFetchBuilderContent.mockResolvedValue({content: {id: '456'}});

		await Page({
			params: Promise.resolve({page: ['blog', 'posts', 'my-article']}),
			searchParams: Promise.resolve({}),
		});

		expect(mockFetchBuilderContent).toHaveBeenCalledWith('/blog/posts/my-article', {}, 'test-api-key');
	});

	it('fetches content for empty page array', async () => {
		mockFetchBuilderContent.mockResolvedValue({content: {id: '789'}});

		await Page({
			params: Promise.resolve({page: []}),
			searchParams: Promise.resolve({}),
		});

		expect(mockFetchBuilderContent).toHaveBeenCalledWith('/', {}, 'test-api-key');
	});

	it('passes search parameters to fetchBuilderContent', async () => {
		mockFetchBuilderContent.mockResolvedValue({content: {id: '123'}});

		await Page({
			params: Promise.resolve({page: ['page']}),
			searchParams: Promise.resolve({preview: 'true', locale: 'nl'}),
		});

		expect(mockFetchBuilderContent).toHaveBeenCalledWith('/page', {preview: 'true', locale: 'nl'}, 'test-api-key');
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
			canShowBuilderContent: jest.fn().mockReturnValue(true),
			extractSeoData: () => ({}),
			ConfigurationError: () => <div>Configuration Error</div>,
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

describe('[...page] dynamic export', () => {
	it('exports force-dynamic setting', async () => {
		const {dynamic} = await import('../../../app/(main)/[...page]/page');
		expect(dynamic).toBe('force-dynamic');
	});
});
