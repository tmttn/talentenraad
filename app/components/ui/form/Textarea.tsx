import type {TextareaHTMLAttributes} from 'react';
import {forwardRef} from 'react';

type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

type TextareaProps = {
	/** Resize behavior */
	resize?: TextareaResize;
	/** Error state */
	error?: boolean;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

const resizeClasses: Record<TextareaResize, string> = {
	none: 'resize-none',
	vertical: 'resize-y',
	horizontal: 'resize-x',
	both: 'resize',
};

/**
 * Textarea - Multi-line text input
 *
 * Usage:
 * <Textarea rows={4} placeholder="Enter message" />
 * <Textarea resize="vertical" error />
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	({resize = 'vertical', error = false, className = '', disabled, ...props}, ref) => {
		const classes = [
			'w-full rounded-input border px-3 py-2 text-base transition-colors duration-fast',
			'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
			'placeholder:text-gray-400',
			resizeClasses[resize],
			error
				? 'border-red-300 focus:border-red-500 focus:ring-red-200'
				: 'border-gray-300 hover:border-gray-400',
			disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
			className,
		]
			.filter(Boolean)
			.join(' ');

		return <textarea ref={ref} className={classes} disabled={disabled} {...props} />;
	},
);

Textarea.displayName = 'Textarea';
