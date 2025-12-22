import {render, screen, waitFor} from '@testing-library/react';
import {SponsorBannerInfo} from '../../../app/features/sponsors/sponsor-banner';

const SponsorBanner = SponsorBannerInfo.component;

// Mock fetch for sponsor data
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
	observe: () => null,
	unobserve: () => null,
	disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

describe('SponsorBanner', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockFetch.mockReset();
	});

	it('renders nothing when hidden is true', () => {
		const {container} = render(<SponsorBanner hidden />);
		expect(container.firstChild).toBeNull();
	});

	it('renders nothing when loading', () => {
		mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
		const {container} = render(<SponsorBanner />);
		expect(container.firstChild).toBeNull();
	});

	it('renders nothing when no sponsors are returned', async () => {
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({results: []}),
		});

		const {container} = render(<SponsorBanner />);

		await waitFor(() => {
			expect(mockFetch).toHaveBeenCalled();
		});

		expect(container.firstChild).toBeNull();
	});

	it('renders sponsor content when sponsors are available', async () => {
		const mockSponsor = {
			id: 'sponsor-1',
			name: 'Test Sponsor',
			data: {
				naam: 'Test Sponsor',
				logo: 'https://example.com/logo.png',
				website: 'https://example.com',
				beschrijving: 'A test sponsor',
				tier: 'gold' as const,
				actief: true,
				volgorde: 1,
			},
		};

		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({results: [mockSponsor]}),
		});

		render(<SponsorBanner />);

		await waitFor(() => {
			expect(screen.getByText('Met dank aan onze sponsors')).toBeInTheDocument();
		});

		expect(screen.getByText('Goud')).toBeInTheDocument();
		expect(screen.getByAltText('Test Sponsor')).toBeInTheDocument();
	});

	it('uses custom title when provided', async () => {
		const mockSponsor = {
			id: 'sponsor-1',
			name: 'Test Sponsor',
			data: {
				naam: 'Test Sponsor',
				logo: 'https://example.com/logo.png',
				tier: 'silver' as const,
				actief: true,
			},
		};

		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({results: [mockSponsor]}),
		});

		render(<SponsorBanner title="Onze Partners" />);

		await waitFor(() => {
			expect(screen.getByText('Onze Partners')).toBeInTheDocument();
		});
	});

	it('hides tier badge when showTierBadge is false', async () => {
		const mockSponsor = {
			id: 'sponsor-1',
			name: 'Test Sponsor',
			data: {
				naam: 'Test Sponsor',
				logo: 'https://example.com/logo.png',
				tier: 'gold' as const,
				actief: true,
			},
		};

		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({results: [mockSponsor]}),
		});

		render(<SponsorBanner showTierBadge={false} />);

		await waitFor(() => {
			expect(screen.getByText('Met dank aan onze sponsors')).toBeInTheDocument();
		});

		expect(screen.queryByText('Goud')).not.toBeInTheDocument();
	});

	it('renders in minimal variant without title', async () => {
		const mockSponsor = {
			id: 'sponsor-1',
			name: 'Test Sponsor',
			data: {
				naam: 'Test Sponsor',
				logo: 'https://example.com/logo.png',
				tier: 'bronze' as const,
				actief: true,
			},
		};

		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({results: [mockSponsor]}),
		});

		render(<SponsorBanner variant="minimal" />);

		await waitFor(() => {
			expect(screen.getByAltText('Test Sponsor')).toBeInTheDocument();
		});

		expect(screen.queryByText('Met dank aan onze sponsors')).not.toBeInTheDocument();
		expect(screen.queryByText('Brons')).not.toBeInTheDocument();
	});

	it('shows navigation dots for multiple sponsors', async () => {
		const mockSponsors = [
			{
				id: 'sponsor-1',
				name: 'Sponsor 1',
				data: {
					naam: 'Sponsor 1',
					logo: 'https://example.com/logo1.png',
					tier: 'gold' as const,
					actief: true,
				},
			},
			{
				id: 'sponsor-2',
				name: 'Sponsor 2',
				data: {
					naam: 'Sponsor 2',
					logo: 'https://example.com/logo2.png',
					tier: 'silver' as const,
					actief: true,
				},
			},
		];

		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({results: mockSponsors}),
		});

		render(<SponsorBanner />);

		await waitFor(() => {
			expect(screen.getByLabelText('Ga naar sponsor 1')).toBeInTheDocument();
		});

		expect(screen.getByLabelText('Ga naar sponsor 2')).toBeInTheDocument();
	});

	it('exports correct component info', () => {
		expect(SponsorBannerInfo.name).toBe('SponsorBanner');
		expect(SponsorBannerInfo.inputs).toHaveLength(5);
		expect(SponsorBannerInfo.inputs.map(i => i.name)).toEqual([
			'hidden',
			'rotationInterval',
			'showTierBadge',
			'variant',
			'title',
		]);
	});
});
