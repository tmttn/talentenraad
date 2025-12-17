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

/**
 * Christmas lights that hang below a component (e.g., header)
 * Renders inline, not fixed position
 */
export function ChristmasLights() {
	const config = useSeasonalDecorations();

	const lights = useMemo(() => {
		const colors = ['#ff0000', '#00ff00', '#ffff00', '#0066ff', '#ff00ff', '#00ffff'];
		return Array.from({length: 20}, (_, index) => ({
			id: index,
			color: colors[index % colors.length],
			delay: index * 0.15,
		}));
	}, []);

	if (!config.enabled || !config.decorations.christmasLights) return null;

	return (
		<div className='w-full overflow-hidden pointer-events-none' aria-hidden='true'>
			<svg viewBox='0 0 1000 50' preserveAspectRatio='none' className='w-full h-8 md:h-10'>
				{/* Wire - wavy line */}
				<path
					d='M0,5 Q50,20 100,5 Q150,20 200,5 Q250,20 300,5 Q350,20 400,5 Q450,20 500,5 Q550,20 600,5 Q650,20 700,5 Q750,20 800,5 Q850,20 900,5 Q950,20 1000,5'
					fill='none'
					stroke='#1a472a'
					strokeWidth='2'
				/>
				{/* Light bulbs */}
				{lights.map(light => {
					const x = (light.id + 0.5) * 50;
					const y = light.id % 2 === 0 ? 10 : 15;
					return (
						<g key={light.id}>
							{/* Socket */}
							<rect x={x - 2} y={y - 1} width='4' height='4' fill='#1a472a' />
							{/* Bulb */}
							<ellipse
								cx={x}
								cy={y + 9}
								rx='5'
								ry='8'
								fill={light.color}
								className='christmas-light-bulb'
								style={{
									animationDelay: `${light.delay}s`,
									filter: `drop-shadow(0 0 4px ${light.color})`,
								}}
							/>
						</g>
					);
				})}
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

	const icicles = useMemo(() => {
		return Array.from({length: 12}, (_, index) => ({
			id: index,
			width: Math.random() * 12 + 6,
			height: Math.random() * 35 + 20,
			x: (index + 0.5) * (100 / 12),
			delay: index * 0.1,
		}));
	}, []);

	if (!config.enabled || !config.decorations.icicles) return null;

	return (
		<div className='w-full overflow-hidden pointer-events-none' aria-hidden='true'>
			<div className='relative w-full h-12 md:h-16'>
				{icicles.map(icicle => (
					<div
						key={icicle.id}
						className='icicle absolute top-0'
						style={{
							left: `${icicle.x}%`,
							width: `${icicle.width}px`,
							height: `${icicle.height}px`,
							animationDelay: `${icicle.delay}s`,
							transform: 'translateX(-50%)',
						}}
					>
						<svg viewBox='0 0 20 100' preserveAspectRatio='none' className='w-full h-full'>
							<defs>
								<linearGradient id={`icicle-grad-${icicle.id}`} x1='0%' y1='0%' x2='0%' y2='100%'>
									<stop offset='0%' stopColor='rgba(200,220,240,0.95)' />
									<stop offset='50%' stopColor='rgba(180,210,240,0.85)' />
									<stop offset='100%' stopColor='rgba(150,200,255,0.6)' />
								</linearGradient>
							</defs>
							<path
								d='M2,0 L18,0 L16,15 Q15,50 12,80 Q10,95 10,100 Q10,95 8,80 Q5,50 4,15 Z'
								fill={`url(#icicle-grad-${icicle.id})`}
								filter='drop-shadow(0 2px 3px rgba(100,150,200,0.2))'
							/>
						</svg>
					</div>
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
