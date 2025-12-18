'use client';

import {
	useState,
	useCallback,
	useEffect,
	useRef,
} from 'react';
import Image from 'next/image';
import {
	X,
	ChevronLeft,
	ChevronRight,
	ZoomIn,
	ZoomOut,
	Download,
	Maximize2,
	Loader2,
} from 'lucide-react';

type GalleryImage = {
	src: string;
	alt?: string;
	caption?: string;
	width?: number;
	height?: number;
};

type BuilderAsset = {
	id: string;
	name: string;
	url: string;
	meta?: {
		width?: number;
		height?: number;
		alt?: string;
	};
};

// eslint-disable-next-line n/prefer-global/process
const builderApiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

type PhotoGalleryProperties = {
	folderPath?: string;
	layout?: 'grid' | 'masonry';
	columns?: 2 | 3 | 4;
	gap?: 'sm' | 'md' | 'lg';
	showCaptions?: boolean;
	enableLightbox?: boolean;
	enableZoom?: boolean;
	enableDownload?: boolean;
	enableThumbnails?: boolean;
	aspectRatio?: 'square' | 'landscape' | 'portrait' | 'auto';
	hoverEffect?: 'none' | 'zoom' | 'fade' | 'slide';
};

const gapClasses: Record<string, string> = {
	sm: 'gap-2',
	md: 'gap-4',
	lg: 'gap-6',
};

const columnClasses: Record<string, string> = {
	cols2: 'grid-cols-1 sm:grid-cols-2',
	cols3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
	cols4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
};

const aspectRatioClasses: Record<string, string> = {
	square: 'aspect-square',
	landscape: 'aspect-video',
	portrait: 'aspect-[3/4]',
	auto: '',
};

const hoverEffectClasses: Record<string, string> = {
	none: '',
	zoom: 'group-hover:scale-110',
	fade: 'group-hover:opacity-80',
	slide: 'group-hover:translate-y-[-4px]',
};

// Lightbox component to reduce complexity
type LightboxProperties = {
	images: GalleryImage[];
	currentIndex: number;
	showCaptions: boolean;
	enableZoom: boolean;
	enableDownload: boolean;
	enableThumbnails: boolean;
	isZoomed: boolean;
	onClose: () => void;
	onPrevious: () => void;
	onNext: () => void;
	onToggleZoom: () => void;
	onSelectImage: (index: number) => void;
	onTouchStart: (event: React.TouchEvent) => void;
	onTouchMove: (event: React.TouchEvent) => void;
	onTouchEnd: () => void;
	// eslint-disable-next-line @typescript-eslint/no-restricted-types -- React refs require null
	thumbnailsRef: React.RefObject<HTMLDivElement | null>;
};

function Lightbox({
	images,
	currentIndex,
	showCaptions,
	enableZoom,
	enableDownload,
	enableThumbnails,
	isZoomed,
	onClose,
	onPrevious,
	onNext,
	onToggleZoom,
	onSelectImage,
	onTouchStart,
	onTouchMove,
	onTouchEnd,
	thumbnailsRef,
}: Readonly<LightboxProperties>) {
	const currentImage = images[currentIndex];

	const handleDownload = useCallback(() => {
		if (!currentImage) {
			return;
		}

		const link = document.createElement('a');
		link.href = currentImage.src;
		link.download = currentImage.alt ?? `image-${currentIndex + 1}`;
		link.target = '_blank';
		document.body.append(link);
		link.click();
		link.remove();
	}, [currentImage, currentIndex]);

	if (!currentImage) {
		return null;
	}

	const getCursorClass = () => {
		if (isZoomed) {
			return 'cursor-zoom-out';
		}

		if (enableZoom) {
			return 'cursor-zoom-in';
		}

		return '';
	};

	const getThumbnailClass = (index: number) => {
		if (index === currentIndex) {
			return 'ring-2 ring-white ring-offset-2 ring-offset-black';
		}

		return 'opacity-50 hover:opacity-100';
	};

	return (
		<div
			className='fixed inset-0 z-50 bg-black/95 flex flex-col'
			role='dialog'
			aria-modal='true'
			aria-label='Afbeelding lightbox'
			onTouchStart={onTouchStart}
			onTouchMove={onTouchMove}
			onTouchEnd={onTouchEnd}
		>
			{/* Top bar */}
			<div className='flex items-center justify-between p-4 text-white'>
				<div className='flex items-center gap-2'>
					<span className='text-sm font-medium'>
						{currentIndex + 1} / {images.length}
					</span>
				</div>

				<div className='flex items-center gap-2'>
					{enableZoom && (
						<button
							type='button'
							onClick={onToggleZoom}
							className='p-2 hover:bg-white/10 rounded-lg transition-colors'
							aria-label={isZoomed ? 'Uitzoomen' : 'Inzoomen'}
						>
							{isZoomed
								? <ZoomOut className='w-5 h-5' strokeWidth={1.5} />
								: <ZoomIn className='w-5 h-5' strokeWidth={1.5} />}
						</button>
					)}

					{enableDownload && (
						<button
							type='button'
							onClick={handleDownload}
							className='p-2 hover:bg-white/10 rounded-lg transition-colors'
							aria-label='Download afbeelding'
						>
							<Download className='w-5 h-5' strokeWidth={1.5} />
						</button>
					)}

					<button
						type='button'
						onClick={onClose}
						className='p-2 hover:bg-white/10 rounded-lg transition-colors'
						aria-label='Sluit lightbox'
					>
						<X className='w-5 h-5' strokeWidth={1.5} />
					</button>
				</div>
			</div>

			{/* Main image area */}
			<div className='flex-1 flex items-center justify-center relative overflow-hidden'>
				<button
					type='button'
					onClick={onPrevious}
					className='absolute left-4 z-10 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors text-white'
					aria-label='Vorige afbeelding'
				>
					<ChevronLeft className='w-6 h-6' strokeWidth={1.5} />
				</button>

				<div
					className={`relative w-full h-full flex items-center justify-center p-4 ${getCursorClass()}`}
					onClick={onToggleZoom}
				>
					<Image
						src={currentImage.src}
						alt={currentImage.alt ?? `Afbeelding ${currentIndex + 1}`}
						fill
						sizes='100vw'
						className={`object-contain transition-transform duration-300 ${isZoomed ? 'scale-150' : 'scale-100'}`}
						priority
					/>
				</div>

				<button
					type='button'
					onClick={onNext}
					className='absolute right-4 z-10 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors text-white'
					aria-label='Volgende afbeelding'
				>
					<ChevronRight className='w-6 h-6' strokeWidth={1.5} />
				</button>
			</div>

			{/* Caption */}
			{showCaptions && currentImage.caption && (
				<div className='text-center text-white p-4 bg-black/50'>
					<p className='text-sm md:text-base'>{currentImage.caption}</p>
				</div>
			)}

			{/* Thumbnails strip */}
			{enableThumbnails && images.length > 1 && (
				<div className='bg-black/80 p-3'>
					<div
						ref={thumbnailsRef}
						className='flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent pb-1'
					>
						{images.map((image, index) => (
							<button
								key={index}
								type='button'
								onClick={() => {
									onSelectImage(index);
								}}
								className={`relative flex-shrink-0 w-16 h-16 rounded overflow-hidden transition-all duration-200 ${getThumbnailClass(index)}`}
								aria-label={`Ga naar afbeelding ${index + 1}`}
								aria-current={index === currentIndex ? 'true' : undefined}
							>
								<Image
									src={image.src}
									alt=''
									fill
									sizes='64px'
									className='object-cover'
								/>
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

// Gallery item component
type GalleryItemProperties = {
	image: GalleryImage;
	index: number;
	enableLightbox: boolean;
	aspectRatio: string;
	layout: string;
	hoverEffect: string;
	showCaptions: boolean;
	isLoaded: boolean;
	onOpen: (index: number) => void;
	onLoad: (index: number) => void;
};

function GalleryItem({
	image,
	index,
	enableLightbox,
	aspectRatio,
	layout,
	hoverEffect,
	showCaptions,
	isLoaded,
	onOpen,
	onLoad,
}: Readonly<GalleryItemProperties>) {
	const getContainerClasses = () => {
		const classes = ['group relative overflow-hidden bg-gray-100 rounded-lg'];

		if (enableLightbox) {
			classes.push('cursor-pointer');
		}

		if (aspectRatio !== 'auto') {
			classes.push(aspectRatioClasses[aspectRatio]);
		}

		if (layout === 'masonry' && index % 3 === 0) {
			classes.push('row-span-2');
		}

		return classes.join(' ');
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onOpen(index);
		}
	};

	return (
		<div
			className={getContainerClasses()}
			onClick={() => {
				onOpen(index);
			}}
			onKeyDown={handleKeyDown}
			tabIndex={enableLightbox ? 0 : undefined}
			role={enableLightbox ? 'button' : undefined}
			aria-label={enableLightbox ? `Bekijk ${image.alt ?? `afbeelding ${index + 1}`}` : undefined}
		>
			{/* Loading skeleton */}
			{!isLoaded && (
				<div className='absolute inset-0 bg-gray-200 animate-pulse' />
			)}

			{/* Image */}
			<Image
				src={image.src}
				alt={image.alt ?? `Galerij afbeelding ${index + 1}`}
				fill
				sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
				className={`object-cover transition-all duration-300 ${hoverEffectClasses[hoverEffect]} ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
				onLoad={() => {
					onLoad(index);
				}}
			/>

			{/* Hover overlay */}
			{enableLightbox && (
				<div className='absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center'>
					<Maximize2
						className='w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300'
						strokeWidth={1.5}
					/>
				</div>
			)}

			{/* Caption overlay (grid view) */}
			{showCaptions && image.caption && (
				<div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8'>
					<p className='text-white text-sm line-clamp-2'>{image.caption}</p>
				</div>
			)}
		</div>
	);
}

function PhotoGallery({
	folderPath,
	layout = 'grid',
	columns = 3,
	gap = 'md',
	showCaptions = true,
	enableLightbox = true,
	enableZoom = true,
	enableDownload = false,
	enableThumbnails = true,
	aspectRatio = 'square',
	hoverEffect = 'zoom',
}: Readonly<PhotoGalleryProperties>) {
	const [images, setImages] = useState<GalleryImage[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | undefined>(undefined);
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isZoomed, setIsZoomed] = useState(false);
	const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
	const [touchStart, setTouchStart] = useState<number | undefined>(undefined);
	const [touchEnd, setTouchEnd] = useState<number | undefined>(undefined);
	const thumbnailsRef = useRef<HTMLDivElement>(null);

	const minSwipeDistance = 50;

	// Fetch images from Builder.io folder
	useEffect(() => {
		if (!folderPath) {
			setImages([]);
			return;
		}

		const fetchImages = async () => {
			setLoading(true);
			setError(undefined);

			try {
				if (!builderApiKey) {
					throw new Error('Builder API key not configured');
				}

				// Fetch assets from the specified folder
				const url = `https://cdn.builder.io/api/v1/assets?apiKey=${builderApiKey}&query.folder=${encodeURIComponent(folderPath)}&limit=100`;
				const response = await fetch(url);

				if (!response.ok) {
					throw new Error('Failed to fetch images');
				}

				const data = await response.json() as {results: BuilderAsset[]};
				const assets = data.results ?? [];

				// Filter for image files and convert to GalleryImage format
				const galleryImages: GalleryImage[] = assets
					.filter(asset => /\.(jpe?g|png|gif|webp|avif)$/i.test(asset.name))
					.map(asset => ({
						src: asset.url,
						alt: asset.meta?.alt ?? asset.name.replace(/\.[^.]+$/, ''),
						width: asset.meta?.width,
						height: asset.meta?.height,
					}));

				setImages(galleryImages);
			} catch {
				setError('Kon afbeeldingen niet laden');
				setImages([]);
			} finally {
				setLoading(false);
			}
		};

		void fetchImages();
	}, [folderPath]);

	const openLightbox = useCallback((index: number) => {
		if (!enableLightbox) {
			return;
		}

		setCurrentIndex(index);
		setLightboxOpen(true);
		setIsZoomed(false);
		document.body.style.overflow = 'hidden';
	}, [enableLightbox]);

	const closeLightbox = useCallback(() => {
		setLightboxOpen(false);
		setIsZoomed(false);
		document.body.style.overflow = '';
	}, []);

	const goToPrevious = useCallback(() => {
		setCurrentIndex(previous => (previous === 0 ? images.length - 1 : previous - 1));
		setIsZoomed(false);
	}, [images.length]);

	const goToNext = useCallback(() => {
		setCurrentIndex(previous => (previous === images.length - 1 ? 0 : previous + 1));
		setIsZoomed(false);
	}, [images.length]);

	const toggleZoom = useCallback(() => {
		if (!enableZoom) {
			return;
		}

		setIsZoomed(previous => !previous);
	}, [enableZoom]);

	const selectImage = useCallback((index: number) => {
		setCurrentIndex(index);
		setIsZoomed(false);
	}, []);

	// Keyboard navigation
	useEffect(() => {
		if (!lightboxOpen) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			switch (event.key) {
				case 'Escape': {
					closeLightbox();
					break;
				}

				case 'ArrowLeft': {
					goToPrevious();
					break;
				}

				case 'ArrowRight': {
					goToNext();
					break;
				}

				case ' ': {
					event.preventDefault();
					toggleZoom();
					break;
				}

				default: {
					break;
				}
			}
		};

		globalThis.addEventListener('keydown', handleKeyDown);
		return () => {
			globalThis.removeEventListener('keydown', handleKeyDown);
		};
	}, [lightboxOpen, closeLightbox, goToPrevious, goToNext, toggleZoom]);

	// Scroll thumbnail into view
	useEffect(() => {
		if (!lightboxOpen || !enableThumbnails || !thumbnailsRef.current) {
			return;
		}

		const thumbnail = thumbnailsRef.current.children[currentIndex] as HTMLElement | undefined;
		thumbnail?.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'center'});
	}, [currentIndex, lightboxOpen, enableThumbnails]);

	// Touch handlers for swipe
	const onTouchStart = useCallback((event: React.TouchEvent) => {
		setTouchEnd(undefined);
		setTouchStart(event.targetTouches[0].clientX);
	}, []);

	const onTouchMove = useCallback((event: React.TouchEvent) => {
		setTouchEnd(event.targetTouches[0].clientX);
	}, []);

	const onTouchEnd = useCallback(() => {
		if (touchStart === undefined || touchEnd === undefined) {
			return;
		}

		const distance = touchStart - touchEnd;
		const isLeftSwipe = distance > minSwipeDistance;
		const isRightSwipe = distance < -minSwipeDistance;

		if (isLeftSwipe) {
			goToNext();
		} else if (isRightSwipe) {
			goToPrevious();
		}
	}, [touchStart, touchEnd, goToNext, goToPrevious]);

	const handleImageLoad = useCallback((index: number) => {
		setLoadedImages(previous => new Set(previous).add(index));
	}, []);

	if (loading) {
		return (
			<div className='flex items-center justify-center py-12 text-gray-500'>
				<Loader2 className='w-8 h-8 animate-spin mr-2' />
				<span>Afbeeldingen laden...</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className='text-center py-12 text-red-500'>
				{error}
			</div>
		);
	}

	if (!folderPath) {
		return (
			<div className='text-center py-12 text-gray-500'>
				Selecteer een map in de instellingen
			</div>
		);
	}

	if (images.length === 0) {
		return (
			<div className='text-center py-12 text-gray-500'>
				Geen afbeeldingen gevonden in deze map
			</div>
		);
	}

	return (
		<>
			<div className={`grid ${columnClasses[`cols${columns}`]} ${gapClasses[gap]} ${layout === 'masonry' ? 'auto-rows-auto' : ''}`}>
				{images.map((image, index) => (
					<GalleryItem
						key={index}
						image={image}
						index={index}
						enableLightbox={enableLightbox}
						aspectRatio={aspectRatio}
						layout={layout}
						hoverEffect={hoverEffect}
						showCaptions={showCaptions}
						isLoaded={loadedImages.has(index)}
						onOpen={openLightbox}
						onLoad={handleImageLoad}
					/>
				))}
			</div>

			{lightboxOpen && (
				<Lightbox
					images={images}
					currentIndex={currentIndex}
					showCaptions={showCaptions}
					enableZoom={enableZoom}
					enableDownload={enableDownload}
					enableThumbnails={enableThumbnails}
					isZoomed={isZoomed}
					onClose={closeLightbox}
					onPrevious={goToPrevious}
					onNext={goToNext}
					onToggleZoom={toggleZoom}
					onSelectImage={selectImage}
					onTouchStart={onTouchStart}
					onTouchMove={onTouchMove}
					onTouchEnd={onTouchEnd}
					thumbnailsRef={thumbnailsRef}
				/>
			)}
		</>
	);
}

export const PhotoGalleryInfo = {
	name: 'PhotoGallery',
	component: PhotoGallery,
	image: 'https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
	inputs: [
		{
			name: 'folderPath',
			type: 'string',
			required: true,
			helperText: 'Mapnaam in de Builder.io asset bibliotheek (bijv. "galerij/fotos")',
		},
		{
			name: 'layout',
			type: 'string',
			enum: [
				{label: 'Grid', value: 'grid'},
				{label: 'Masonry', value: 'masonry'},
			],
			defaultValue: 'grid',
			helperText: 'Kies het grid type',
		},
		{
			name: 'columns',
			type: 'number',
			enum: [
				{label: '2 kolommen', value: 2},
				{label: '3 kolommen', value: 3},
				{label: '4 kolommen', value: 4},
			],
			defaultValue: 3,
			helperText: 'Aantal kolommen',
		},
		{
			name: 'gap',
			type: 'string',
			enum: [
				{label: 'Klein', value: 'sm'},
				{label: 'Middel', value: 'md'},
				{label: 'Groot', value: 'lg'},
			],
			defaultValue: 'md',
			helperText: 'Ruimte tussen afbeeldingen',
		},
		{
			name: 'aspectRatio',
			type: 'string',
			enum: [
				{label: 'Vierkant (1:1)', value: 'square'},
				{label: 'Landschap (16:9)', value: 'landscape'},
				{label: 'Portret (3:4)', value: 'portrait'},
				{label: 'Origineel', value: 'auto'},
			],
			defaultValue: 'square',
			helperText: 'Beeldverhouding van thumbnails',
		},
		{
			name: 'hoverEffect',
			type: 'string',
			enum: [
				{label: 'Geen', value: 'none'},
				{label: 'Zoom', value: 'zoom'},
				{label: 'Fade', value: 'fade'},
				{label: 'Schuif', value: 'slide'},
			],
			defaultValue: 'zoom',
			helperText: 'Hover effect op afbeeldingen',
		},
		{
			name: 'showCaptions',
			type: 'boolean',
			defaultValue: true,
			helperText: 'Toon bijschriften',
		},
		{
			name: 'enableLightbox',
			type: 'boolean',
			defaultValue: true,
			helperText: 'Klik om afbeelding groot te bekijken',
		},
		{
			name: 'enableZoom',
			type: 'boolean',
			defaultValue: true,
			helperText: 'Zoom functie in lightbox',
		},
		{
			name: 'enableDownload',
			type: 'boolean',
			defaultValue: false,
			helperText: 'Download knop in lightbox',
		},
		{
			name: 'enableThumbnails',
			type: 'boolean',
			defaultValue: true,
			helperText: 'Thumbnail strip in lightbox',
		},
	],
	defaultStyles: {
		marginTop: '20px',
		marginBottom: '20px',
	},
};
