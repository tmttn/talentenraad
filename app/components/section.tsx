'use client';

import type {ReactNode} from 'react';

type SectionProperties = {
	children?: ReactNode;
	title?: string;
	subtitle?: string;
	background?: 'white' | 'light' | 'dark' | 'accent' | 'secondary' | 'tertiary' | 'gradient';
	align?: 'left' | 'center';
	size?: 'small' | 'medium' | 'large';
	decoration?: 'none' | 'dots' | 'waves' | 'circles';
	width?: 'narrow' | 'default' | 'wide' | 'full';
};

function Section({
	children,
	title,
	subtitle,
	background = 'white',
	align = 'center',
	size = 'medium',
	decoration = 'none',
	width = 'default',
}: Readonly<SectionProperties>) {
	const bgClasses = {
		white: 'bg-white',
		light: 'bg-gray-50',
		dark: 'bg-gray-900 text-white',
		accent: 'bg-[#ea247b] text-white',
		secondary: 'bg-[#afbd43] text-white',
		tertiary: 'bg-[#fcb142] text-white',
		gradient: 'bg-gradient-to-br from-[#ea247b]/5 via-white to-[#afbd43]/5',
	};

	const sizeClasses = {
		small: 'py-12',
		medium: 'py-20',
		large: 'py-28',
	};

	const widthClasses = {
		narrow: 'max-w-3xl',
		default: 'max-w-6xl',
		wide: 'max-w-7xl',
		full: 'max-w-full',
	};

	const darkBackgrounds = ['dark', 'accent', 'secondary', 'tertiary'];
	const isDarkBackground = darkBackgrounds.includes(background);

	const titleClasses = isDarkBackground
		? 'text-white'
		: 'text-gray-900';

	const subtitleClasses = isDarkBackground
		? 'text-white/90'
		: 'text-gray-600';

	const bgClass = bgClasses[background] || bgClasses.white;
	const sizeClass = sizeClasses[size] || sizeClasses.medium;
	const widthClass = widthClasses[width] || widthClasses.default;

	// Decorations
	const renderDecoration = () => {
		switch (decoration) {
			case 'dots': {
				return (
					<div className='absolute inset-0 overflow-hidden pointer-events-none' aria-hidden='true'>
						<div className='absolute top-0 left-0 w-64 h-64 opacity-5'>
							<svg viewBox='0 0 200 200' fill='currentColor' className='text-[#ea247b]'>
								<pattern id='dots' x='0' y='0' width='20' height='20' patternUnits='userSpaceOnUse'>
									<circle cx='2' cy='2' r='2' />
								</pattern>
								<rect fill='url(#dots)' width='200' height='200' />
							</svg>
						</div>
						<div className='absolute bottom-0 right-0 w-64 h-64 opacity-5 rotate-180'>
							<svg viewBox='0 0 200 200' fill='currentColor' className='text-[#ea247b]'>
								<pattern id='dots2' x='0' y='0' width='20' height='20' patternUnits='userSpaceOnUse'>
									<circle cx='2' cy='2' r='2' />
								</pattern>
								<rect fill='url(#dots2)' width='200' height='200' />
							</svg>
						</div>
					</div>
				);
			}

			case 'waves': {
				return (
					<div className='absolute inset-x-0 bottom-0 overflow-hidden pointer-events-none' aria-hidden='true'>
						<svg viewBox='0 0 1200 120' preserveAspectRatio='none' className='w-full h-16 text-white/10'>
							<path d='M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.1,110.83,129.12,97.56,321.39,56.44Z' fill='currentColor'/>
						</svg>
					</div>
				);
			}

			case 'circles': {
				return (
					<div className='absolute inset-0 overflow-hidden pointer-events-none' aria-hidden='true'>
						<div className='absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#ea247b]/5' />
						<div className='absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-blue-500/5' />
					</div>
				);
			}

			default: {
				return null;
			}
		}
	};

	return (
		<section className={`${bgClass} ${sizeClass} relative`}>
			{renderDecoration()}
			<div className={`${widthClass} mx-auto px-6 relative z-10`}>
				{(title || subtitle) && (
					<div className={`mb-12 ${align === 'center' ? 'text-center' : ''}`}>
						{title && (
							<h2 className={`text-3xl md:text-4xl font-bold ${titleClasses} mb-4`}>
								{title}
							</h2>
						)}
						{subtitle && (
							<p className={`text-lg ${subtitleClasses} max-w-2xl ${align === 'center' ? 'mx-auto' : ''}`}>
								{subtitle}
							</p>
						)}
					</div>
				)}
				{children}
			</div>
		</section>
	);
}

export const SectionInfo = {
	name: 'Section',
	component: Section,
	canHaveChildren: true,
	inputs: [
		{
			name: 'title',
			type: 'string',
		},
		{
			name: 'subtitle',
			type: 'string',
		},
		{
			name: 'background',
			type: 'string',
			enum: ['white', 'light', 'dark', 'accent', 'secondary', 'tertiary', 'gradient'],
			defaultValue: 'white',
			helperText: 'Achtergrondkleur: accent=roze, secondary=groen, tertiary=oranje',
		},
		{
			name: 'align',
			type: 'string',
			enum: ['left', 'center'],
			defaultValue: 'center',
		},
		{
			name: 'size',
			type: 'string',
			enum: ['small', 'medium', 'large'],
			defaultValue: 'medium',
			helperText: 'Verticale padding',
		},
		{
			name: 'decoration',
			type: 'string',
			enum: ['none', 'dots', 'waves', 'circles'],
			defaultValue: 'none',
			helperText: 'Decoratief element voor visuele interesse',
		},
		{
			name: 'width',
			type: 'string',
			enum: ['narrow', 'default', 'wide', 'full'],
			defaultValue: 'default',
			helperText: 'Maximale breedte van de content',
		},
	],
};
