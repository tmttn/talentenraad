'use client';

// CSS for button arrow animations
const buttonStyles = `
	.cta-button {
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.cta-button-arrow {
		transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.cta-button:hover .cta-button-arrow {
		transform: translateX(4px);
	}
`;

type CtaButtonProperties = {
	text?: string;
	href?: string;
	variant?: 'primary' | 'secondary' | 'outline' | 'white';
	size?: 'sm' | 'md' | 'lg';
	showArrow?: boolean;
};

const variantStyles = {
	primary: 'bg-primary text-white hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/25 focus:ring-primary',
	secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/20 focus:ring-white',
	outline: 'bg-transparent border-2 border-white text-white hover:bg-white/10 focus:ring-white',
	white: 'bg-white text-gray-900 hover:bg-gray-100 focus:ring-white',
};

const sizeStyles = {
	sm: 'py-2 px-4 text-sm gap-2',
	md: 'py-3 px-6 text-base gap-2',
	lg: 'py-4 px-8 text-lg gap-3',
};

const arrowSizes = {
	sm: 'h-4 w-4',
	md: 'h-5 w-5',
	lg: 'h-5 w-5',
};

function CtaButton({
	text = 'Klik hier',
	href = '#',
	variant = 'primary',
	size = 'md',
	showArrow = true,
}: Readonly<CtaButtonProperties>) {
	const arrow = (
		<svg
			className={`cta-button-arrow ${arrowSizes[size]} flex-shrink-0`}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
			aria-hidden='true'
		>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
		</svg>
	);

	const baseClasses = `cta-button inline-flex items-center justify-center font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${variantStyles[variant]} ${sizeStyles[size]}`;

	return (
		<>
			<style dangerouslySetInnerHTML={{__html: buttonStyles}} />
			<a href={href} className={baseClasses}>
				{text}
				{showArrow && arrow}
			</a>
		</>
	);
}

export const CtaButtonInfo = {
	name: 'CTAButton',
	component: CtaButton,
	inputs: [
		{
			name: 'text',
			type: 'string',
			defaultValue: 'Klik hier',
			helperText: 'Tekst op de knop',
		},
		{
			name: 'href',
			type: 'string',
			defaultValue: '#',
			helperText: 'Link URL (bijv. /contact of https://...)',
		},
		{
			name: 'variant',
			type: 'string',
			enum: ['primary', 'secondary', 'outline', 'white'],
			defaultValue: 'primary',
			helperText: 'primary: roze, secondary: transparant met rand, outline: witte rand, white: witte achtergrond',
		},
		{
			name: 'size',
			type: 'string',
			enum: ['sm', 'md', 'lg'],
			defaultValue: 'md',
			helperText: 'Grootte van de knop',
		},
		{
			name: 'showArrow',
			type: 'boolean',
			defaultValue: true,
			helperText: 'Toon pijl icoon',
		},
	],
};
