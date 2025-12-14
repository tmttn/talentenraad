'use client';

// Decorative SVG illustrations for adding visual interest to pages

type DecorationProperties = {
	type: 'confetti' | 'stars' | 'hearts' | 'balloons' | 'party';
	position?: 'left' | 'right' | 'center';
	size?: 'small' | 'medium' | 'large';
	className?: string;
};

function Decoration({
	type,
	position = 'right',
	size = 'medium',
	className = '',
}: Readonly<DecorationProperties>) {
	const sizeClasses = {
		small: 'w-24 h-24 md:w-32 md:h-32',
		medium: 'w-32 h-32 md:w-48 md:h-48',
		large: 'w-48 h-48 md:w-64 md:h-64',
	};

	const positionClasses = {
		left: 'left-4 md:left-8',
		right: 'right-4 md:right-8',
		center: 'left-1/2 -translate-x-1/2',
	};

	const renderDecoration = () => {
		switch (type) {
			case 'confetti': {
				return (
					<svg viewBox='0 0 100 100' className='w-full h-full'>
						<circle cx='15' cy='25' r='4' className='fill-brand-primary-500' />
						<circle cx='45' cy='15' r='3' className='fill-yellow-400' />
						<circle cx='75' cy='30' r='5' className='fill-blue-400' />
						<circle cx='85' cy='60' r='3' className='fill-green-400' />
						<circle cx='25' cy='70' r='4' className='fill-purple-400' />
						<circle cx='55' cy='80' r='3' className='fill-brand-primary-500' />
						<rect x='30' y='40' width='6' height='6' transform='rotate(45 33 43)' className='fill-orange-400' />
						<rect x='60' y='50' width='5' height='5' transform='rotate(30 62.5 52.5)' className='fill-pink-400' />
						<rect x='10' y='50' width='4' height='4' transform='rotate(60 12 52)' className='fill-blue-400' />
					</svg>
				);
			}

			case 'stars': {
				return (
					<svg viewBox='0 0 100 100' className='w-full h-full'>
						<path d='M20,10 L22,18 L30,18 L24,23 L26,31 L20,26 L14,31 L16,23 L10,18 L18,18 Z' className='fill-yellow-400' />
						<path d='M70,20 L72,26 L78,26 L74,30 L75,36 L70,33 L65,36 L66,30 L62,26 L68,26 Z' className='fill-brand-primary-500' />
						<path d='M45,50 L48,60 L58,60 L50,66 L53,76 L45,70 L37,76 L40,66 L32,60 L42,60 Z' className='fill-blue-400' />
						<path d='M80,70 L82,76 L88,76 L84,80 L85,86 L80,83 L75,86 L76,80 L72,76 L78,76 Z' className='fill-yellow-400' />
					</svg>
				);
			}

			case 'hearts': {
				return (
					<svg viewBox='0 0 100 100' className='w-full h-full'>
						<path d='M25,25 C25,20 20,15 15,15 C10,15 5,20 5,25 C5,35 25,45 25,45 C25,45 45,35 45,25 C45,20 40,15 35,15 C30,15 25,20 25,25' className='fill-brand-primary-500/80' />
						<path d='M75,15 C75,12 72,9 69,9 C66,9 63,12 63,15 C63,21 75,27 75,27 C75,27 87,21 87,15 C87,12 84,9 81,9 C78,9 75,12 75,15' className='fill-brand-primary-500/60' />
						<path d='M50,70 C50,66 46,62 42,62 C38,62 34,66 34,70 C34,78 50,86 50,86 C50,86 66,78 66,70 C66,66 62,62 58,62 C54,62 50,66 50,70' className='fill-brand-primary-500' />
					</svg>
				);
			}

			case 'balloons': {
				return (
					<svg viewBox='0 0 100 100' className='w-full h-full'>
						<ellipse cx='20' cy='30' rx='12' ry='16' className='fill-brand-primary-500' />
						<path d='M20,46 Q22,50 20,55' stroke='currentColor' className='text-brand-primary-500' strokeWidth='1' fill='none' />

						<ellipse cx='45' cy='25' rx='10' ry='14' className='fill-yellow-400' />
						<path d='M45,39 Q47,43 45,50' stroke='#facc15' strokeWidth='1' fill='none' />

						<ellipse cx='70' cy='35' rx='11' ry='15' className='fill-blue-400' />
						<path d='M70,50 Q72,54 70,60' stroke='#60a5fa' strokeWidth='1' fill='none' />

						<ellipse cx='55' cy='60' rx='9' ry='12' className='fill-green-400' />
						<path d='M55,72 Q57,76 55,82' stroke='#4ade80' strokeWidth='1' fill='none' />
					</svg>
				);
			}

			case 'party': {
				return (
					<svg viewBox='0 0 100 100' className='w-full h-full'>
						{/* Party hat */}
						<polygon points='50,10 30,50 70,50' className='fill-brand-primary-500' />
						<circle cx='50' cy='10' r='4' className='fill-yellow-400' />
						<line x1='35' y1='25' x2='65' y2='25' stroke='white' strokeWidth='2' />
						<line x1='33' y1='35' x2='67' y2='35' stroke='white' strokeWidth='2' />
						<line x1='31' y1='45' x2='69' y2='45' stroke='white' strokeWidth='2' />

						{/* Confetti around */}
						<circle cx='15' cy='20' r='3' className='fill-yellow-400' />
						<circle cx='85' cy='15' r='2' className='fill-blue-400' />
						<circle cx='20' cy='70' r='2' className='fill-green-400' />
						<circle cx='80' cy='65' r='3' className='fill-brand-primary-500' />
						<rect x='75' y='35' width='4' height='4' transform='rotate(45 77 37)' className='fill-purple-400' />
						<rect x='10' y='45' width='3' height='3' transform='rotate(30 11.5 46.5)' className='fill-orange-400' />
					</svg>
				);
			}

			default: {
				return null;
			}
		}
	};

	return (
		<div
			className={`absolute ${positionClasses[position]} ${sizeClasses[size]} pointer-events-none opacity-30 ${className}`}
			aria-hidden='true'
		>
			{renderDecoration()}
		</div>
	);
}

export const DecorationInfo = {
	name: 'Decoration',
	component: Decoration,
	inputs: [
		{
			name: 'type',
			type: 'string',
			enum: ['confetti', 'stars', 'hearts', 'balloons', 'party'],
			defaultValue: 'confetti',
			helperText: 'Type decoratieve illustratie',
		},
		{
			name: 'position',
			type: 'string',
			enum: ['left', 'right', 'center'],
			defaultValue: 'right',
		},
		{
			name: 'size',
			type: 'string',
			enum: ['small', 'medium', 'large'],
			defaultValue: 'medium',
		},
	],
};

// Divider component for separating sections
type DividerProperties = {
	type: 'wave' | 'curve' | 'triangle' | 'zigzag';
	color?: 'white' | 'gray' | 'pink' | 'gradient';
	flip?: boolean;
};

export function Divider({
	type = 'wave',
	color = 'white',
	flip = false,
}: Readonly<DividerProperties>) {
	const colorClasses = {
		white: 'text-white',
		gray: 'text-gray-50',
		pink: 'text-primary',
		gradient: 'text-gray-100',
	};

	const renderDivider = () => {
		switch (type) {
			case 'wave': {
				return (
					<path d='M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,42.7C960,43,1056,53,1152,53.3C1248,53,1344,43,1392,37.3L1440,32L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z' />
				);
			}

			case 'curve': {
				return (
					<path d='M0,64L1440,64L1440,100L0,100Z M0,64Q720,96,1440,64' />
				);
			}

			case 'triangle': {
				return (
					<path d='M0,100L720,20L1440,100L1440,100L0,100Z' />
				);
			}

			case 'zigzag': {
				return (
					<path d='M0,50L120,70L240,50L360,70L480,50L600,70L720,50L840,70L960,50L1080,70L1200,50L1320,70L1440,50L1440,100L0,100Z' />
				);
			}

			default: {
				return null;
			}
		}
	};

	return (
		<div className={`w-full overflow-hidden ${flip ? 'rotate-180' : ''}`} aria-hidden='true'>
			<svg
				viewBox='0 0 1440 100'
				preserveAspectRatio='none'
				className={`w-full h-16 md:h-24 ${colorClasses[color]}`}
				fill='currentColor'
			>
				{renderDivider()}
			</svg>
		</div>
	);
}

export const DividerInfo = {
	name: 'Divider',
	component: Divider,
	inputs: [
		{
			name: 'type',
			type: 'string',
			enum: ['wave', 'curve', 'triangle', 'zigzag'],
			defaultValue: 'wave',
		},
		{
			name: 'color',
			type: 'string',
			enum: ['white', 'gray', 'pink', 'gradient'],
			defaultValue: 'white',
		},
		{
			name: 'flip',
			type: 'boolean',
			defaultValue: false,
			helperText: 'Draai de divider om',
		},
	],
};
