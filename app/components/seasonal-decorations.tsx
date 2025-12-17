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

// Color definitions for Christmas lights with gradients
const lightColors = [
	{base: '#ff2020', light: '#ff6060', dark: '#cc0000', glow: '#ff0000'}, // Red
	{base: '#20cc20', light: '#60ff60', dark: '#008800', glow: '#00ff00'}, // Green
	{base: '#ffcc00', light: '#ffee66', dark: '#cc9900', glow: '#ffff00'}, // Yellow/Gold
	{base: '#2060ff', light: '#60a0ff', dark: '#0040cc', glow: '#0066ff'}, // Blue
	{base: '#ff40ff', light: '#ff80ff', dark: '#cc00cc', glow: '#ff00ff'}, // Magenta
	{base: '#00cccc', light: '#60ffff', dark: '#008888', glow: '#00ffff'}, // Cyan
];

/**
 * Christmas lights that hang below a component (e.g., header)
 * Renders inline, not fixed position
 */
export function ChristmasLights() {
	const config = useSeasonalDecorations();

	const lights = useMemo(() => {
		return Array.from({length: 20}, (_, index) => ({
			id: index,
			colors: lightColors[index % lightColors.length],
			delay: index * 0.15,
			// Slight random variation for organic look
			sway: (index % 3) - 1,
		}));
	}, []);

	if (!config.enabled || !config.decorations.christmasLights) return null;

	return (
		<div className='w-full overflow-hidden pointer-events-none' aria-hidden='true'>
			<svg viewBox='0 0 1000 60' preserveAspectRatio='none' className='w-full h-10 md:h-14'>
				<defs>
					{/* Define gradients for each light color */}
					{lightColors.map((color, index) => (
						<radialGradient key={`bulb-grad-${index}`} id={`bulb-gradient-${index}`} cx='30%' cy='30%' r='70%'>
							<stop offset='0%' stopColor={color.light} stopOpacity='1' />
							<stop offset='50%' stopColor={color.base} stopOpacity='1' />
							<stop offset='100%' stopColor={color.dark} stopOpacity='1' />
						</radialGradient>
					))}
					{/* Glass highlight reflection */}
					<linearGradient id='bulb-highlight' x1='0%' y1='0%' x2='100%' y2='100%'>
						<stop offset='0%' stopColor='white' stopOpacity='0.7' />
						<stop offset='50%' stopColor='white' stopOpacity='0.1' />
						<stop offset='100%' stopColor='white' stopOpacity='0' />
					</linearGradient>
					{/* Socket gradient */}
					<linearGradient id='socket-gradient' x1='0%' y1='0%' x2='100%' y2='100%'>
						<stop offset='0%' stopColor='#4a4a4a' />
						<stop offset='50%' stopColor='#2a2a2a' />
						<stop offset='100%' stopColor='#1a1a1a' />
					</linearGradient>
					{/* Wire texture */}
					<linearGradient id='wire-gradient' x1='0%' y1='0%' x2='0%' y2='100%'>
						<stop offset='0%' stopColor='#1a3a1a' />
						<stop offset='50%' stopColor='#0d1f0d' />
						<stop offset='100%' stopColor='#1a3a1a' />
					</linearGradient>
				</defs>

				{/* Main wire - thicker with more detail */}
				<path
					d='M-10,8 Q25,22 50,8 Q75,22 100,8 Q125,22 150,8 Q175,22 200,8 Q225,22 250,8 Q275,22 300,8 Q325,22 350,8 Q375,22 400,8 Q425,22 450,8 Q475,22 500,8 Q525,22 550,8 Q575,22 600,8 Q625,22 650,8 Q675,22 700,8 Q725,22 750,8 Q775,22 800,8 Q825,22 850,8 Q875,22 900,8 Q925,22 950,8 Q975,22 1010,8'
					fill='none'
					stroke='url(#wire-gradient)'
					strokeWidth='3'
					strokeLinecap='round'
				/>
				{/* Wire highlight */}
				<path
					d='M-10,7 Q25,21 50,7 Q75,21 100,7 Q125,21 150,7 Q175,21 200,7 Q225,21 250,7 Q275,21 300,7 Q325,21 350,7 Q375,21 400,7 Q425,21 450,7 Q475,21 500,7 Q525,21 550,7 Q575,21 600,7 Q625,21 650,7 Q675,21 700,7 Q725,21 750,7 Q775,21 800,7 Q825,21 850,7 Q875,21 900,7 Q925,21 950,7 Q975,21 1010,7'
					fill='none'
					stroke='#2a4a2a'
					strokeWidth='1'
					strokeLinecap='round'
					opacity='0.5'
				/>

				{/* Light bulbs */}
				{lights.map(light => {
					const x = (light.id + 0.5) * 50;
					const wireY = light.id % 2 === 0 ? 8 : 22;
					const colorIndex = light.id % lightColors.length;
					return (
						<g key={light.id} className='christmas-light-bulb' style={{animationDelay: `${light.delay}s`}}>
							{/* Glow effect */}
							<ellipse
								cx={x}
								cy={wireY + 22}
								rx='14'
								ry='18'
								fill={light.colors.glow}
								opacity='0.3'
								style={{filter: 'blur(6px)'}}
							/>

							{/* Socket base (screw part) */}
							<rect
								x={x - 4}
								y={wireY}
								width='8'
								height='6'
								fill='url(#socket-gradient)'
								rx='1'
							/>
							{/* Socket ridges */}
							<line x1={x - 3} y1={wireY + 1.5} x2={x + 3} y2={wireY + 1.5} stroke='#3a3a3a' strokeWidth='0.5' />
							<line x1={x - 3} y1={wireY + 3} x2={x + 3} y2={wireY + 3} stroke='#3a3a3a' strokeWidth='0.5' />
							<line x1={x - 3} y1={wireY + 4.5} x2={x + 3} y2={wireY + 4.5} stroke='#3a3a3a' strokeWidth='0.5' />

							{/* Socket collar */}
							<ellipse cx={x} cy={wireY + 6} rx='5' ry='2' fill='#2a2a2a' />

							{/* Bulb body - vintage C9 style */}
							<path
								d={`M${x - 6},${wireY + 8}
									Q${x - 8},${wireY + 15} ${x - 7},${wireY + 24}
									Q${x - 5},${wireY + 34} ${x},${wireY + 38}
									Q${x + 5},${wireY + 34} ${x + 7},${wireY + 24}
									Q${x + 8},${wireY + 15} ${x + 6},${wireY + 8} Z`}
								fill={`url(#bulb-gradient-${colorIndex})`}
							/>

							{/* Inner glow */}
							<ellipse
								cx={x}
								cy={wireY + 22}
								rx='4'
								ry='10'
								fill={light.colors.light}
								opacity='0.5'
							/>

							{/* Glass highlight - left side */}
							<path
								d={`M${x - 4},${wireY + 10}
									Q${x - 6},${wireY + 18} ${x - 5},${wireY + 26}
									Q${x - 3},${wireY + 18} ${x - 3},${wireY + 12} Z`}
								fill='white'
								opacity='0.4'
							/>

							{/* Small specular highlight */}
							<ellipse
								cx={x - 2}
								cy={wireY + 12}
								rx='1.5'
								ry='2'
								fill='white'
								opacity='0.6'
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

	// Generate icicles with deterministic "randomness" based on index
	const icicles = useMemo(() => {
		const baseIcicles = [
			{width: 10, height: 45, offset: 0},
			{width: 6, height: 28, offset: 0.3},
			{width: 14, height: 60, offset: 0.1},
			{width: 8, height: 35, offset: 0.2},
			{width: 12, height: 52, offset: 0.15},
			{width: 5, height: 22, offset: 0.25},
			{width: 16, height: 70, offset: 0.05},
			{width: 7, height: 30, offset: 0.35},
			{width: 11, height: 48, offset: 0.12},
			{width: 9, height: 38, offset: 0.22},
			{width: 13, height: 55, offset: 0.08},
			{width: 6, height: 25, offset: 0.28},
			{width: 15, height: 65, offset: 0.02},
			{width: 8, height: 32, offset: 0.18},
			{width: 10, height: 42, offset: 0.32},
		];
		return baseIcicles.map((ice, index) => ({
			...ice,
			id: index,
			x: (index + 0.5) * (100 / baseIcicles.length),
			delay: index * 0.15,
		}));
	}, []);

	if (!config.enabled || !config.decorations.icicles) return null;

	return (
		<div className='w-full overflow-hidden pointer-events-none' aria-hidden='true'>
			<svg viewBox='0 0 1000 80' preserveAspectRatio='none' className='w-full h-14 md:h-20'>
				<defs>
					{/* Ice gradient - main body */}
					<linearGradient id='icicle-body-gradient' x1='0%' y1='0%' x2='100%' y2='0%'>
						<stop offset='0%' stopColor='rgba(220,235,250,0.9)' />
						<stop offset='30%' stopColor='rgba(200,225,250,0.95)' />
						<stop offset='50%' stopColor='rgba(180,215,245,0.85)' />
						<stop offset='70%' stopColor='rgba(200,225,250,0.95)' />
						<stop offset='100%' stopColor='rgba(220,235,250,0.9)' />
					</linearGradient>

					{/* Ice gradient - vertical fade */}
					<linearGradient id='icicle-fade-gradient' x1='0%' y1='0%' x2='0%' y2='100%'>
						<stop offset='0%' stopColor='rgba(230,240,255,1)' />
						<stop offset='20%' stopColor='rgba(200,225,250,0.95)' />
						<stop offset='60%' stopColor='rgba(170,210,245,0.85)' />
						<stop offset='85%' stopColor='rgba(150,200,240,0.7)' />
						<stop offset='100%' stopColor='rgba(140,195,240,0.4)' />
					</linearGradient>

					{/* Highlight gradient for glossy effect */}
					<linearGradient id='icicle-highlight' x1='0%' y1='0%' x2='100%' y2='0%'>
						<stop offset='0%' stopColor='rgba(255,255,255,0)' />
						<stop offset='20%' stopColor='rgba(255,255,255,0.6)' />
						<stop offset='35%' stopColor='rgba(255,255,255,0.2)' />
						<stop offset='100%' stopColor='rgba(255,255,255,0)' />
					</linearGradient>

					{/* Inner refraction effect */}
					<linearGradient id='icicle-inner' x1='0%' y1='0%' x2='100%' y2='100%'>
						<stop offset='0%' stopColor='rgba(255,255,255,0.3)' />
						<stop offset='50%' stopColor='rgba(200,230,255,0.2)' />
						<stop offset='100%' stopColor='rgba(180,220,250,0.1)' />
					</linearGradient>

					{/* Filter for subtle glow */}
					<filter id='icicle-glow' x='-20%' y='-20%' width='140%' height='140%'>
						<feGaussianBlur stdDeviation='1' result='blur' />
						<feComposite in='SourceGraphic' in2='blur' operator='over' />
					</filter>
				</defs>

				{/* Snow/frost base at top */}
				<rect x='0' y='0' width='1000' height='4' fill='rgba(245,250,255,0.9)' />
				<rect x='0' y='4' width='1000' height='2' fill='rgba(230,240,250,0.7)' />

				{/* Individual icicles */}
				{icicles.map(icicle => {
					const x = icicle.x * 10; // Convert percentage to viewBox coordinates
					const w = icicle.width;
					const h = icicle.height;
					const halfW = w / 2;

					// Create organic icicle shape with slight curves
					const bodyPath = `
						M${x - halfW},0
						L${x + halfW},0
						L${x + halfW * 0.9},${h * 0.1}
						Q${x + halfW * 0.85},${h * 0.3} ${x + halfW * 0.7},${h * 0.5}
						Q${x + halfW * 0.5},${h * 0.7} ${x + halfW * 0.25},${h * 0.85}
						Q${x + halfW * 0.1},${h * 0.95} ${x},${h}
						Q${x - halfW * 0.1},${h * 0.95} ${x - halfW * 0.25},${h * 0.85}
						Q${x - halfW * 0.5},${h * 0.7} ${x - halfW * 0.7},${h * 0.5}
						Q${x - halfW * 0.85},${h * 0.3} ${x - halfW * 0.9},${h * 0.1}
						Z
					`;

					// Highlight path (left side reflection)
					const highlightPath = `
						M${x - halfW * 0.6},${h * 0.05}
						Q${x - halfW * 0.7},${h * 0.2} ${x - halfW * 0.5},${h * 0.4}
						Q${x - halfW * 0.3},${h * 0.6} ${x - halfW * 0.15},${h * 0.75}
						L${x - halfW * 0.3},${h * 0.6}
						Q${x - halfW * 0.45},${h * 0.35} ${x - halfW * 0.4},${h * 0.15}
						Z
					`;

					return (
						<g key={icicle.id} className='icicle' style={{animationDelay: `${icicle.delay}s`}} filter='url(#icicle-glow)'>
							{/* Main icicle body */}
							<path d={bodyPath} fill='url(#icicle-fade-gradient)' />

							{/* Horizontal gradient overlay */}
							<path d={bodyPath} fill='url(#icicle-body-gradient)' opacity='0.5' />

							{/* Left edge highlight (light reflection) */}
							<path d={highlightPath} fill='url(#icicle-highlight)' />

							{/* Small bright highlight at top left */}
							<ellipse
								cx={x - halfW * 0.4}
								cy={h * 0.08}
								rx={w * 0.08}
								ry={h * 0.03}
								fill='white'
								opacity='0.7'
							/>

							{/* Inner refraction line */}
							<line
								x1={x + halfW * 0.2}
								y1={h * 0.15}
								x2={x + halfW * 0.05}
								y2={h * 0.7}
								stroke='rgba(255,255,255,0.3)'
								strokeWidth='0.8'
								strokeLinecap='round'
							/>

							{/* Water droplet at tip */}
							<ellipse
								cx={x}
								cy={h - 1}
								rx={w * 0.06}
								ry={h * 0.02}
								fill='rgba(180,220,255,0.6)'
							/>
						</g>
					);
				})}
			</svg>
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
