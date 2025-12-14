'use client';

import type {ReactNode} from 'react';
import {AnimatedLink} from './ui';

type FeatureItem = {
	icon: string;
	title: string;
	description: string;
	link?: string;
};

type FeatureGridProperties = {
	title?: string;
	subtitle?: string;
	features?: FeatureItem[];
	columns?: 2 | 3;
};

const iconMap: Record<string, ReactNode> = {
	calendar: (
		<svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
		</svg>
	),
	heart: (
		<svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
		</svg>
	),
	users: (
		<svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
		</svg>
	),
	star: (
		<svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' />
		</svg>
	),
	money: (
		<svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
		</svg>
	),
	gift: (
		<svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' />
		</svg>
	),
};

function FeatureGrid({
	title,
	subtitle,
	features = [],
	columns = 3,
}: Readonly<FeatureGridProperties>) {
	const gridCols = {
		2: 'sm:grid-cols-2',
		3: 'sm:grid-cols-2 lg:grid-cols-3',
	};

	return (
		<section className='py-16 md:py-24 bg-gray-50'>
			<div className='max-w-6xl mx-auto px-4 sm:px-6'>
				{(title || subtitle) && (
					<div className='text-center mb-12 md:mb-16'>
						{title && (
							<h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4'>
								{title}
							</h2>
						)}
						{subtitle && (
							<p className='text-base sm:text-lg text-gray-600 max-w-2xl mx-auto'>
								{subtitle}
							</p>
						)}
					</div>
				)}

				<div className={`grid grid-cols-1 ${gridCols[columns]} gap-6 md:gap-8`}>
					{features.map((feature, index) => (
						<div
							key={index}
							className='bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow'
						>
							<div className='w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4'>
								{iconMap[feature.icon] || iconMap.star}
							</div>
							<h3 className='text-lg md:text-xl font-bold text-gray-900 mb-2'>
								{feature.title}
							</h3>
							<p className='text-gray-600 text-sm md:text-base leading-relaxed'>
								{feature.description}
							</p>
							{feature.link && (
								<AnimatedLink href={feature.link} size='sm' className='mt-4'>
									Meer info
								</AnimatedLink>
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

export const FeatureGridInfo = {
	name: 'FeatureGrid',
	component: FeatureGrid,
	inputs: [
		{name: 'title', type: 'string', defaultValue: 'Wat doen wij?'},
		{name: 'subtitle', type: 'string', defaultValue: 'Ontdek hoe de Talentenraad het verschil maakt'},
		{
			name: 'columns', type: 'number', enum: [{label: '2 kolommen', value: 2}, {label: '3 kolommen', value: 3}], defaultValue: 3,
		},
		{
			name: 'features',
			type: 'list',
			subFields: [
				{
					name: 'icon', type: 'string', enum: ['calendar', 'heart', 'users', 'star', 'money', 'gift'], defaultValue: 'star',
				},
				{name: 'title', type: 'string', required: true},
				{name: 'description', type: 'longText', required: true},
				{name: 'link', type: 'string'},
			],
			defaultValue: [
				{
					icon: 'calendar', title: 'Activiteiten', description: 'Van schoolfeesten tot quiz-avonden: we organiseren leuke evenementen voor het hele gezin.', link: '/activiteiten',
				},
				{icon: 'money', title: 'Fondsenwerving', description: 'Door acties en sponsoring zamelen we geld in voor extra materiaal en uitstappen.'},
				{
					icon: 'users', title: 'Verbinding', description: 'We bouwen bruggen tussen ouders, leerkrachten en de schooldirectie.', link: '/over-ons',
				},
			],
		},
	],
};
