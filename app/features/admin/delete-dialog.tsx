'use client';

import {useState, useEffect, useCallback} from 'react';

type DeleteDialogProps = {
	title: string;
	message: string;
	onConfirm: () => Promise<void>;
	onCancel: () => void;
};

function Spinner() {
	return (
		<svg className='animate-spin h-4 w-4' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
			<circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
			<path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
		</svg>
	);
}

export function DeleteDialog({title, message, onConfirm, onCancel}: DeleteDialogProps) {
	const [isDeleting, setIsDeleting] = useState(false);

	const handleConfirm = async () => {
		setIsDeleting(true);
		try {
			await onConfirm();
		} finally {
			setIsDeleting(false);
		}
	};

	// Handle escape key
	const handleKeyDown = useCallback((event: KeyboardEvent) => {
		if (event.key === 'Escape' && !isDeleting) {
			onCancel();
		}
	}, [isDeleting, onCancel]);

	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown);
		// Prevent body scroll when dialog is open
		document.body.style.overflow = 'hidden';

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.body.style.overflow = '';
		};
	}, [handleKeyDown]);

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
			<div
				className='absolute inset-0 bg-black/50 transition-opacity'
				onClick={isDeleting ? undefined : onCancel}
				aria-hidden='true'
			/>
			<div className='relative bg-white rounded-xl shadow-lg p-5 sm:p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-200'>
				<div className='flex items-start gap-4'>
					<div className='flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center'>
						<svg className='w-5 h-5 text-red-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
						</svg>
					</div>
					<div className='flex-1 min-w-0'>
						<h2 className='text-lg font-bold text-gray-900'>{title}</h2>
						<p className='mt-2 text-sm text-gray-600'>{message}</p>
					</div>
				</div>
				<div className='mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end'>
					<button
						type='button'
						onClick={onCancel}
						disabled={isDeleting}
						className='w-full sm:w-auto px-4 py-2.5 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-300'
					>
						Annuleren
					</button>
					<button
						type='button'
						onClick={handleConfirm}
						disabled={isDeleting}
						className='w-full sm:w-auto px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
					>
						{isDeleting ? (
							<>
								<Spinner />
								Verwijderen...
							</>
						) : (
							'Verwijderen'
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
