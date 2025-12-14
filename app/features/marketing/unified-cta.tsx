'use client';

import type {ReactNode} from 'react';

type UnifiedCtaProperties = {
	variant?: 'compact' | 'full' | 'minimal';
	children?: ReactNode;
};

function UnifiedCta({
	variant = 'full',
	children,
}: Readonly<UnifiedCtaProperties>) {
	const variantStyles: Record<string, string> = {
		minimal: 'bg-gray-900 py-8 px-6',
		compact: 'bg-gradient-to-r from-brand-primary-500 to-brand-primary-600 py-10 px-6',
		full: 'bg-gradient-to-br from-gray-900 to-gray-800 py-16 px-6',
	};

	const containerStyles: Record<string, string> = {
		minimal: 'max-w-4xl mx-auto text-center',
		compact: 'max-w-4xl mx-auto',
		full: 'max-w-5xl mx-auto',
	};

	return (
		<section className={variantStyles[variant]}>
			<div className={containerStyles[variant]}>
				{children}
			</div>
		</section>
	);
}

export const UnifiedCtaInfo = {
	name: 'UnifiedCTA',
	component: UnifiedCta,
	inputs: [
		{
			name: 'variant',
			type: 'string',
			enum: ['compact', 'full', 'minimal'],
			defaultValue: 'full',
			helperText: 'Achtergrondstijl: compact (primaire gradient), full (donkere gradient), minimal (donker)',
		},
	],
	canHaveChildren: true,
};
