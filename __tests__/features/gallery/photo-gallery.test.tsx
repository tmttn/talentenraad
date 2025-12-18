import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {PhotoGalleryInfo} from '../../../app/features/gallery/photo-gallery';

// Mock scrollIntoView which is not available in JSDOM
Element.prototype.scrollIntoView = jest.fn();

const PhotoGallery = PhotoGalleryInfo.component;

const mockImages = [
	{src: '/test-image-1.jpg', alt: 'Test image 1', caption: 'Caption 1'},
	{src: '/test-image-2.jpg', alt: 'Test image 2', caption: 'Caption 2'},
	{src: '/test-image-3.jpg', alt: 'Test image 3', caption: 'Caption 3'},
];

describe('PhotoGallery', () => {
	beforeEach(() => {
		// Reset body overflow
		document.body.style.overflow = '';
	});

	describe('Grid rendering', () => {
		it('renders all images in the gallery', () => {
			render(<PhotoGallery images={mockImages} />);

			const images = screen.getAllByRole('img');
			expect(images).toHaveLength(3);
		});

		it('shows empty state when no images provided', () => {
			render(<PhotoGallery images={[]} />);
			expect(screen.getByText('Geen afbeeldingen om weer te geven')).toBeInTheDocument();
		});

		it('renders with correct column classes', () => {
			const {container} = render(<PhotoGallery images={mockImages} columns={4} />);
			expect(container.querySelector('.lg\\:grid-cols-4')).toBeInTheDocument();
		});

		it('renders with correct gap classes', () => {
			const {container} = render(<PhotoGallery images={mockImages} gap='lg' />);
			expect(container.querySelector('.gap-6')).toBeInTheDocument();
		});

		it('renders captions when showCaptions is true', () => {
			render(<PhotoGallery images={mockImages} showCaptions />);
			expect(screen.getByText('Caption 1')).toBeInTheDocument();
		});

		it('hides captions when showCaptions is false', () => {
			render(<PhotoGallery images={mockImages} showCaptions={false} />);
			expect(screen.queryByText('Caption 1')).not.toBeInTheDocument();
		});

		it('applies hover effect classes', () => {
			const {container} = render(<PhotoGallery images={mockImages} hoverEffect='zoom' />);
			const image = container.querySelector('img');
			expect(image).toHaveClass('group-hover:scale-110');
		});

		it('applies aspect ratio classes', () => {
			const {container} = render(<PhotoGallery images={mockImages} aspectRatio='landscape' />);
			expect(container.querySelector('.aspect-video')).toBeInTheDocument();
		});
	});

	describe('Lightbox functionality', () => {
		it('opens lightbox when clicking an image', async () => {
			const user = userEvent.setup();
			render(<PhotoGallery images={mockImages} enableLightbox />);

			const buttons = screen.getAllByRole('button');
			await user.click(buttons[0]);

			expect(screen.getByRole('dialog')).toBeInTheDocument();
			expect(screen.getByText('1 / 3')).toBeInTheDocument();
		});

		it('does not open lightbox when enableLightbox is false', async () => {
			const user = userEvent.setup();
			render(<PhotoGallery images={mockImages} enableLightbox={false} />);

			const images = screen.getAllByRole('img');
			await user.click(images[0]);

			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		});

		it('closes lightbox when clicking close button', async () => {
			const user = userEvent.setup();
			render(<PhotoGallery images={mockImages} enableLightbox />);

			const buttons = screen.getAllByRole('button');
			await user.click(buttons[0]);

			const closeButton = screen.getByLabelText('Sluit lightbox');
			await user.click(closeButton);

			await waitFor(() => {
				expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
			});
		});

		it('closes lightbox on Escape key', async () => {
			const user = userEvent.setup();
			render(<PhotoGallery images={mockImages} enableLightbox />);

			const buttons = screen.getAllByRole('button');
			await user.click(buttons[0]);

			expect(screen.getByRole('dialog')).toBeInTheDocument();

			await user.keyboard('{Escape}');

			await waitFor(() => {
				expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
			});
		});

		it('navigates to next image with arrow button', async () => {
			const user = userEvent.setup();
			render(<PhotoGallery images={mockImages} enableLightbox />);

			const buttons = screen.getAllByRole('button');
			await user.click(buttons[0]);

			expect(screen.getByText('1 / 3')).toBeInTheDocument();

			const nextButton = screen.getByLabelText('Volgende afbeelding');
			await user.click(nextButton);

			expect(screen.getByText('2 / 3')).toBeInTheDocument();
		});

		it('navigates to previous image with arrow button', async () => {
			const user = userEvent.setup();
			render(<PhotoGallery images={mockImages} enableLightbox />);

			const buttons = screen.getAllByRole('button');
			await user.click(buttons[1]); // Start at second image

			expect(screen.getByText('2 / 3')).toBeInTheDocument();

			const prevButton = screen.getByLabelText('Vorige afbeelding');
			await user.click(prevButton);

			expect(screen.getByText('1 / 3')).toBeInTheDocument();
		});

		it('navigates with keyboard arrow keys', async () => {
			const user = userEvent.setup();
			render(<PhotoGallery images={mockImages} enableLightbox />);

			const buttons = screen.getAllByRole('button');
			await user.click(buttons[0]);

			expect(screen.getByText('1 / 3')).toBeInTheDocument();

			await user.keyboard('{ArrowRight}');
			expect(screen.getByText('2 / 3')).toBeInTheDocument();

			await user.keyboard('{ArrowLeft}');
			expect(screen.getByText('1 / 3')).toBeInTheDocument();
		});

		it('wraps around when navigating past last image', async () => {
			const user = userEvent.setup();
			render(<PhotoGallery images={mockImages} enableLightbox />);

			const buttons = screen.getAllByRole('button');
			await user.click(buttons[2]); // Start at third (last) image

			expect(screen.getByText('3 / 3')).toBeInTheDocument();

			const nextButton = screen.getByLabelText('Volgende afbeelding');
			await user.click(nextButton);

			expect(screen.getByText('1 / 3')).toBeInTheDocument();
		});

		it('wraps around when navigating before first image', async () => {
			const user = userEvent.setup();
			render(<PhotoGallery images={mockImages} enableLightbox />);

			const buttons = screen.getAllByRole('button');
			await user.click(buttons[0]); // Start at first image

			expect(screen.getByText('1 / 3')).toBeInTheDocument();

			const prevButton = screen.getByLabelText('Vorige afbeelding');
			await user.click(prevButton);

			expect(screen.getByText('3 / 3')).toBeInTheDocument();
		});

		it('shows captions in lightbox when enabled', async () => {
			const user = userEvent.setup();
			render(<PhotoGallery images={mockImages} enableLightbox showCaptions />);

			const buttons = screen.getAllByRole('button');
			await user.click(buttons[0]);

			// Caption should appear in lightbox
			const captionElements = screen.getAllByText('Caption 1');
			expect(captionElements.length).toBeGreaterThan(0);
		});
	});

	describe('Zoom functionality', () => {
		it('shows zoom button when enableZoom is true', async () => {
			const user = userEvent.setup();
			render(<PhotoGallery images={mockImages} enableLightbox enableZoom />);

			const buttons = screen.getAllByRole('button');
			await user.click(buttons[0]);

			expect(screen.getByLabelText('Inzoomen')).toBeInTheDocument();
		});

		it('toggles zoom state when clicking zoom button', async () => {
			const user = userEvent.setup();
			render(<PhotoGallery images={mockImages} enableLightbox enableZoom />);

			const buttons = screen.getAllByRole('button');
			await user.click(buttons[0]);

			const zoomButton = screen.getByLabelText('Inzoomen');
			await user.click(zoomButton);

			expect(screen.getByLabelText('Uitzoomen')).toBeInTheDocument();
		});

		it('hides zoom button when enableZoom is false', async () => {
			const user = userEvent.setup();
			render(<PhotoGallery images={mockImages} enableLightbox enableZoom={false} />);

			const buttons = screen.getAllByRole('button');
			await user.click(buttons[0]);

			expect(screen.queryByLabelText('Inzoomen')).not.toBeInTheDocument();
		});
	});

	describe('Download functionality', () => {
		it('shows download button when enableDownload is true', async () => {
			const user = userEvent.setup();
			render(<PhotoGallery images={mockImages} enableLightbox enableDownload />);

			const buttons = screen.getAllByRole('button');
			await user.click(buttons[0]);

			expect(screen.getByLabelText('Download afbeelding')).toBeInTheDocument();
		});

		it('hides download button when enableDownload is false', async () => {
			const user = userEvent.setup();
			render(<PhotoGallery images={mockImages} enableLightbox enableDownload={false} />);

			const buttons = screen.getAllByRole('button');
			await user.click(buttons[0]);

			expect(screen.queryByLabelText('Download afbeelding')).not.toBeInTheDocument();
		});
	});

	describe('Thumbnails', () => {
		it('shows thumbnails when enableThumbnails is true', async () => {
			const user = userEvent.setup();
			render(<PhotoGallery images={mockImages} enableLightbox enableThumbnails />);

			const buttons = screen.getAllByRole('button');
			await user.click(buttons[0]);

			// Thumbnails should be visible in lightbox
			const thumbnailButtons = screen.getAllByLabelText(/Ga naar afbeelding/);
			expect(thumbnailButtons).toHaveLength(3);
		});

		it('hides thumbnails when enableThumbnails is false', async () => {
			const user = userEvent.setup();
			render(<PhotoGallery images={mockImages} enableLightbox enableThumbnails={false} />);

			const buttons = screen.getAllByRole('button');
			await user.click(buttons[0]);

			expect(screen.queryByLabelText('Ga naar afbeelding 1')).not.toBeInTheDocument();
		});

		it('navigates when clicking thumbnail', async () => {
			const user = userEvent.setup();
			render(<PhotoGallery images={mockImages} enableLightbox enableThumbnails />);

			const buttons = screen.getAllByRole('button');
			await user.click(buttons[0]);

			expect(screen.getByText('1 / 3')).toBeInTheDocument();

			const thumbnail3 = screen.getByLabelText('Ga naar afbeelding 3');
			await user.click(thumbnail3);

			expect(screen.getByText('3 / 3')).toBeInTheDocument();
		});
	});

	describe('Touch/swipe support', () => {
		it('handles touch events for swipe navigation', async () => {
			const user = userEvent.setup();
			render(<PhotoGallery images={mockImages} enableLightbox />);

			const buttons = screen.getAllByRole('button');
			await user.click(buttons[0]);

			const dialog = screen.getByRole('dialog');

			// Simulate left swipe (next)
			fireEvent.touchStart(dialog, {targetTouches: [{clientX: 300}]});
			fireEvent.touchMove(dialog, {targetTouches: [{clientX: 100}]});
			fireEvent.touchEnd(dialog);

			expect(screen.getByText('2 / 3')).toBeInTheDocument();
		});
	});

	describe('Keyboard accessibility', () => {
		it('allows keyboard activation of gallery items', async () => {
			const user = userEvent.setup();
			render(<PhotoGallery images={mockImages} enableLightbox />);

			const buttons = screen.getAllByRole('button');
			buttons[0].focus();
			await user.keyboard('{Enter}');

			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});

		it('has correct aria attributes on gallery items', () => {
			render(<PhotoGallery images={mockImages} enableLightbox />);

			const buttons = screen.getAllByRole('button');
			expect(buttons[0]).toHaveAttribute('aria-label', 'Bekijk Test image 1');
		});

		it('lightbox has correct aria attributes', async () => {
			const user = userEvent.setup();
			render(<PhotoGallery images={mockImages} enableLightbox />);

			const buttons = screen.getAllByRole('button');
			await user.click(buttons[0]);

			const dialog = screen.getByRole('dialog');
			expect(dialog).toHaveAttribute('aria-modal', 'true');
			expect(dialog).toHaveAttribute('aria-label', 'Afbeelding lightbox');
		});
	});

	describe('Body scroll lock', () => {
		it('locks body scroll when lightbox opens', async () => {
			const user = userEvent.setup();
			render(<PhotoGallery images={mockImages} enableLightbox />);

			const buttons = screen.getAllByRole('button');
			await user.click(buttons[0]);

			expect(document.body.style.overflow).toBe('hidden');
		});

		it('unlocks body scroll when lightbox closes', async () => {
			const user = userEvent.setup();
			render(<PhotoGallery images={mockImages} enableLightbox />);

			const buttons = screen.getAllByRole('button');
			await user.click(buttons[0]);

			const closeButton = screen.getByLabelText('Sluit lightbox');
			await user.click(closeButton);

			await waitFor(() => {
				expect(document.body.style.overflow).toBe('');
			});
		});
	});
});

describe('PhotoGalleryInfo', () => {
	it('exports correct component info', () => {
		expect(PhotoGalleryInfo.name).toBe('PhotoGallery');
		expect(PhotoGalleryInfo.component).toBeDefined();
		expect(PhotoGalleryInfo.inputs).toBeInstanceOf(Array);
	});

	it('has required images input', () => {
		const imagesInput = PhotoGalleryInfo.inputs.find(i => i.name === 'images');
		expect(imagesInput?.required).toBe(true);
		expect(imagesInput?.type).toBe('list');
	});

	it('has correct default values', () => {
		const layoutInput = PhotoGalleryInfo.inputs.find(i => i.name === 'layout');
		const columnsInput = PhotoGalleryInfo.inputs.find(i => i.name === 'columns');
		const enableLightboxInput = PhotoGalleryInfo.inputs.find(i => i.name === 'enableLightbox');

		expect(layoutInput?.defaultValue).toBe('grid');
		expect(columnsInput?.defaultValue).toBe(3);
		expect(enableLightboxInput?.defaultValue).toBe(true);
	});
});
