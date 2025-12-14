'use client';

type CTABannerProperties = {
	title: string;
	subtitle?: string;
	buttonText?: string;
	buttonLink?: string;
	variant?: 'default' | 'accent' | 'light';
};

function CTABanner({
	title,
	subtitle,
	buttonText = 'Neem contact op',
	buttonLink = '/contact',
	variant = 'default',
}: Readonly<CTABannerProperties>) {
	const variants = {
		default: {
			bg: 'bg-gray-900',
			title: 'text-white',
			subtitle: 'text-gray-300',
			button: 'bg-[#ea247b] text-white hover:bg-[#d91a6d]',
		},
		accent: {
			bg: 'bg-gradient-to-r from-[#ea247b] to-[#c4105f]',
			title: 'text-white',
			subtitle: 'text-white/80',
			button: 'bg-white text-[#ea247b] hover:bg-gray-100',
		},
		light: {
			bg: 'bg-gray-100',
			title: 'text-gray-900',
			subtitle: 'text-gray-600',
			button: 'bg-[#ea247b] text-white hover:bg-[#d91a6d]',
		},
	};

	const styles = variants[variant] || variants.default;

	return (
		<section className={`py-12 md:py-16 ${styles.bg}`} aria-labelledby="cta-title">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
				<h2 id="cta-title" className={`text-xl sm:text-2xl md:text-3xl font-bold mb-3 ${styles.title}`}>
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
						className={`inline-flex items-center gap-2 font-semibold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.button} ${variant === 'accent' ? 'focus:ring-white focus:ring-offset-[#ea247b]' : 'focus:ring-[#ea247b]'}`}
					>
						{buttonText}
						<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
						</svg>
					</a>
				)}
			</div>
		</section>
	);
}

export const CTABannerInfo = {
	name: 'CTABanner',
	component: CTABanner,
	inputs: [
		{name: 'title', type: 'string', required: true, defaultValue: 'Wil je meehelpen?'},
		{name: 'subtitle', type: 'string', defaultValue: 'Nieuwe ouders zijn altijd welkom bij de Talentenraad.'},
		{name: 'buttonText', type: 'string', defaultValue: 'Neem contact op'},
		{name: 'buttonLink', type: 'string', defaultValue: '/contact'},
		{name: 'variant', type: 'string', enum: ['default', 'accent', 'light'], defaultValue: 'default'},
	],
};
