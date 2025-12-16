import {render, screen} from '@testing-library/react';
import {
	BuilderSectionServer,
	AnnouncementBarSectionServer,
	HeroSectionServer,
	CTASectionServer,
	FooterCTASectionServer,
	FAQSectionServer,
} from '../../../app/components/builder/builder-section-server';

// Mock Builder.io SDK
const mockFetchOneEntry = jest.fn();
jest.mock('@builder.io/sdk-react-nextjs', () => ({
	fetchOneEntry: (...args: unknown[]) => mockFetchOneEntry(...args),
}));

// Mock the client component
jest.mock('../../../app/components/builder/builder-section-client', () => ({
	BuilderSectionClient: jest.fn(({model}) => (
		<div data-testid='builder-section-client' data-model={model}>
			Rendered Section
		</div>
	)),
}));

describe('BuilderSectionServer', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders BuilderSectionClient when content is found', async () => {
		mockFetchOneEntry.mockResolvedValue({
			id: 'test-id',
			data: {title: 'Test'},
		});

		const {findByTestId} = render(await BuilderSectionServer({model: 'test-model'}));

		const client = await findByTestId('builder-section-client');
		expect(client).toBeInTheDocument();
		expect(client).toHaveAttribute('data-model', 'test-model');
	});

	it('returns null when content is not found', async () => {
		mockFetchOneEntry.mockResolvedValue(null);

		const result = await BuilderSectionServer({model: 'test-model'});

		expect(result).toBeNull();
	});

	it('passes urlPath to fetchOneEntry', async () => {
		mockFetchOneEntry.mockResolvedValue({id: 'test-id', data: {}});

		await BuilderSectionServer({model: 'test-model', urlPath: '/custom-path'});

		expect(mockFetchOneEntry).toHaveBeenCalledWith(
			expect.objectContaining({
				userAttributes: {
					urlPath: '/custom-path',
				},
			}),
		);
	});

	it('uses default urlPath when not provided', async () => {
		mockFetchOneEntry.mockResolvedValue({id: 'test-id', data: {}});

		await BuilderSectionServer({model: 'test-model'});

		expect(mockFetchOneEntry).toHaveBeenCalledWith(
			expect.objectContaining({
				userAttributes: {
					urlPath: '/',
				},
			}),
		);
	});
});

describe('Section Server Components', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockFetchOneEntry.mockResolvedValue({id: 'test-id', data: {}});
	});

	it('AnnouncementBarSectionServer uses announcement-bar model', async () => {
		render(await AnnouncementBarSectionServer());

		expect(mockFetchOneEntry).toHaveBeenCalledWith(
			expect.objectContaining({model: 'announcement-bar'}),
		);
	});

	it('HeroSectionServer uses hero-section model', async () => {
		render(await HeroSectionServer({}));

		expect(mockFetchOneEntry).toHaveBeenCalledWith(
			expect.objectContaining({model: 'hero-section'}),
		);
	});

	it('HeroSectionServer passes urlPath', async () => {
		render(await HeroSectionServer({urlPath: '/about'}));

		expect(mockFetchOneEntry).toHaveBeenCalledWith(
			expect.objectContaining({
				model: 'hero-section',
				userAttributes: {urlPath: '/about'},
			}),
		);
	});

	it('CTASectionServer uses cta-section model', async () => {
		render(await CTASectionServer({}));

		expect(mockFetchOneEntry).toHaveBeenCalledWith(
			expect.objectContaining({model: 'cta-section'}),
		);
	});

	it('FooterCTASectionServer uses footer-cta model', async () => {
		render(await FooterCTASectionServer());

		expect(mockFetchOneEntry).toHaveBeenCalledWith(
			expect.objectContaining({model: 'footer-cta'}),
		);
	});

	it('FAQSectionServer uses faq-section model', async () => {
		render(await FAQSectionServer({}));

		expect(mockFetchOneEntry).toHaveBeenCalledWith(
			expect.objectContaining({model: 'faq-section'}),
		);
	});
});
