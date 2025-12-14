'use client';

import {brandColors, gradients} from '../styles/tokens';

type HeroProperties = {
	title: string;
	subtitle?: string;
	backgroundImage?: string;
	ctaText?: string;
	ctaLink?: string;
	secondaryCtaText?: string;
	secondaryCtaLink?: string;
	variant?: 'default' | 'centered' | 'split';
	size?: 'compact' | 'small' | 'medium' | 'large';
};

function Hero({
	title,
	subtitle,
	backgroundImage,
	ctaText = 'Bekijk activiteiten',
	ctaLink = '/kalender',
	secondaryCtaText,
	secondaryCtaLink,
	variant = 'centered',
	size = 'medium',
}: Readonly<HeroProperties>) {
	const sizeClasses = {
		compact: 'py-12 md:py-16',
		small: 'py-16 md:py-20',
		medium: 'py-20 md:py-28',
		large: 'py-28 md:py-36',
	};

	const titleClasses = {
		compact: 'text-2xl md:text-3xl lg:text-4xl',
		small: 'text-3xl md:text-4xl lg:text-5xl',
		medium: 'text-4xl md:text-5xl lg:text-6xl',
		large: 'text-4xl md:text-5xl lg:text-6xl',
	};

	const subtitleClasses = {
		compact: 'text-base md:text-lg',
		small: 'text-base md:text-lg',
		medium: 'text-lg md:text-xl',
		large: 'text-lg md:text-xl',
	};

	if (variant === 'split') {
		return (
			<section className={`relative bg-gradient-to-br from-brand-primary-500 to-brand-primary-700 overflow-hidden ${sizeClasses[size]}`} aria-labelledby='hero-title-split'>
				<div className='absolute inset-0 opacity-10' aria-hidden='true'>
					<div className='absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl' />
					<div className='absolute bottom-10 right-20 w-96 h-96 bg-white rounded-full blur-3xl' />
				</div>
				<div className='relative max-w-6xl mx-auto px-6'>
					<div className='max-w-2xl'>
						<h1 id='hero-title-split' className={`${titleClasses[size]} font-bold text-white leading-tight mb-4 md:mb-6`}>
							{title}
						</h1>
						{subtitle && (
							<p className={`${subtitleClasses[size]} text-white/90 mb-6 md:mb-8 leading-relaxed`}>
								{subtitle}
							</p>
						)}
						{(ctaText || secondaryCtaText) && (
							<div className='flex flex-wrap gap-4'>
								{ctaText && ctaLink && (
									<a
										href={ctaLink}
										className='inline-flex items-center gap-2 bg-white text-primary font-semibold py-3 px-6 rounded-lg transition-all hover:bg-gray-100 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-primary-500'
									>
										{ctaText}
										<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
											<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
										</svg>
									</a>
								)}
								{secondaryCtaText && secondaryCtaLink && (
									<a
										href={secondaryCtaLink}
										className='inline-flex items-center gap-2 bg-white/10 text-white font-semibold py-3 px-6 rounded-lg transition-all hover:bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-primary-500'
									>
										{secondaryCtaText}
									</a>
								)}
							</div>
						)}
					</div>
				</div>
			</section>
		);
	}

	return (
		<section
			className={`relative overflow-hidden ${sizeClasses[size]}`}
			style={{
				background: backgroundImage
					? `linear-gradient(color-mix(in srgb, ${brandColors.primary.shade500} 90%, transparent), color-mix(in srgb, ${brandColors.primary.shade700} 90%, transparent)), url(${backgroundImage}) center/cover`
					: gradients.primary,
			}}
			aria-labelledby='hero-title'
		>
			{/* Subtle decorative elements */}
			<div className='absolute inset-0 overflow-hidden pointer-events-none' aria-hidden='true'>
				<div className='absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full' />
				<div className='absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-white/5 rounded-full' />
			</div>

			<div className='relative max-w-4xl mx-auto px-6 text-center'>
				<h1 id='hero-title' className={`${titleClasses[size]} font-bold text-white leading-tight mb-4 md:mb-6`}>
					{title}
				</h1>
				{subtitle && (
					<p className={`${subtitleClasses[size]} text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed`}>
						{subtitle}
					</p>
				)}
				{(ctaText || secondaryCtaText) && (
					<div className='flex flex-wrap justify-center gap-4'>
						{ctaText && ctaLink && (
							<a
								href={ctaLink}
								className='inline-flex items-center gap-2 bg-white text-primary font-semibold py-3 px-6 rounded-lg transition-all hover:bg-gray-100 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-primary-500'
							>
								{ctaText}
								<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
								</svg>
							</a>
						)}
						{secondaryCtaText && secondaryCtaLink && (
							<a
								href={secondaryCtaLink}
								className='inline-flex items-center gap-2 bg-white/10 text-white font-semibold py-3 px-6 rounded-lg transition-all hover:bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-primary-500'
							>
								{secondaryCtaText}
							</a>
						)}
					</div>
				)}
			</div>
		</section>
	);
}

export const HeroInfo = {
	name: 'Hero',
	component: Hero,
	inputs: [
		{
			name: 'title',
			type: 'string',
			required: true,
			defaultValue: 'Welkom bij de Talentenraad',
		},
		{
			name: 'subtitle',
			type: 'string',
			defaultValue: 'De ouderraad van het Talentenhuis - School met een hart voor ieder kind',
		},
		{
			name: 'backgroundImage',
			type: 'file',
			allowedFileTypes: ['jpeg', 'jpg', 'png', 'webp'],
		},
		{
			name: 'ctaText',
			type: 'string',
			defaultValue: 'Bekijk activiteiten',
			helperText: 'Tekst voor de primaire actieknop',
		},
		{
			name: 'ctaLink',
			type: 'string',
			defaultValue: '/kalender',
			helperText: 'Link voor de primaire actieknop',
		},
		{
			name: 'secondaryCtaText',
			type: 'string',
			defaultValue: 'Neem contact op',
			helperText: 'Tekst voor de secundaire actieknop (optioneel)',
		},
		{
			name: 'secondaryCtaLink',
			type: 'string',
			defaultValue: '/contact',
			helperText: 'Link voor de secundaire actieknop',
		},
		{
			name: 'variant',
			type: 'string',
			enum: ['default', 'centered', 'split'],
			defaultValue: 'centered',
		},
		{
			name: 'size',
			type: 'string',
			enum: ['compact', 'small', 'medium', 'large'],
			defaultValue: 'medium',
			helperText: 'compact: zeer klein voor subpagina\'s, small: klein, medium: standaard, large: groot',
		},
	],
};
