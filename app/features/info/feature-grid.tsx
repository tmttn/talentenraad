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
import {Grid} from '@components/ui/layout';

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
	if (features.length === 0) {
		return null;
	}

	// Map columns prop to responsive Grid props
	const getGridProps = () => {
		if (columns === 2) {
			return {colsSm: 2 as const};
		}

		return {colsSm: 2 as const, colsLg: 3 as const};
	};

	return (
		<Grid cols={1} {...getGridProps()} gap='lg'>
			{features.map((feature, index) => (
				<div
					key={index}
					className='bg-white rounded-modal p-6 md:p-8 shadow-subtle hover:shadow-base transition-shadow'
				>
					<div className='w-12 h-12 rounded-card bg-primary/10 text-primary-text flex items-center justify-center mb-4'>
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
		</Grid>
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
