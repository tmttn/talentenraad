'use client';

import {useState, useEffect, useCallback, useRef} from 'react';
import {Loader2, X, Search, ImageIcon, Check, Upload} from 'lucide-react';

type Asset = {
	id: string;
	name: string;
	url: string;
	meta?: {
		width?: number;
		height?: number;
	};
};

type ImagePickerProps = {
	value?: string;
	onChange: (url: string) => void;
	label?: string;
	helpText?: string;
};

type ImagePickerModalProps = {
	onSelect: (url: string) => void;
	onClose: () => void;
	currentValue?: string;
};

function ImagePickerModal({onSelect, onClose, currentValue}: ImagePickerModalProps) {
	const [assets, setAssets] = useState<Asset[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [search, setSearch] = useState('');
	const [selectedUrl, setSelectedUrl] = useState<string | null>(currentValue ?? null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const fetchAssets = useCallback(async (searchTerm: string) => {
		setIsLoading(true);
		setError(null);

		try {
			const params = new URLSearchParams();
			if (searchTerm) {
				params.set('search', searchTerm);
			}

			params.set('limit', '100');

			const response = await fetch(`/api/admin/assets?${params.toString()}`);

			if (!response.ok) {
				throw new Error('Kon afbeeldingen niet laden');
			}

			const data = await response.json() as {assets: Asset[]};
			setAssets(data.assets);
		} catch {
			setError('Er ging iets mis bij het laden van afbeeldingen');
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchAssets('');
	}, [fetchAssets]);

	// Debounced search
	useEffect(() => {
		const timer = setTimeout(() => {
			fetchAssets(search);
		}, 300);

		return () => {
			clearTimeout(timer);
		};
	}, [search, fetchAssets]);

	// Handle escape key
	const handleKeyDown = useCallback((event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			onClose();
		}
	}, [onClose]);

	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown);
		document.body.style.overflow = 'hidden';

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.body.style.overflow = '';
		};
	}, [handleKeyDown]);

	const handleConfirm = () => {
		if (selectedUrl) {
			onSelect(selectedUrl);
		}
	};

	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setIsUploading(true);
		setUploadError(null);

		try {
			const formData = new FormData();
			formData.append('file', file);

			const response = await fetch('/api/admin/assets/upload', {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				const data = await response.json() as {error?: string};
				throw new Error(data.error ?? 'Upload mislukt');
			}

			const data = await response.json() as {url: string; name: string};

			// Refresh assets list and select the new image
			await fetchAssets(search);
			setSelectedUrl(data.url);
		} catch (error_) {
			const message = error_ instanceof Error ? error_.message : 'Upload mislukt';
			setUploadError(message);
		} finally {
			setIsUploading(false);
			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		}
	};

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
			<div
				className='absolute inset-0 bg-black/50 transition-opacity'
				onClick={onClose}
				aria-hidden='true'
			/>
			<div className='relative bg-white rounded-card shadow-elevated w-full max-w-4xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-fast'>
				{/* Header */}
				<div className='flex items-center justify-between px-5 py-4 border-b'>
					<h2 className='text-lg font-bold text-gray-900'>Kies een afbeelding</h2>
					<button
						type='button'
						onClick={onClose}
						className='p-2 text-gray-400 hover:text-gray-600 rounded-button hover:bg-gray-100 transition-colors'
					>
						<X className='w-5 h-5' />
					</button>
				</div>

				{/* Search and Upload */}
				<div className='px-5 py-3 border-b'>
					<div className='flex gap-3'>
						<div className='relative flex-1'>
							<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
							<input
								type='text'
								value={search}
								onChange={e => {
									setSearch(e.target.value);
								}}
								placeholder='Zoek afbeeldingen...'
								className='w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-button focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none'
							/>
						</div>
						<input
							ref={fileInputRef}
							type='file'
							accept='image/jpeg,image/png,image/gif,image/webp,image/svg+xml'
							onChange={handleFileChange}
							className='hidden'
						/>
						<button
							type='button'
							onClick={handleUploadClick}
							disabled={isUploading}
							className='flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-button hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
						>
							{isUploading ? (
								<Loader2 className='w-5 h-5 animate-spin' />
							) : (
								<Upload className='w-5 h-5' />
							)}
							<span className='hidden sm:inline'>{isUploading ? 'Uploaden...' : 'Uploaden'}</span>
						</button>
					</div>
					{uploadError && (
						<p className='mt-2 text-sm text-red-600'>{uploadError}</p>
					)}
				</div>

				{/* Content */}
				<div className='flex-1 overflow-y-auto p-5'>
					{isLoading ? (
						<div className='flex items-center justify-center py-12'>
							<Loader2 className='w-8 h-8 animate-spin text-primary' />
						</div>
					) : error ? (
						<div className='text-center py-12'>
							<p className='text-red-600'>{error}</p>
							<button
								type='button'
								onClick={() => {
									fetchAssets(search);
								}}
								className='mt-4 text-primary hover:underline'
							>
								Opnieuw proberen
							</button>
						</div>
					) : assets.length === 0 ? (
						<div className='text-center py-12'>
							<ImageIcon className='w-12 h-12 text-gray-300 mx-auto mb-3' />
							<p className='text-gray-500'>
								{search ? 'Geen afbeeldingen gevonden' : 'Nog geen afbeeldingen in de bibliotheek'}
							</p>
						</div>
					) : (
						<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
							{assets.map(asset => {
								const isSelected = selectedUrl === asset.url;
								return (
									<button
										key={asset.id}
										type='button'
										onClick={() => {
											setSelectedUrl(asset.url);
										}}
										onDoubleClick={() => {
											onSelect(asset.url);
										}}
										className={`relative aspect-square rounded-button overflow-hidden border-2 transition-all hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 ${
											isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'
										}`}
									>
										<img
											src={asset.url}
											alt={asset.name}
											className='w-full h-full object-cover'
											loading='lazy'
										/>
										{isSelected && (
											<div className='absolute inset-0 bg-primary/20 flex items-center justify-center'>
												<div className='w-8 h-8 rounded-full bg-primary flex items-center justify-center'>
													<Check className='w-5 h-5 text-white' />
												</div>
											</div>
										)}
										<div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2'>
											<p className='text-xs text-white truncate'>{asset.name}</p>
										</div>
									</button>
								);
							})}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className='flex items-center justify-between px-5 py-4 border-t bg-gray-50'>
					<p className='text-sm text-gray-500'>
						{selectedUrl ? 'Dubbelklik om te selecteren' : 'Selecteer een afbeelding'}
					</p>
					<div className='flex gap-3'>
						<button
							type='button'
							onClick={onClose}
							className='px-4 py-2 text-gray-700 font-medium rounded-button border border-gray-300 hover:bg-gray-100 transition-colors'
						>
							Annuleren
						</button>
						<button
							type='button'
							onClick={handleConfirm}
							disabled={!selectedUrl}
							className='px-4 py-2 bg-primary text-white font-medium rounded-button hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
						>
							Selecteren
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export function ImagePicker({value, onChange, label, helpText}: ImagePickerProps) {
	const [showModal, setShowModal] = useState(false);

	const handleSelect = (url: string) => {
		onChange(url);
		setShowModal(false);
	};

	const handleClear = () => {
		onChange('');
	};

	return (
		<div>
			{label && (
				<label className='block text-sm font-semibold text-gray-800 mb-2'>
					{label}
				</label>
			)}

			{value ? (
				<div className='relative'>
					<div className='border-2 border-gray-300 rounded-button overflow-hidden'>
						<img
							src={value}
							alt='Geselecteerde afbeelding'
							className='w-full h-48 object-cover'
						/>
					</div>
					<div className='mt-3 flex gap-2'>
						<button
							type='button'
							onClick={() => {
								setShowModal(true);
							}}
							className='flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-button hover:bg-gray-50 transition-colors'
						>
							Andere afbeelding kiezen
						</button>
						<button
							type='button'
							onClick={handleClear}
							className='px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-button hover:bg-red-50 transition-colors'
						>
							Verwijderen
						</button>
					</div>
				</div>
			) : (
				<button
					type='button'
					onClick={() => {
						setShowModal(true);
					}}
					className='w-full h-48 border-2 border-dashed border-gray-300 rounded-button flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-primary hover:text-primary transition-colors'
				>
					<ImageIcon className='w-10 h-10' />
					<span className='text-sm font-medium'>Klik om een afbeelding te kiezen</span>
				</button>
			)}

			{helpText && (
				<p className='mt-1.5 text-sm text-gray-500'>{helpText}</p>
			)}

			{showModal && (
				<ImagePickerModal
					onSelect={handleSelect}
					onClose={() => {
						setShowModal(false);
					}}
					currentValue={value}
				/>
			)}
		</div>
	);
}
