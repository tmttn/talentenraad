'use client';

import {useEffect, useState} from 'react';
import {useSeasonalDecorations} from './seasonal-decorations-context';

// CSS styles for animations
const seasonalStyles = `
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

	/* Respect reduced motion preference */
	@media (prefers-reduced-motion: reduce) {
		.snowflake {
			animation: none !important;
			display: none;
		}
	}
`;

/**
 * Christmas lights - simplified placeholder
 */
export function ChristmasLights() {
	const config = useSeasonalDecorations();

	if (!config.enabled || !config.decorations.christmasLights) return null;

	return null; // Disabled for now
}

/**
 * Icicles - simplified placeholder
 */
export function Icicles() {
	const config = useSeasonalDecorations();

	if (!config.enabled || !config.decorations.icicles) return null;

	return null; // Disabled for now
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

// Re-export from shared types for backwards compatibility
export {defaultSeasonalConfig} from '@lib/types';
