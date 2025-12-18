import type {ReactNode} from 'react';

type SectionSpacing = 'none' | 'sm' | 'md' | 'lg';
type SectionBackground = 'transparent' | 'white' | 'gray' | 'primary' | 'secondary' | 'accent';

type SectionProps = {
	/** Vertical padding size */
	spacing?: SectionSpacing;
	/** Background color/style */
	background?: SectionBackground;
	/** Additional CSS classes */
	className?: string;
	/** Section content */
	children: ReactNode;
	/** HTML element to render as */
	as?: 'section' | 'div' | 'article' | 'aside';
	/** Accessible label for the section */
	ariaLabel?: string;
	/** ID for the section (for skip links) */
	id?: string;
};

const spacingClasses: Record<SectionSpacing, string> = {
	none: '',
	sm: 'py-section-sm', // 48px
	md: 'py-section-md', // 80px
	lg: 'py-section-lg', // 112px
};

const backgroundClasses: Record<SectionBackground, string> = {
	transparent: '',
	white: 'bg-white',
	gray: 'bg-gray-50',
	primary: 'bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 text-white',
	secondary: 'bg-gradient-to-br from-brand-secondary-400 to-brand-secondary-500 text-white',
	accent: 'bg-gradient-to-br from-brand-accent-400 to-brand-accent-500 text-white',
};

/**
 * Section - Page section with consistent vertical padding
 *
 * Usage:
 * <Section spacing="md">Content</Section>
 * <Section spacing="lg" background="gray">Gray background section</Section>
 */
export function Section({
	spacing = 'md',
	background = 'transparent',
	className = '',
	children,
	as: Component = 'section',
	ariaLabel,
	id,
}: SectionProps) {
	const classes = [spacingClasses[spacing], backgroundClasses[background], className]
		.filter(Boolean)
		.join(' ');

	return (
		<Component id={id} className={classes} aria-label={ariaLabel}>
			{children}
		</Component>
	);
}
