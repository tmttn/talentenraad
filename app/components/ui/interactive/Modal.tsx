'use client';

import type {ReactNode} from 'react';
import {useEffect, useCallback} from 'react';
import {createPortal} from 'react-dom';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

type ModalProps = {
	/** Whether the modal is open */
	open: boolean;
	/** Callback when modal should close */
	onClose: () => void;
	/** Modal title */
	title?: string;
	/** Modal size */
	size?: ModalSize;
	/** Modal content */
	children: ReactNode;
	/** Close on overlay click */
	closeOnOverlayClick?: boolean;
	/** Close on escape key */
	closeOnEscape?: boolean;
	/** Show close button */
	showCloseButton?: boolean;
	/** Additional CSS classes for the modal content */
	className?: string;
};

/**
 * Modal size classes
 * Maps to max-width values for different modal sizes
 */
const sizeClasses: Record<ModalSize, string> = {
	sm: 'max-w-md',
	md: 'max-w-lg',
	lg: 'max-w-2xl',
	xl: 'max-w-4xl',
	full: 'max-w-full mx-4',
};

/**
 * Modal - Dialog overlay component
 *
 * Uses design tokens:
 * - Border radius: rounded-modal
 * - Shadow: shadow-overlay
 * - Transitions: duration-slow
 * - Padding: p-component-md (body)
 * - Close button: rounded-button, duration-fast
 *
 * Usage:
 * <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Confirm">
 *   <p>Are you sure?</p>
 *   <button onClick={() => setIsOpen(false)}>Cancel</button>
 * </Modal>
 */
export function Modal({
	open,
	onClose,
	title,
	size = 'md',
	children,
	closeOnOverlayClick = true,
	closeOnEscape = true,
	showCloseButton = true,
	className = '',
}: ModalProps) {
	// Handle escape key
	const handleEscape = useCallback(
		(event: KeyboardEvent) => {
			if (event.key === 'Escape' && closeOnEscape) {
				onClose();
			}
		},
		[onClose, closeOnEscape],
	);

	// Handle body scroll lock and escape key
	useEffect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
			document.addEventListener('keydown', handleEscape);

			return () => {
				document.body.style.overflow = '';
				document.removeEventListener('keydown', handleEscape);
			};
		}
	}, [open, handleEscape]);

	// Handle overlay click
	const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
		if (event.target === event.currentTarget && closeOnOverlayClick) {
			onClose();
		}
	};

	if (!open) return null;

	const modalContent = (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			role="dialog"
			aria-modal="true"
			aria-labelledby={title ? 'modal-title' : undefined}
		>
			{/* Overlay - uses duration-slow token for transition */}
			<div
				className="fixed inset-0 bg-black/50 transition-opacity duration-slow"
				onClick={handleOverlayClick}
				aria-hidden="true"
			/>

			{/* Modal content - uses rounded-modal, shadow-overlay, duration-slow tokens */}
			<div
				className={[
					'relative z-10 w-full rounded-modal bg-white shadow-overlay',
					'animate-in fade-in zoom-in-95 duration-slow',
					sizeClasses[size],
					className,
				]
					.filter(Boolean)
					.join(' ')}
			>
				{/* Header - uses component padding tokens */}
				{(title || showCloseButton) && (
					<div className="flex items-center justify-between border-b border-gray-200 px-component-md py-component-sm">
						{title && (
							<h2 id="modal-title" className="text-lg font-semibold text-gray-900">
								{title}
							</h2>
						)}
						{showCloseButton && (
							<button
								type="button"
								onClick={onClose}
								className="ml-auto rounded-button p-1 text-gray-400 transition-colors duration-fast hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20"
								aria-label="Sluiten"
							>
								<svg
									className="h-5 w-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						)}
					</div>
				)}

				{/* Body - uses p-component-md token for consistent padding */}
				<div className="p-component-md">{children}</div>
			</div>
		</div>
	);

	// Use portal to render at document root
	if (typeof window !== 'undefined') {
		return createPortal(modalContent, document.body);
	}

	return null;
}
