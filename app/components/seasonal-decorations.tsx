'use client';

import {useEffect, useState, useMemo} from 'react';

// Christmas lights that hang across the top of the page
function ChristmasLights() {
	const lights = useMemo(() => {
		const colors = ['#ff0000', '#00ff00', '#ffff00', '#0066ff', '#ff00ff', '#00ffff'];
		return Array.from({length: 20}, (_, index) => ({
			id: index,
			color: colors[index % colors.length],
			delay: index * 0.15,
		}));
	}, []);

	return (
		<div className='fixed top-0 left-0 right-0 z-50 pointer-events-none' aria-hidden='true'>
			<svg viewBox='0 0 1000 60' preserveAspectRatio='none' className='w-full h-12 md:h-16'>
				{/* Wire */}
				<path
					d='M0,10 Q50,25 100,10 Q150,25 200,10 Q250,25 300,10 Q350,25 400,10 Q450,25 500,10 Q550,25 600,10 Q650,25 700,10 Q750,25 800,10 Q850,25 900,10 Q950,25 1000,10'
					fill='none'
					stroke='#1a472a'
					strokeWidth='2'
				/>
				{/* Light bulbs */}
				{lights.map(light => {
					const x = (light.id + 0.5) * 50;
					const y = light.id % 2 === 0 ? 15 : 20;
					return (
						<g key={light.id}>
							{/* Socket */}
							<rect x={x - 3} y={y - 2} width='6' height='6' fill='#1a472a' />
							{/* Bulb */}
							<ellipse
								cx={x}
								cy={y + 12}
								rx='6'
								ry='10'
								fill={light.color}
								className='christmas-light-bulb'
								style={{
									animationDelay: `${light.delay}s`,
									filter: `drop-shadow(0 0 6px ${light.color})`,
								}}
							/>
						</g>
					);
				})}
			</svg>
		</div>
	);
}

// Falling snowflakes animation
function Snowfall() {
	const [snowflakes, setSnowflakes] = useState<Array<{
		id: number;
		x: number;
		size: number;
		duration: number;
		delay: number;
		opacity: number;
	}>>([]);

	useEffect(() => {
		const flakes = Array.from({length: 50}, (_, index) => ({
			id: index,
			x: Math.random() * 100,
			size: Math.random() * 8 + 4,
			duration: Math.random() * 10 + 10,
			delay: Math.random() * 10,
			opacity: Math.random() * 0.6 + 0.4,
		}));
		setSnowflakes(flakes);
	}, []);

	if (snowflakes.length === 0) return null;

	return (
		<div className='fixed inset-0 pointer-events-none overflow-hidden z-40' aria-hidden='true'>
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
					<svg viewBox='0 0 24 24' fill='white' className='w-full h-full'>
						<path d='M12,2 L12,22 M2,12 L22,12 M4.93,4.93 L19.07,19.07 M4.93,19.07 L19.07,4.93 M12,2 L14,5 M12,2 L10,5 M12,22 L14,19 M12,22 L10,19 M2,12 L5,14 M2,12 L5,10 M22,12 L19,14 M22,12 L19,10' stroke='white' strokeWidth='1.5' fill='none' />
					</svg>
				</div>
			))}
		</div>
	);
}

// Icicles hanging from the top of the viewport
function Icicles() {
	const icicles = useMemo(() => {
		return Array.from({length: 15}, (_, index) => ({
			id: index,
			width: Math.random() * 15 + 8,
			height: Math.random() * 60 + 30,
			x: (index + 0.5) * (100 / 15),
			delay: index * 0.1,
		}));
	}, []);

	return (
		<div className='fixed top-0 left-0 right-0 z-30 pointer-events-none' aria-hidden='true'>
			<div className='relative w-full h-24'>
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
									<stop offset='0%' stopColor='rgba(255,255,255,0.95)' />
									<stop offset='50%' stopColor='rgba(200,230,255,0.85)' />
									<stop offset='100%' stopColor='rgba(150,200,255,0.7)' />
								</linearGradient>
							</defs>
							<path
								d='M2,0 L18,0 L16,15 Q15,50 12,80 Q10,95 10,100 Q10,95 8,80 Q5,50 4,15 Z'
								fill={`url(#icicle-grad-${icicle.id})`}
								filter='drop-shadow(0 2px 4px rgba(100,150,200,0.3))'
							/>
						</svg>
					</div>
				))}
			</div>
		</div>
	);
}

// Gingerbread man decorations on the sides
function GingerbreadMan() {
	return (
		<>
			{/* Left gingerbread man */}
			<div className='fixed left-4 top-1/4 z-30 pointer-events-none gingerbread-bounce' aria-hidden='true'>
				<svg viewBox='0 0 80 100' className='w-16 h-20 md:w-20 md:h-24'>
					{/* Body */}
					<ellipse cx='40' cy='55' rx='22' ry='28' fill='#c4813c' />
					{/* Head */}
					<circle cx='40' cy='22' r='18' fill='#c4813c' />
					{/* Left arm */}
					<ellipse cx='12' cy='50' rx='10' ry='8' fill='#c4813c' />
					{/* Right arm */}
					<ellipse cx='68' cy='50' rx='10' ry='8' fill='#c4813c' />
					{/* Left leg */}
					<ellipse cx='28' cy='88' rx='8' ry='10' fill='#c4813c' />
					{/* Right leg */}
					<ellipse cx='52' cy='88' rx='8' ry='10' fill='#c4813c' />
					{/* Eyes */}
					<circle cx='34' cy='18' r='3' fill='#4a3728' />
					<circle cx='46' cy='18' r='3' fill='#4a3728' />
					{/* Smile */}
					<path d='M32,28 Q40,36 48,28' fill='none' stroke='#4a3728' strokeWidth='2' strokeLinecap='round' />
					{/* Buttons */}
					<circle cx='40' cy='45' r='3' fill='#e74c3c' />
					<circle cx='40' cy='58' r='3' fill='#27ae60' />
					<circle cx='40' cy='71' r='3' fill='#e74c3c' />
					{/* Icing decoration */}
					<path d='M22,55 Q40,48 58,55' fill='none' stroke='white' strokeWidth='2' strokeLinecap='round' />
					<path d='M5,50 L18,50' fill='none' stroke='white' strokeWidth='2' strokeLinecap='round' />
					<path d='M62,50 L75,50' fill='none' stroke='white' strokeWidth='2' strokeLinecap='round' />
				</svg>
			</div>
			{/* Right gingerbread man */}
			<div className='fixed right-4 bottom-1/4 z-30 pointer-events-none gingerbread-bounce' style={{animationDelay: '0.5s'}} aria-hidden='true'>
				<svg viewBox='0 0 80 100' className='w-16 h-20 md:w-20 md:h-24 -scale-x-100'>
					{/* Body */}
					<ellipse cx='40' cy='55' rx='22' ry='28' fill='#c4813c' />
					{/* Head */}
					<circle cx='40' cy='22' r='18' fill='#c4813c' />
					{/* Left arm */}
					<ellipse cx='12' cy='50' rx='10' ry='8' fill='#c4813c' />
					{/* Right arm */}
					<ellipse cx='68' cy='50' rx='10' ry='8' fill='#c4813c' />
					{/* Left leg */}
					<ellipse cx='28' cy='88' rx='8' ry='10' fill='#c4813c' />
					{/* Right leg */}
					<ellipse cx='52' cy='88' rx='8' ry='10' fill='#c4813c' />
					{/* Eyes */}
					<circle cx='34' cy='18' r='3' fill='#4a3728' />
					<circle cx='46' cy='18' r='3' fill='#4a3728' />
					{/* Smile */}
					<path d='M32,28 Q40,36 48,28' fill='none' stroke='#4a3728' strokeWidth='2' strokeLinecap='round' />
					{/* Buttons */}
					<circle cx='40' cy='45' r='3' fill='#27ae60' />
					<circle cx='40' cy='58' r='3' fill='#e74c3c' />
					<circle cx='40' cy='71' r='3' fill='#27ae60' />
					{/* Icing decoration */}
					<path d='M22,55 Q40,48 58,55' fill='none' stroke='white' strokeWidth='2' strokeLinecap='round' />
					<path d='M5,50 L18,50' fill='none' stroke='white' strokeWidth='2' strokeLinecap='round' />
					<path d='M62,50 L75,50' fill='none' stroke='white' strokeWidth='2' strokeLinecap='round' />
				</svg>
			</div>
		</>
	);
}

// Christmas tree balls/ornaments on the sides
function ChristmasBalls() {
	const balls = useMemo(() => {
		const colors = ['#e74c3c', '#27ae60', '#f1c40f', '#3498db', '#9b59b6'];
		return Array.from({length: 6}, (_, index) => ({
			id: index,
			color: colors[index % colors.length],
			size: Math.random() * 15 + 25,
			y: 15 + index * 15,
			side: index % 2 === 0 ? 'left' : 'right',
			delay: index * 0.2,
		}));
	}, []);

	return (
		<>
			{balls.map(ball => (
				<div
					key={ball.id}
					className={`fixed ${ball.side === 'left' ? 'left-2 md:left-6' : 'right-2 md:right-6'} z-30 pointer-events-none christmas-ball-swing`}
					style={{
						top: `${ball.y}%`,
						animationDelay: `${ball.delay}s`,
					}}
					aria-hidden='true'
				>
					<svg viewBox='0 0 50 70' style={{width: `${ball.size}px`, height: `${ball.size * 1.4}px`}}>
						{/* String */}
						<line x1='25' y1='0' x2='25' y2='15' stroke='#1a472a' strokeWidth='1.5' />
						{/* Cap */}
						<rect x='19' y='12' width='12' height='8' rx='2' fill='#c0a000' />
						{/* Loop */}
						<circle cx='25' cy='8' r='4' fill='none' stroke='#c0a000' strokeWidth='2' />
						{/* Ball */}
						<defs>
							<radialGradient id={`ball-grad-${ball.id}`} cx='30%' cy='30%'>
								<stop offset='0%' stopColor='white' stopOpacity='0.8' />
								<stop offset='30%' stopColor={ball.color} />
								<stop offset='100%' stopColor={ball.color} stopOpacity='0.8' />
							</radialGradient>
						</defs>
						<circle cx='25' cy='42' r='20' fill={`url(#ball-grad-${ball.id})`} />
						{/* Shine */}
						<ellipse cx='18' cy='35' rx='5' ry='8' fill='white' opacity='0.3' />
					</svg>
				</div>
			))}
		</>
	);
}

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

	/* Gingerbread bounce */
	@keyframes gingerbread-bounce {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-10px); }
	}

	.gingerbread-bounce {
		animation: gingerbread-bounce 2s ease-in-out infinite;
	}

	/* Christmas ball swing */
	@keyframes ball-swing {
		0%, 100% { transform: rotate(-5deg); }
		50% { transform: rotate(5deg); }
	}

	.christmas-ball-swing {
		transform-origin: top center;
		animation: ball-swing 3s ease-in-out infinite;
	}

	/* Respect reduced motion preference */
	@media (prefers-reduced-motion: reduce) {
		.christmas-light-bulb,
		.snowflake,
		.icicle,
		.gingerbread-bounce,
		.christmas-ball-swing {
			animation: none !important;
		}

		.snowflake {
			display: none;
		}
	}
`;

export type SeasonalDecorationsProps = {
	config: {
		enabled: boolean;
		decorations: {
			christmasLights: boolean;
			snowfall: boolean;
			icicles: boolean;
			gingerbreadMan: boolean;
			christmasBalls: boolean;
		};
	};
};

export function SeasonalDecorations({config}: Readonly<SeasonalDecorationsProps>) {
	if (!config.enabled) return null;

	return (
		<>
			{/* eslint-disable-next-line react/no-danger */}
			<style dangerouslySetInnerHTML={{__html: seasonalStyles}} />
			{config.decorations.christmasLights && <ChristmasLights />}
			{config.decorations.snowfall && <Snowfall />}
			{config.decorations.icicles && <Icicles />}
			{config.decorations.gingerbreadMan && <GingerbreadMan />}
			{config.decorations.christmasBalls && <ChristmasBalls />}
		</>
	);
}

// Default configuration
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
