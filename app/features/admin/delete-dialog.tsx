'use client';

import {useState} from 'react';

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

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center'>
			<div
				className='absolute inset-0 bg-black/50'
				onClick={onCancel}
				onKeyDown={e => {
					if (e.key === 'Escape') onCancel();
				}}
				role='button'
				tabIndex={0}
				aria-label='Sluiten'
			/>
			<div className='relative bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4'>
				<h2 className='text-xl font-bold text-gray-800 mb-2'>{title}</h2>
				<p className='text-gray-600 mb-6'>{message}</p>
				<div className='flex gap-3 justify-end'>
					<button
						type='button'
						onClick={onCancel}
						disabled={isDeleting}
						className='px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50'
					>
						Annuleren
					</button>
					<button
						type='button'
						onClick={handleConfirm}
						disabled={isDeleting}
						className='px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2'
					>
						{isDeleting ? (
							<>
								<span className='animate-spin'>&#8987;</span>
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
