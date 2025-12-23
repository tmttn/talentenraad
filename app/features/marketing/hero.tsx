'use client';

import type {ReactNode} from 'react';
import {Container} from '@components/ui/layout';
import {brandColors, gradients} from '@styles/tokens';
import {useFlag} from '@lib/flags-client';

type HeroProperties = {
	backgroundImage?: string;
	size?: 'compact' | 'small' | 'medium' | 'large';
	children?: ReactNode;
};

const sizeClasses = {
	compact: 'py-12 md:py-16',
	small: 'py-16 md:py-20',
	medium: 'py-20 md:py-28',
	large: 'py-28 md:py-36',
};

function getBackgroundStyle(backgroundImage?: string) {
	if (backgroundImage) {
		const gradient1 = `color-mix(in srgb, ${brandColors.primary.shade500} 90%, transparent)`;
		const gradient2 = `color-mix(in srgb, ${brandColors.primary.shade700} 90%, transparent)`;
		return `linear-gradient(${gradient1}, ${gradient2}), url(${backgroundImage}) center/cover`;
	}

	return gradients.primary;
}

function Hero({
	backgroundImage,
	size = 'medium',
	children,
}: Readonly<HeroProperties>) {
	const isEnabled = useFlag('heroBanner');

	if (!isEnabled) {
		return null;
	}

	return (
		<section
			className={`relative overflow-hidden ${sizeClasses[size]}`}
			style={{background: getBackgroundStyle(backgroundImage)}}
		>
			{/* Subtle decorative elements */}
			<div className='absolute inset-0 overflow-hidden pointer-events-none' aria-hidden='true'>
				<div className='absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full' />
				<div className='absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-white/5 rounded-full' />
			</div>
			{/* Content */}
			<div className='relative z-10'>
				<Container size='lg' className='text-center'>
					{children}
				</Container>
			</div>
		</section>
	);
}

export const HeroInfo = {
	name: 'Hero',
	component: Hero,
	inputs: [
		{
			name: 'backgroundImage',
			type: 'file',
			allowedFileTypes: ['jpeg', 'jpg', 'png', 'webp'],
			helperText: 'Achtergrondafbeelding (optioneel)',
		},
		{
			name: 'size',
			type: 'string',
			enum: ['compact', 'small', 'medium', 'large'],
			defaultValue: 'medium',
			helperText: 'compact: zeer klein voor subpagina\'s, small: klein, medium: standaard, large: groot',
		},
	],
	canHaveChildren: true,
};
