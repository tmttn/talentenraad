'use client';

import {useState, useEffect, useCallback} from 'react';
import {Loader2, AlertTriangle} from 'lucide-react';

type DeleteDialogProps = {
	title: string;
	message: string;
	onConfirm: () => Promise<void>;
	onCancel: () => void;
};

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
						<AlertTriangle className='w-5 h-5 text-red-600' />
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
								<Loader2 className='w-4 h-4 animate-spin' />
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
