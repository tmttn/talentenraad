import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {PhotoGalleryInfo} from '../../../app/features/gallery/photo-gallery';

// Mock scrollIntoView which is not available in JSDOM
Element.prototype.scrollIntoView = jest.fn();

const PhotoGallery = PhotoGalleryInfo.component;

const mockAssets = {
  results: [
    {
      id: '1', name: 'image-1.jpg', url: '/test-image-1.jpg', meta: {alt: 'Test image 1'},
    },
    {
      id: '2', name: 'image-2.jpg', url: '/test-image-2.jpg', meta: {alt: 'Test image 2'},
    },
    {
      id: '3', name: 'image-3.jpg', url: '/test-image-3.jpg', meta: {alt: 'Test image 3'},
    },
  ],
};

// Mock fetch globally
const mockFetch = jest.fn();
globalThis.fetch = mockFetch;

// Mock environment variable
const originalEnv = process.env;

describe('PhotoGallery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.style.overflow = '';
    process.env = {...originalEnv, NEXT_PUBLIC_BUILDER_API_KEY: 'test-api-key'};
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockAssets,
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Loading states', () => {
    it('shows loading state while fetching', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      render(<PhotoGallery folderPath='test-folder' />);
      expect(screen.getByText('Afbeeldingen laden...')).toBeInTheDocument();
    });

    it('shows empty folder message when no folderPath', () => {
      render(<PhotoGallery />);
      expect(screen.getByText('Selecteer een map in de instellingen')).toBeInTheDocument();
    });

    it('shows error state on fetch failure', async () => {
      mockFetch.mockResolvedValue({ok: false});
      render(<PhotoGallery folderPath='test-folder' />);

      await waitFor(() => {
        expect(screen.getByText('Kon afbeeldingen niet laden')).toBeInTheDocument();
      });
    });

    it('shows empty state when folder has no images', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({results: []}),
      });
      render(<PhotoGallery folderPath='test-folder' />);

      await waitFor(() => {
        expect(screen.getByText('Geen afbeeldingen gevonden in deze map')).toBeInTheDocument();
      });
    });
  });

  describe('Grid rendering', () => {
    it('renders all images from folder', async () => {
      render(<PhotoGallery folderPath='test-folder' />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(3);
      });
    });

    it('fetches from correct Builder.io URL', async () => {
      render(<PhotoGallery folderPath='my-gallery/photos' />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('cdn.builder.io/api/v1/assets'));
        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('query.folder=my-gallery%2Fphotos'));
      });
    });

    it('renders with correct column classes', async () => {
      const {container} = render(<PhotoGallery folderPath='test-folder' columns={4} />);

      await waitFor(() => {
        expect(container.querySelector(String.raw`.lg\:grid-cols-4`)).toBeInTheDocument();
      });
    });

    it('renders with correct gap classes', async () => {
      const {container} = render(<PhotoGallery folderPath='test-folder' gap='lg' />);

      await waitFor(() => {
        expect(container.querySelector('.gap-gap-md')).toBeInTheDocument();
      });
    });

    it('applies hover effect classes', async () => {
      const {container} = render(<PhotoGallery folderPath='test-folder' hoverEffect='zoom' />);

      await waitFor(() => {
        const image = container.querySelector('img');
        expect(image).toHaveClass('group-hover:scale-110');
      });
    });

    it('applies aspect ratio classes', async () => {
      const {container} = render(<PhotoGallery folderPath='test-folder' aspectRatio='landscape' />);

      await waitFor(() => {
        expect(container.querySelector('.aspect-video')).toBeInTheDocument();
      });
    });
  });

  describe('Lightbox functionality', () => {
    it('opens lightbox when clicking an image', async () => {
      const user = userEvent.setup();
      render(<PhotoGallery folderPath='test-folder' enableLightbox />);

      await waitFor(() => {
        expect(screen.getAllByRole('button')).toHaveLength(3);
      });

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('does not open lightbox when enableLightbox is false', async () => {
      const user = userEvent.setup();
      render(<PhotoGallery folderPath='test-folder' enableLightbox={false} />);

      await waitFor(() => {
        expect(screen.getAllByRole('img')).toHaveLength(3);
      });

      const images = screen.getAllByRole('img');
      await user.click(images[0]);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes lightbox when clicking close button', async () => {
      const user = userEvent.setup();
      render(<PhotoGallery folderPath='test-folder' enableLightbox />);

      await waitFor(() => {
        expect(screen.getAllByRole('button')).toHaveLength(3);
      });

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
      render(<PhotoGallery folderPath='test-folder' enableLightbox />);

      await waitFor(() => {
        expect(screen.getAllByRole('button')).toHaveLength(3);
      });

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
      render(<PhotoGallery folderPath='test-folder' enableLightbox />);

      await waitFor(() => {
        expect(screen.getAllByRole('button')).toHaveLength(3);
      });

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);

      expect(screen.getByText('1 / 3')).toBeInTheDocument();

      const nextButton = screen.getByLabelText('Volgende afbeelding');
      await user.click(nextButton);

      expect(screen.getByText('2 / 3')).toBeInTheDocument();
    });

    it('navigates to previous image with arrow button', async () => {
      const user = userEvent.setup();
      render(<PhotoGallery folderPath='test-folder' enableLightbox />);

      await waitFor(() => {
        expect(screen.getAllByRole('button')).toHaveLength(3);
      });

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[1]);

      expect(screen.getByText('2 / 3')).toBeInTheDocument();

      const prevButton = screen.getByLabelText('Vorige afbeelding');
      await user.click(prevButton);

      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('navigates with keyboard arrow keys', async () => {
      const user = userEvent.setup();
      render(<PhotoGallery folderPath='test-folder' enableLightbox />);

      await waitFor(() => {
        expect(screen.getAllByRole('button')).toHaveLength(3);
      });

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
      render(<PhotoGallery folderPath='test-folder' enableLightbox />);

      await waitFor(() => {
        expect(screen.getAllByRole('button')).toHaveLength(3);
      });

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[2]);

      expect(screen.getByText('3 / 3')).toBeInTheDocument();

      const nextButton = screen.getByLabelText('Volgende afbeelding');
      await user.click(nextButton);

      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('wraps around when navigating before first image', async () => {
      const user = userEvent.setup();
      render(<PhotoGallery folderPath='test-folder' enableLightbox />);

      await waitFor(() => {
        expect(screen.getAllByRole('button')).toHaveLength(3);
      });

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);

      expect(screen.getByText('1 / 3')).toBeInTheDocument();

      const prevButton = screen.getByLabelText('Vorige afbeelding');
      await user.click(prevButton);

      expect(screen.getByText('3 / 3')).toBeInTheDocument();
    });
  });

  describe('Zoom functionality', () => {
    it('shows zoom button when enableZoom is true', async () => {
      const user = userEvent.setup();
      render(<PhotoGallery folderPath='test-folder' enableLightbox enableZoom />);

      await waitFor(() => {
        expect(screen.getAllByRole('button')).toHaveLength(3);
      });

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);

      expect(screen.getByLabelText('Inzoomen')).toBeInTheDocument();
    });

    it('toggles zoom state when clicking zoom button', async () => {
      const user = userEvent.setup();
      render(<PhotoGallery folderPath='test-folder' enableLightbox enableZoom />);

      await waitFor(() => {
        expect(screen.getAllByRole('button')).toHaveLength(3);
      });

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);

      const zoomButton = screen.getByLabelText('Inzoomen');
      await user.click(zoomButton);

      expect(screen.getByLabelText('Uitzoomen')).toBeInTheDocument();
    });

    it('hides zoom button when enableZoom is false', async () => {
      const user = userEvent.setup();
      render(<PhotoGallery folderPath='test-folder' enableLightbox enableZoom={false} />);

      await waitFor(() => {
        expect(screen.getAllByRole('button')).toHaveLength(3);
      });

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);

      expect(screen.queryByLabelText('Inzoomen')).not.toBeInTheDocument();
    });
  });

  describe('Download functionality', () => {
    it('shows download button when enableDownload is true', async () => {
      const user = userEvent.setup();
      render(<PhotoGallery folderPath='test-folder' enableLightbox enableDownload />);

      await waitFor(() => {
        expect(screen.getAllByRole('button')).toHaveLength(3);
      });

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);

      expect(screen.getByLabelText('Download afbeelding')).toBeInTheDocument();
    });

    it('hides download button when enableDownload is false', async () => {
      const user = userEvent.setup();
      render(<PhotoGallery folderPath='test-folder' enableLightbox enableDownload={false} />);

      await waitFor(() => {
        expect(screen.getAllByRole('button')).toHaveLength(3);
      });

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);

      expect(screen.queryByLabelText('Download afbeelding')).not.toBeInTheDocument();
    });
  });

  describe('Thumbnails', () => {
    it('shows thumbnails when enableThumbnails is true', async () => {
      const user = userEvent.setup();
      render(<PhotoGallery folderPath='test-folder' enableLightbox enableThumbnails />);

      await waitFor(() => {
        expect(screen.getAllByRole('button')).toHaveLength(3);
      });

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);

      const thumbnailButtons = screen.getAllByLabelText(/Ga naar afbeelding/);
      expect(thumbnailButtons).toHaveLength(3);
    });

    it('hides thumbnails when enableThumbnails is false', async () => {
      const user = userEvent.setup();
      render(<PhotoGallery folderPath='test-folder' enableLightbox enableThumbnails={false} />);

      await waitFor(() => {
        expect(screen.getAllByRole('button')).toHaveLength(3);
      });

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);

      expect(screen.queryByLabelText('Ga naar afbeelding 1')).not.toBeInTheDocument();
    });

    it('navigates when clicking thumbnail', async () => {
      const user = userEvent.setup();
      render(<PhotoGallery folderPath='test-folder' enableLightbox enableThumbnails />);

      await waitFor(() => {
        expect(screen.getAllByRole('button')).toHaveLength(3);
      });

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
      render(<PhotoGallery folderPath='test-folder' enableLightbox />);

      await waitFor(() => {
        expect(screen.getAllByRole('button')).toHaveLength(3);
      });

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);

      const dialog = screen.getByRole('dialog');

      fireEvent.touchStart(dialog, {targetTouches: [{clientX: 300}]});
      fireEvent.touchMove(dialog, {targetTouches: [{clientX: 100}]});
      fireEvent.touchEnd(dialog);

      expect(screen.getByText('2 / 3')).toBeInTheDocument();
    });
  });

  describe('Keyboard accessibility', () => {
    it('allows keyboard activation of gallery items', async () => {
      const user = userEvent.setup();
      render(<PhotoGallery folderPath='test-folder' enableLightbox />);

      await waitFor(() => {
        expect(screen.getAllByRole('button')).toHaveLength(3);
      });

      const buttons = screen.getAllByRole('button');
      buttons[0].focus();
      await user.keyboard('{Enter}');

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has correct aria attributes on gallery items', async () => {
      render(<PhotoGallery folderPath='test-folder' enableLightbox />);

      await waitFor(() => {
        expect(screen.getAllByRole('button')).toHaveLength(3);
      });

      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveAttribute('aria-label', 'Bekijk Test image 1');
    });

    it('lightbox has correct aria attributes', async () => {
      const user = userEvent.setup();
      render(<PhotoGallery folderPath='test-folder' enableLightbox />);

      await waitFor(() => {
        expect(screen.getAllByRole('button')).toHaveLength(3);
      });

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
      render(<PhotoGallery folderPath='test-folder' enableLightbox />);

      await waitFor(() => {
        expect(screen.getAllByRole('button')).toHaveLength(3);
      });

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('unlocks body scroll when lightbox closes', async () => {
      const user = userEvent.setup();
      render(<PhotoGallery folderPath='test-folder' enableLightbox />);

      await waitFor(() => {
        expect(screen.getAllByRole('button')).toHaveLength(3);
      });

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

  it('has required folderPath input', () => {
    const folderInput = PhotoGalleryInfo.inputs.find(i => i.name === 'folderPath');
    expect(folderInput?.required).toBe(true);
    expect(folderInput?.type).toBe('string');
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
