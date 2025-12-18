type SpinnerSize = 'sm' | 'md' | 'lg';
type SpinnerColor = 'primary' | 'secondary' | 'white' | 'gray';

type SpinnerProps = {
	/** Size of the spinner */
	size?: SpinnerSize;
	/** Color of the spinner */
	color?: SpinnerColor;
	/** Accessible label */
	label?: string;
	/** Additional CSS classes */
	className?: string;
};

const sizeClasses: Record<SpinnerSize, string> = {
	sm: 'h-4 w-4 border-2',
	md: 'h-6 w-6 border-2',
	lg: 'h-8 w-8 border-3',
};

const colorClasses: Record<SpinnerColor, string> = {
	primary: 'border-primary/30 border-t-primary',
	secondary: 'border-secondary/30 border-t-secondary',
	white: 'border-white/30 border-t-white',
	gray: 'border-gray-300 border-t-gray-600',
};

/**
 * Spinner - Loading indicator
 *
 * Usage:
 * <Spinner />
 * <Spinner size="lg" color="primary" />
 * <Spinner label="Loading content..." />
 */
export function Spinner({
	size = 'md',
	color = 'primary',
	label = 'Laden...',
	className = '',
}: SpinnerProps) {
	const classes = [
		'animate-spin rounded-full',
		sizeClasses[size],
		colorClasses[color],
		className,
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div role="status" aria-label={label}>
			<div className={classes} />
			<span className="sr-only">{label}</span>
		</div>
	);
}
