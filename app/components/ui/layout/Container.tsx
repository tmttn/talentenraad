import type {ReactNode} from 'react';

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

type ContainerProps = {
	/** Container max-width size */
	size?: ContainerSize;
	/** Add horizontal padding */
	padding?: boolean;
	/** Center the container */
	center?: boolean;
	/** Additional CSS classes */
	className?: string;
	/** Container content */
	children: ReactNode;
	/** HTML element to render as */
	as?: 'div' | 'section' | 'article' | 'main' | 'aside';
};

const sizeClasses: Record<ContainerSize, string> = {
	sm: 'max-w-2xl', // 672px
	md: 'max-w-3xl', // 768px
	lg: 'max-w-5xl', // 1024px
	xl: 'max-w-6xl', // 1152px
	'2xl': 'max-w-7xl', // 1280px
	full: 'max-w-full',
};

/**
 * Container - Max-width wrapper with consistent padding
 *
 * Usage:
 * <Container size="lg">Content</Container>
 * <Container size="xl" padding={false}>Full-width content</Container>
 */
export function Container({
	size = 'xl',
	padding = true,
	center = true,
	className = '',
	children,
	as: Component = 'div',
}: ContainerProps) {
	const classes = [
		sizeClasses[size],
		padding && 'px-4 sm:px-6 lg:px-8',
		center && 'mx-auto',
		className,
	]
		.filter(Boolean)
		.join(' ');

	return <Component className={classes}>{children}</Component>;
}
