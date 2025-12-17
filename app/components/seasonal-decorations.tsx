'use client';

import {useEffect, useState, useMemo} from 'react';
import {useSeasonalDecorations} from './seasonal-decorations-context';

// CSS styles for animations
const seasonalStyles = `
	/* Christmas light glowing */
	@keyframes glow-pulse {
		0%, 100% {
			filter: brightness(1) saturate(1.2);
			transform: scale(1);
		}
		50% {
			filter: brightness(1.4) saturate(1.5);
			transform: scale(1.05);
		}
	}

	.christmas-bulb {
		animation: glow-pulse 2s ease-in-out infinite;
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

	/* Icicle drip effect */
	@keyframes drip {
		0%, 90%, 100% { opacity: 0; transform: translateY(0); }
		92% { opacity: 0.8; transform: translateY(0); }
		99% { opacity: 0; transform: translateY(8px); }
	}

	.icicle-drip {
		animation: drip 4s ease-in-out infinite;
	}

	/* Respect reduced motion preference */
	@media (prefers-reduced-motion: reduce) {
		.christmas-bulb,
		.snowflake,
		.icicle-drip {
			animation: none !important;
		}

		.snowflake {
			display: none;
		}
	}
`;

// Realistic Christmas light colors (like real C9 bulbs)
const bulbColors = [
	{bg: '#ff1a1a', glow: '#ff0000', shadow: '#cc0000'}, // Red
	{bg: '#00cc00', glow: '#00ff00', shadow: '#009900'}, // Green
	{bg: '#ffcc00', glow: '#ffdd00', shadow: '#cc9900'}, // Gold/Yellow
	{bg: '#0066ff', glow: '#0088ff', shadow: '#0044cc'}, // Blue
	{bg: '#ff6600', glow: '#ff8800', shadow: '#cc4400'}, // Orange
	{bg: '#cc00cc', glow: '#ff00ff', shadow: '#990099'}, // Purple
];

/**
 * Realistic CSS-based Christmas light bulb
 */
function RealisticBulb({color, delay, isLow}: {color: typeof bulbColors[0]; delay: number; isLow: boolean}) {
	return (
		<div
			className='relative flex flex-col items-center'
			style={{marginTop: isLow ? '8px' : '0'}}
		>
			{/* Wire connection */}
			<div
				className='w-[2px] bg-[#1a1a1a]'
				style={{height: isLow ? '12px' : '4px'}}
			/>
			{/* Socket/cap */}
			<div
				className='w-[10px] h-[6px] rounded-t-sm'
				style={{
					background: 'linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 50%, #1a1a1a 100%)',
					boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
				}}
			/>
			{/* Bulb */}
			<div
				className='christmas-bulb relative'
				style={{
					animationDelay: `${delay}s`,
					width: '14px',
					height: '18px',
					borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
					background: `radial-gradient(ellipse 60% 50% at 30% 30%, white 0%, ${color.bg} 40%, ${color.shadow} 100%)`,
					boxShadow: `
						0 0 10px 3px ${color.glow}88,
						0 0 20px 6px ${color.glow}44,
						0 0 30px 10px ${color.glow}22,
						inset 0 -3px 6px ${color.shadow}88,
						inset 2px 2px 4px rgba(255,255,255,0.5)
					`,
				}}
			>
				{/* Glass reflection */}
				<div
					className='absolute'
					style={{
						top: '3px',
						left: '3px',
						width: '4px',
						height: '6px',
						borderRadius: '50%',
						background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, transparent 100%)',
					}}
				/>
			</div>
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
		return Array.from({length: 30}, (_, index) => ({
			id: index,
			color: bulbColors[index % bulbColors.length],
			delay: (index * 0.15) % 2,
			isLow: index % 2 === 1,
		}));
	}, []);

	if (!config.enabled || !config.decorations.christmasLights) return null;

	return (
		<div className='w-full overflow-hidden pointer-events-none' aria-hidden='true'>
			<div className='relative w-full' style={{height: '50px'}}>
				{/* Main wire - sagging effect with CSS */}
				<div
					className='absolute top-0 left-0 w-full'
					style={{
						height: '20px',
						background: `
							repeating-linear-gradient(
								90deg,
								transparent 0px,
								transparent 3.2%,
								#1a1a1a 3.2%,
								#1a1a1a 3.4%,
								transparent 3.4%
							)
						`,
						maskImage: 'linear-gradient(180deg, black 2px, transparent 2px)',
						WebkitMaskImage: 'linear-gradient(180deg, black 2px, transparent 2px)',
					}}
				/>

				{/* Light bulbs */}
				<div className='absolute top-0 left-0 w-full flex justify-around px-1'>
					{lights.map(light => (
						<RealisticBulb
							key={light.id}
							color={light.color}
							delay={light.delay}
							isLow={light.isLow}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

/**
 * Realistic CSS-based icicle
 */
function RealisticIcicle({height, delay}: {height: number; delay: number}) {
	return (
		<div className='relative' style={{width: '8px', height: `${height}px`}}>
			{/* Main icicle body */}
			<div
				className='absolute inset-0'
				style={{
					background: `linear-gradient(
						180deg,
						rgba(220, 240, 255, 0.95) 0%,
						rgba(180, 220, 250, 0.85) 20%,
						rgba(150, 200, 245, 0.7) 50%,
						rgba(120, 180, 240, 0.5) 80%,
						rgba(100, 170, 235, 0.2) 100%
					)`,
					clipPath: 'polygon(20% 0%, 80% 0%, 70% 30%, 60% 60%, 50% 100%, 40% 60%, 30% 30%)',
					filter: 'drop-shadow(0 2px 4px rgba(100, 150, 200, 0.3))',
				}}
			/>
			{/* Shine/highlight */}
			<div
				className='absolute'
				style={{
					top: '5%',
					left: '25%',
					width: '30%',
					height: '40%',
					background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%)',
					clipPath: 'polygon(0% 0%, 100% 0%, 80% 100%, 20% 100%)',
					borderRadius: '2px',
				}}
			/>
			{/* Water droplet at tip */}
			<div
				className='icicle-drip absolute'
				style={{
					animationDelay: `${delay}s`,
					bottom: '-4px',
					left: '50%',
					transform: 'translateX(-50%)',
					width: '4px',
					height: '5px',
					borderRadius: '50% 50% 50% 50% / 30% 30% 70% 70%',
					background: 'radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.9), rgba(150,200,240,0.6))',
				}}
			/>
		</div>
	);
}

/**
 * Icicles that hang from the top of a component (e.g., footer)
 * Renders inline, not fixed position
 */
export function Icicles() {
	const config = useSeasonalDecorations();

	// Varied icicle heights for natural look - more variation
	const iciclePattern = useMemo(() => {
		const heights = [25, 40, 20, 50, 30, 18, 55, 35, 22, 45, 28, 38, 15, 52, 32, 42, 24, 48, 26, 36, 20, 44, 30, 50, 22, 38, 28, 46, 34, 40];
		return heights.map((height, index) => ({
			height,
			delay: (index * 0.3) % 4,
		}));
	}, []);

	if (!config.enabled || !config.decorations.icicles) return null;

	return (
		<div className='w-full overflow-hidden pointer-events-none' aria-hidden='true'>
			{/* Snow/frost accumulation at top */}
			<div
				className='w-full'
				style={{
					height: '6px',
					background: 'linear-gradient(180deg, rgba(240,248,255,0.95) 0%, rgba(220,235,250,0.8) 60%, rgba(200,225,245,0.4) 100%)',
					boxShadow: '0 2px 4px rgba(150,180,210,0.2)',
				}}
			/>

			{/* Icicles container */}
			<div className='w-full flex justify-around items-start' style={{marginTop: '-2px', gap: '2px'}}>
				{iciclePattern.map((icicle, index) => (
					<RealisticIcicle key={index} height={icicle.height} delay={icicle.delay} />
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
