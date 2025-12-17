'use client';

import {
	Calendar,
	Heart,
	Users,
	Star,
	DollarSign,
	Gift,
	type LucideIcon,
} from 'lucide-react';
import {AnimatedLink} from '@components/ui';

type FeatureItem = {
	icon: string;
	title: string;
	description: string;
	link?: string;
};

type FeatureGridProperties = {
	features?: FeatureItem[];
	columns?: 2 | 3;
};

const iconComponents: Record<string, LucideIcon> = {
	calendar: Calendar,
	heart: Heart,
	users: Users,
	star: Star,
	money: DollarSign,
	gift: Gift,
};

function FeatureIcon({name}: Readonly<{name: string}>) {
	const IconComponent = iconComponents[name] ?? iconComponents.star;
	return <IconComponent className='h-6 w-6' aria-hidden='true' />;
}

function FeatureGrid({
	features = [],
	columns = 3,
}: Readonly<FeatureGridProperties>) {
	const gridColsMap: Record<string, string> = {
		cols2: 'sm:grid-cols-2',
		cols3: 'sm:grid-cols-2 lg:grid-cols-3',
	};

	if (features.length === 0) {
		return null;
	}

	return (
		<div className={`grid grid-cols-1 ${gridColsMap[`cols${columns}`]} gap-6 md:gap-8`}>
			{features.map((feature, index) => (
				<div
					key={index}
					className='bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow'
				>
					<div className='w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4'>
						<FeatureIcon name={feature.icon} />
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
	);
}

export const FeatureGridInfo = {
	name: 'FeatureGrid',
	component: FeatureGrid,
	inputs: [
		{
			name: 'columns',
			type: 'number',
			enum: [{label: '2 kolommen', value: 2}, {label: '3 kolommen', value: 3}],
			defaultValue: 3,
			helperText: 'Aantal kolommen in het grid',
		},
		{
			name: 'features',
			type: 'list',
			subFields: [
				{
					name: 'icon',
					type: 'string',
					enum: ['calendar', 'heart', 'users', 'star', 'money', 'gift'],
					defaultValue: 'star',
				},
				{name: 'title', type: 'string', required: true},
				{name: 'description', type: 'longText', required: true},
				{name: 'link', type: 'string'},
			],
			defaultValue: [],
			helperText: 'Feature kaarten met icoon, titel, beschrijving en optionele link',
		},
	],
};
