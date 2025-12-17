'use client';

import {useEffect, useState, useMemo} from 'react';
import {useSeasonalDecorations} from './seasonal-decorations-context';

// CSS styles for animations
const seasonalStyles = `
	/* Christmas light twinkling */
	@keyframes twinkle {
		0%, 100% { opacity: 1; filter: brightness(1.2); }
		50% { opacity: 0.6; filter: brightness(0.8); }
	}

	.christmas-light-bulb {
		animation: twinkle 1s ease-in-out infinite;
	}

	/* Snowflake falling */
	@keyframes snowfall {
		0% {
			transform: translateY(-10vh) rotate(0deg);
		}
		100% {
			transform: translateY(110vh) rotate(360deg);
		}
	}

	.snowflake {
		animation: snowfall linear infinite;
	}

	/* Icicle shimmer */
	@keyframes icicle-shimmer {
		0%, 100% { opacity: 0.9; }
		50% { opacity: 1; }
	}

	.icicle {
		animation: icicle-shimmer 3s ease-in-out infinite;
	}

	/* Respect reduced motion preference */
	@media (prefers-reduced-motion: reduce) {
		.christmas-light-bulb,
		.snowflake,
		.icicle {
			animation: none !important;
		}

		.snowflake {
			display: none;
		}
	}
`;

// Color definitions for Christmas lights
const lightColors = [
	{base: '#e63946', light: '#ff6b6b', dark: '#9d0208', glow: '#ff0000'}, // Red
	{base: '#2a9d8f', light: '#40dfcf', dark: '#1a6359', glow: '#00ff88'}, // Green
	{base: '#f4a261', light: '#ffd166', dark: '#e76f51', glow: '#ffcc00'}, // Orange/Gold
	{base: '#457b9d', light: '#70b8db', dark: '#1d3557', glow: '#00aaff'}, // Blue
	{base: '#9b5de5', light: '#c77dff', dark: '#7209b7', glow: '#cc66ff'}, // Purple
	{base: '#00b4d8', light: '#48cae4', dark: '#0077b6', glow: '#00ddff'}, // Cyan
];

/**
 * Single Christmas light bulb SVG component
 */
function LightBulb({color, delay}: {color: typeof lightColors[0]; delay: number}) {
	return (
		<div
			className='christmas-light-bulb relative'
			style={{
				animationDelay: `${delay}s`,
				width: '20px',
				height: '36px',
			}}
		>
			{/* Glow effect */}
			<div
				className='absolute rounded-full'
				style={{
					width: '30px',
					height: '30px',
					top: '10px',
					left: '-5px',
					background: `radial-gradient(circle, ${color.glow}66 0%, transparent 70%)`,
					filter: 'blur(4px)',
				}}
			/>
			<svg viewBox='0 0 20 36' className='w-full h-full relative z-10'>
				{/* Socket */}
				<rect x='6' y='0' width='8' height='5' fill='#2a2a2a' rx='1' />
				<rect x='7' y='1' width='6' height='1' fill='#3a3a3a' />
				<rect x='7' y='3' width='6' height='1' fill='#3a3a3a' />

				{/* Bulb body */}
				<ellipse cx='10' cy='20' rx='9' ry='14' fill={color.base} />
				<ellipse cx='10' cy='20' rx='9' ry='14' fill='url(#bulbShine)' />

				{/* Inner glow */}
				<ellipse cx='10' cy='20' rx='5' ry='9' fill={color.light} opacity='0.5' />

				{/* Glass highlight */}
				<ellipse cx='7' cy='15' rx='2' ry='4' fill='white' opacity='0.5' />
				<ellipse cx='6' cy='13' rx='1' ry='1.5' fill='white' opacity='0.7' />

				{/* Shared gradient definition */}
				<defs>
					<linearGradient id='bulbShine' x1='0%' y1='0%' x2='100%' y2='100%'>
						<stop offset='0%' stopColor='white' stopOpacity='0.3' />
						<stop offset='50%' stopColor='white' stopOpacity='0' />
						<stop offset='100%' stopColor='black' stopOpacity='0.2' />
					</linearGradient>
				</defs>
			</svg>
		</div>
	);
}

/**
 * Christmas lights that hang below a component (e.g., header)
 * Renders inline, not fixed position
 */
export function ChristmasLights() {
	const config = useSeasonalDecorations();

	const lights = useMemo(() => {
		return Array.from({length: 24}, (_, index) => ({
			id: index,
			color: lightColors[index % lightColors.length],
			delay: index * 0.12,
			isLow: index % 2 === 1,
		}));
	}, []);

	if (!config.enabled || !config.decorations.christmasLights) return null;

	return (
		<div className='w-full overflow-hidden pointer-events-none' aria-hidden='true'>
			{/* Wire */}
			<div className='relative w-full h-14'>
				{/* SVG wire that spans full width */}
				<svg
					className='absolute top-0 left-0 w-full h-4'
					viewBox='0 0 100 10'
					preserveAspectRatio='none'
				>
					<path
						d='M0,3 Q2.08,8 4.16,3 Q6.25,8 8.33,3 Q10.41,8 12.5,3 Q14.58,8 16.66,3 Q18.75,8 20.83,3 Q22.91,8 25,3 Q27.08,8 29.16,3 Q31.25,8 33.33,3 Q35.41,8 37.5,3 Q39.58,8 41.66,3 Q43.75,8 45.83,3 Q47.91,8 50,3 Q52.08,8 54.16,3 Q56.25,8 58.33,3 Q60.41,8 62.5,3 Q64.58,8 66.66,3 Q68.75,8 70.83,3 Q72.91,8 75,3 Q77.08,8 79.16,3 Q81.25,8 83.33,3 Q85.41,8 87.5,3 Q89.58,8 91.66,3 Q93.75,8 95.83,3 Q97.91,8 100,3'
						fill='none'
						stroke='#1a3a1a'
						strokeWidth='0.8'
					/>
				</svg>

				{/* Light bulbs positioned with flexbox */}
				<div className='absolute top-1 left-0 w-full flex justify-around px-2'>
					{lights.map(light => (
						<div
							key={light.id}
							style={{
								marginTop: light.isLow ? '12px' : '0px',
							}}
						>
							<LightBulb color={light.color} delay={light.delay} />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

/**
 * Single icicle SVG component
 */
function Icicle({height, delay}: {height: number; delay: number}) {
	return (
		<div
			className='icicle'
			style={{
				animationDelay: `${delay}s`,
				width: '12px',
				height: `${height}px`,
			}}
		>
			<svg viewBox='0 0 12 60' preserveAspectRatio='xMidYMin meet' className='w-full h-full'>
				<defs>
					<linearGradient id={`iceGrad-${delay}`} x1='0%' y1='0%' x2='0%' y2='100%'>
						<stop offset='0%' stopColor='#e8f4fc' stopOpacity='0.95' />
						<stop offset='40%' stopColor='#c5e3f6' stopOpacity='0.85' />
						<stop offset='80%' stopColor='#a8d4f0' stopOpacity='0.7' />
						<stop offset='100%' stopColor='#8bc5eb' stopOpacity='0.4' />
					</linearGradient>
					<linearGradient id={`iceShine-${delay}`} x1='0%' y1='0%' x2='100%' y2='0%'>
						<stop offset='0%' stopColor='white' stopOpacity='0.1' />
						<stop offset='30%' stopColor='white' stopOpacity='0.5' />
						<stop offset='50%' stopColor='white' stopOpacity='0.2' />
						<stop offset='100%' stopColor='white' stopOpacity='0' />
					</linearGradient>
				</defs>

				{/* Main icicle body */}
				<path
					d='M1,0 L11,0 L10,8 Q9.5,20 8,32 Q7,44 6,55 Q5,44 4,32 Q2.5,20 2,8 Z'
					fill={`url(#iceGrad-${delay})`}
				/>

				{/* Shine/highlight */}
				<path
					d='M2,2 L4,2 Q3.5,15 3,30 Q2.5,15 2,2 Z'
					fill={`url(#iceShine-${delay})`}
				/>

				{/* Bright spot at top */}
				<ellipse cx='3' cy='4' rx='1' ry='2' fill='white' opacity='0.6' />

				{/* Water droplet */}
				<ellipse cx='6' cy='57' rx='1.5' ry='2' fill='#a8d4f0' opacity='0.7' />
			</svg>
		</div>
	);
}

/**
 * Icicles that hang from the top of a component (e.g., footer)
 * Renders inline, not fixed position
 */
export function Icicles() {
	const config = useSeasonalDecorations();

	// Varied icicle heights for natural look
	const iciclePattern = useMemo(() => [
		{height: 40, delay: 0},
		{height: 55, delay: 0.1},
		{height: 35, delay: 0.2},
		{height: 65, delay: 0.15},
		{height: 45, delay: 0.25},
		{height: 30, delay: 0.3},
		{height: 70, delay: 0.05},
		{height: 50, delay: 0.35},
		{height: 38, delay: 0.12},
		{height: 60, delay: 0.22},
		{height: 42, delay: 0.18},
		{height: 55, delay: 0.28},
		{height: 35, delay: 0.08},
		{height: 68, delay: 0.32},
		{height: 48, delay: 0.02},
		{height: 40, delay: 0.2},
		{height: 58, delay: 0.14},
		{height: 32, delay: 0.26},
		{height: 62, delay: 0.1},
		{height: 44, delay: 0.22},
	], []);

	if (!config.enabled || !config.decorations.icicles) return null;

	return (
		<div className='w-full overflow-hidden pointer-events-none' aria-hidden='true'>
			{/* Snow/frost base */}
			<div className='w-full h-1 bg-gradient-to-b from-blue-50/90 to-blue-100/50' />

			{/* Icicles container */}
			<div className='w-full flex justify-around items-start px-1' style={{marginTop: '-2px'}}>
				{iciclePattern.map((icicle, index) => (
					<Icicle key={index} height={icicle.height} delay={icicle.delay} />
				))}
			</div>
		</div>
	);
}

/**
 * Falling snowflakes - renders as a fixed overlay
 * Only used when snowfall is enabled
 */
export function Snowfall() {
	const config = useSeasonalDecorations();
	const [snowflakes, setSnowflakes] = useState<Array<{
		id: number;
		x: number;
		size: number;
		duration: number;
		delay: number;
		opacity: number;
	}>>([]);

	useEffect(() => {
		if (!config.enabled || !config.decorations.snowfall) {
			setSnowflakes([]);
			return;
		}

		const flakes = Array.from({length: 30}, (_, index) => ({
			id: index,
			x: Math.random() * 100,
			size: Math.random() * 6 + 3,
			duration: Math.random() * 12 + 12,
			delay: Math.random() * 12,
			opacity: Math.random() * 0.5 + 0.3,
		}));
		setSnowflakes(flakes);
	}, [config.enabled, config.decorations.snowfall]);

	if (!config.enabled || !config.decorations.snowfall || snowflakes.length === 0) return null;

	return (
		<div className='fixed inset-0 pointer-events-none overflow-hidden z-30' aria-hidden='true'>
			{snowflakes.map(flake => (
				<div
					key={flake.id}
					className='snowflake absolute'
					style={{
						left: `${flake.x}%`,
						width: `${flake.size}px`,
						height: `${flake.size}px`,
						opacity: flake.opacity,
						animationDuration: `${flake.duration}s`,
						animationDelay: `${flake.delay}s`,
					}}
				>
					<svg viewBox='0 0 24 24' fill='white' className='w-full h-full drop-shadow-sm'>
						<path d='M12,2 L12,22 M2,12 L22,12 M4.93,4.93 L19.07,19.07 M4.93,19.07 L19.07,4.93' stroke='white' strokeWidth='2' fill='none' />
					</svg>
				</div>
			))}
		</div>
	);
}

/**
 * Injects the CSS styles needed for animations
 * Should be rendered once in the layout
 */
export function SeasonalStyles() {
	const config = useSeasonalDecorations();

	if (!config.enabled) return null;

	// eslint-disable-next-line react/no-danger
	return <style dangerouslySetInnerHTML={{__html: seasonalStyles}} />;
}

// Default configuration export
export const defaultSeasonalConfig = {
	enabled: false,
	season: 'christmas' as const,
	decorations: {
		christmasLights: true,
		snowfall: true,
		icicles: true,
		gingerbreadMan: true,
		christmasBalls: true,
	},
};
