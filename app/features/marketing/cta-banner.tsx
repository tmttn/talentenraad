'use client';

// CSS for CTA button animations
const ctaStyles = `
	.cta-button {
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.cta-arrow {
		transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.cta-button:hover .cta-arrow {
		transform: translateX(4px);
	}
`;

type CtaBannerProperties = {
	title: string;
	subtitle?: string;
	buttonText?: string;
	buttonLink?: string;
	variant?: 'default' | 'accent' | 'light';
};

function CtaBanner({
	title,
	subtitle,
	buttonText = 'Neem contact op',
	buttonLink = '/contact',
	variant = 'default',
}: Readonly<CtaBannerProperties>) {
	const variants = {
		default: {
			bg: 'bg-gray-900',
			title: 'text-white',
			subtitle: 'text-gray-300',
			button: 'bg-primary text-white hover:bg-primary-hover',
		},
		accent: {
			bg: 'bg-gradient-to-r from-brand-primary-500 to-brand-primary-700',
			title: 'text-white',
			subtitle: 'text-white/80',
			button: 'bg-white text-primary hover:bg-gray-100',
		},
		light: {
			bg: 'bg-gray-100',
			title: 'text-gray-900',
			subtitle: 'text-gray-600',
			button: 'bg-primary text-white hover:bg-primary-hover',
		},
	};

	const styles = variants[variant] || variants.default;

	return (
		<section className={`py-12 md:py-16 ${styles.bg}`} aria-labelledby='cta-title'>
			<style dangerouslySetInnerHTML={{__html: ctaStyles}} />
			<div className='max-w-4xl mx-auto px-4 sm:px-6 text-center'>
				<h2 id='cta-title' className={`text-xl sm:text-2xl md:text-3xl font-bold mb-3 ${styles.title}`}>
					{title}
				</h2>
				{subtitle && (
					<p className={`text-sm sm:text-base md:text-lg mb-6 max-w-xl mx-auto ${styles.subtitle}`}>
						{subtitle}
					</p>
				)}
				{buttonText && buttonLink && (
					<a
						href={buttonLink}
						className={[
							'cta-button inline-flex items-center gap-2 font-semibold py-3 px-6 rounded-lg',
							'focus:outline-none focus:ring-2 focus:ring-offset-2',
							styles.button,
							variant === 'accent' ? 'focus:ring-white focus:ring-offset-brand-primary-500' : 'focus:ring-focus',
						].join(' ')}
					>
						{buttonText}
						<svg className='cta-arrow w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
						</svg>
					</a>
				)}
			</div>
		</section>
	);
}

export const CtaBannerInfo = {
	name: 'CTABanner',
	component: CtaBanner,
	inputs: [
		{
			name: 'title', type: 'string', required: true, defaultValue: 'Wil je meehelpen?',
		},
		{name: 'subtitle', type: 'string', defaultValue: 'Nieuwe ouders zijn altijd welkom bij de Talentenraad.'},
		{name: 'buttonText', type: 'string', defaultValue: 'Neem contact op'},
		{name: 'buttonLink', type: 'string', defaultValue: '/contact'},
		{
			name: 'variant', type: 'string', enum: ['default', 'accent', 'light'], defaultValue: 'default',
		},
	],
};
