'use client';

import Link from 'next/link';
import {Home, RefreshCw, Search, ArrowLeft} from 'lucide-react';

type ErrorPageProperties = {
	code: string;
	title: string;
	description: string;
	icon?: 'not-found' | 'forbidden' | 'error' | 'unauthorized';
	showHomeButton?: boolean;
	showBackButton?: boolean;
	showRetryButton?: boolean;
	showSearchButton?: boolean;
	onRetry?: () => void;
};

// Fun illustrated scene for 404 - Lost explorer
function NotFoundIllustration() {
	return (
		<svg viewBox='0 0 400 300' className='w-full max-w-md mx-auto' aria-hidden='true'>
			{/* Background elements */}
			<defs>
				<linearGradient id='skyGradient' x1='0%' y1='0%' x2='0%' y2='100%'>
					<stop offset='0%' stopColor='#fdf2f8' />
					<stop offset='100%' stopColor='#fce7f3' />
				</linearGradient>
			</defs>
			<rect width='400' height='300' fill='url(#skyGradient)' rx='16' />

			{/* Floating clouds */}
			<g className='animate-[float_6s_ease-in-out_infinite]'>
				<ellipse cx='80' cy='60' rx='30' ry='15' fill='white' opacity='0.8' />
				<ellipse cx='100' cy='55' rx='25' ry='12' fill='white' opacity='0.8' />
			</g>
			<g className='animate-[float_8s_ease-in-out_infinite]' style={{animationDelay: '2s'}}>
				<ellipse cx='320' cy='80' rx='35' ry='18' fill='white' opacity='0.7' />
				<ellipse cx='345' cy='75' rx='28' ry='14' fill='white' opacity='0.7' />
			</g>

			{/* Ground */}
			<ellipse cx='200' cy='260' rx='180' ry='30' fill='#afbd43' opacity='0.3' />

			{/* Signpost */}
			<rect x='280' y='150' width='8' height='100' fill='#8B4513' rx='2' />
			<g transform='rotate(-15, 284, 160)'>
				<rect x='260' y='145' width='60' height='25' fill='#ea247b' rx='4' />
				<text x='290' y='162' textAnchor='middle' fill='white' fontSize='10' fontWeight='bold'>???</text>
			</g>
			<g transform='rotate(10, 284, 185)'>
				<rect x='265' y='175' width='55' height='25' fill='#fcb142' rx='4' />
				<text x='292' y='192' textAnchor='middle' fill='white' fontSize='10' fontWeight='bold'>404</text>
			</g>

			{/* Lost character with map */}
			<g className='animate-[wiggle_2s_ease-in-out_infinite]'>
				{/* Body */}
				<ellipse cx='150' cy='230' rx='35' ry='25' fill='#ea247b' />

				{/* Head */}
				<circle cx='150' cy='180' r='30' fill='#fce7f3' />

				{/* Eyes - confused look */}
				<circle cx='140' cy='175' r='5' fill='#333' />
				<circle cx='160' cy='175' r='5' fill='#333' />
				<circle cx='141' cy='173' r='2' fill='white' />
				<circle cx='161' cy='173' r='2' fill='white' />

				{/* Confused eyebrows */}
				<path d='M132 165 Q140 162 148 168' stroke='#333' strokeWidth='2' fill='none' />
				<path d='M152 168 Q160 162 168 165' stroke='#333' strokeWidth='2' fill='none' />

				{/* Mouth - confused */}
				<path d='M140 195 Q150 190 160 195' stroke='#333' strokeWidth='2' fill='none' />

				{/* Question marks floating */}
				<text x='180' y='155' fill='#ea247b' fontSize='20' fontWeight='bold' className='animate-[bounce_1s_ease-in-out_infinite]'>?</text>
				<text x='120' y='145' fill='#fcb142' fontSize='16' fontWeight='bold' className='animate-[bounce_1.5s_ease-in-out_infinite]'>?</text>

				{/* Map in hands */}
				<rect x='115' y='200' width='40' height='30' fill='#f5f5dc' transform='rotate(-10, 135, 215)' />
				<path d='M120 210 L145 210 M120 218 L140 218' stroke='#ccc' strokeWidth='1' transform='rotate(-10, 135, 215)' />
			</g>

			{/* Scattered footprints going in circles */}
			<g fill='#afbd43' opacity='0.5'>
				<ellipse cx='220' cy='250' rx='8' ry='4' />
				<ellipse cx='240' cy='245' rx='8' ry='4' transform='rotate(30, 240, 245)' />
				<ellipse cx='255' cy='255' rx='8' ry='4' transform='rotate(80, 255, 255)' />
				<ellipse cx='245' cy='270' rx='8' ry='4' transform='rotate(140, 245, 270)' />
			</g>
		</svg>
	);
}

// Scene for 500 - Robot having technical difficulties
function ServerErrorIllustration() {
	return (
		<svg viewBox='0 0 400 300' className='w-full max-w-md mx-auto' aria-hidden='true'>
			<defs>
				<linearGradient id='errorBg' x1='0%' y1='0%' x2='0%' y2='100%'>
					<stop offset='0%' stopColor='#fef2f2' />
					<stop offset='100%' stopColor='#fee2e2' />
				</linearGradient>
			</defs>
			<rect width='400' height='300' fill='url(#errorBg)' rx='16' />

			{/* Sparks flying */}
			<g className='animate-[sparkle_0.5s_ease-in-out_infinite]'>
				<path d='M280 100 L290 95 L285 105 L295 100' stroke='#fcb142' strokeWidth='2' fill='none' />
				<path d='M300 120 L310 115 L305 125 L315 120' stroke='#ea247b' strokeWidth='2' fill='none' />
			</g>

			{/* Smoke puffs */}
			<g className='animate-[float_3s_ease-in-out_infinite]' opacity='0.6'>
				<ellipse cx='230' cy='80' rx='20' ry='15' fill='#9ca3af' />
				<ellipse cx='250' cy='70' rx='15' ry='12' fill='#9ca3af' />
				<ellipse cx='220' cy='65' rx='18' ry='10' fill='#d1d5db' />
			</g>

			{/* Robot body */}
			<g>
				{/* Main body */}
				<rect x='160' y='140' width='80' height='90' fill='#6b7280' rx='10' />
				<rect x='170' y='150' width='60' height='40' fill='#1f2937' rx='5' />

				{/* Screen with error */}
				<rect x='175' y='155' width='50' height='30' fill='#ef4444' rx='3' className='animate-[blink_1s_ease-in-out_infinite]' />
				<text x='200' y='175' textAnchor='middle' fill='white' fontSize='14' fontWeight='bold'>ERROR</text>

				{/* Control panel */}
				<circle cx='180' cy='210' r='5' fill='#ea247b' />
				<circle cx='200' cy='210' r='5' fill='#fcb142' />
				<circle cx='220' cy='210' r='5' fill='#afbd43' />

				{/* Head */}
				<rect x='170' y='100' width='60' height='45' fill='#9ca3af' rx='8' />

				{/* Antenna - sparking */}
				<rect x='197' y='80' width='6' height='25' fill='#6b7280' />
				<circle cx='200' cy='75' r='8' fill='#ea247b' className='animate-[pulse_0.5s_ease-in-out_infinite]' />

				{/* Eyes - X X */}
				<g stroke='#1f2937' strokeWidth='3'>
					<path d='M180 115 L190 125 M190 115 L180 125' />
					<path d='M210 115 L220 125 M220 115 L210 125' />
				</g>

				{/* Dizzy mouth */}
				<path d='M185 135 Q200 145 215 135' stroke='#1f2937' strokeWidth='2' fill='none' />

				{/* Arms hanging loose */}
				<rect x='130' y='150' width='35' height='12' fill='#6b7280' rx='6' transform='rotate(20, 147, 156)' />
				<rect x='235' y='150' width='35' height='12' fill='#6b7280' rx='6' transform='rotate(-20, 252, 156)' />

				{/* Legs */}
				<rect x='175' y='225' width='15' height='35' fill='#6b7280' rx='5' />
				<rect x='210' y='225' width='15' height='35' fill='#6b7280' rx='5' />
				<ellipse cx='182' cy='265' rx='12' ry='6' fill='#4b5563' />
				<ellipse cx='217' cy='265' rx='12' ry='6' fill='#4b5563' />
			</g>

			{/* Tools scattered on ground */}
			<rect x='100' y='255' width='30' height='8' fill='#ea247b' rx='2' transform='rotate(-15, 115, 259)' />
			<circle cx='290' cy='260' r='10' fill='#fcb142' />
			<circle cx='290' cy='260' r='5' fill='#fef3c7' />
		</svg>
	);
}

// Scene for 403 - Locked treasure chest
function ForbiddenIllustration() {
	return (
		<svg viewBox='0 0 400 300' className='w-full max-w-md mx-auto' aria-hidden='true'>
			<defs>
				<linearGradient id='forbiddenBg' x1='0%' y1='0%' x2='0%' y2='100%'>
					<stop offset='0%' stopColor='#fff7ed' />
					<stop offset='100%' stopColor='#fed7aa' />
				</linearGradient>
			</defs>
			<rect width='400' height='300' fill='url(#forbiddenBg)' rx='16' />

			{/* Ground */}
			<ellipse cx='200' cy='265' rx='150' ry='25' fill='#d4a574' opacity='0.5' />

			{/* Treasure chest */}
			<g>
				{/* Chest body */}
				<rect x='130' y='180' width='140' height='70' fill='#8B4513' rx='5' />
				<rect x='135' y='185' width='130' height='60' fill='#A0522D' rx='3' />

				{/* Chest lid */}
				<path d='M130 180 Q200 140 270 180' fill='#8B4513' />
				<path d='M135 180 Q200 145 265 180' fill='#A0522D' />

				{/* Metal bands */}
				<rect x='125' y='175' width='150' height='8' fill='#fcb142' rx='2' />
				<rect x='125' y='220' width='150' height='8' fill='#fcb142' rx='2' />

				{/* Big padlock */}
				<g className='animate-[shake_0.5s_ease-in-out_infinite]' style={{transformOrigin: '200px 200px'}}>
					<rect x='180' y='190' width='40' height='35' fill='#6b7280' rx='5' />
					<path d='M190 190 L190 175 Q200 165 210 175 L210 190' stroke='#4b5563' strokeWidth='8' fill='none' />
					<circle cx='200' cy='205' r='6' fill='#1f2937' />
					<rect x='198' y='205' width='4' height='10' fill='#1f2937' />
				</g>
			</g>

			{/* Guard character */}
			<g transform='translate(50, 0)'>
				{/* Body */}
				<rect x='40' y='170' width='50' height='70' fill='#ea247b' rx='10' />

				{/* Head */}
				<circle cx='65' cy='145' r='25' fill='#fce7f3' />

				{/* Guard hat */}
				<rect x='40' y='120' width='50' height='15' fill='#1f2937' rx='3' />
				<ellipse cx='65' cy='120' rx='30' ry='8' fill='#1f2937' />

				{/* Stern eyes */}
				<rect x='52' y='140' width='8' height='4' fill='#1f2937' />
				<rect x='68' y='140' width='8' height='4' fill='#1f2937' />

				{/* Frown */}
				<path d='M55 160 Q65 155 75 160' stroke='#1f2937' strokeWidth='2' fill='none' />

				{/* Arms crossed */}
				<ellipse cx='65' cy='195' rx='30' ry='12' fill='#fce7f3' />

				{/* Legs */}
				<rect x='45' y='235' width='15' height='25' fill='#1f2937' rx='3' />
				<rect x='68' y='235' width='15' height='25' fill='#1f2937' rx='3' />
			</g>

			{/* Stop sign */}
			<g transform='translate(290, 100)'>
				<rect x='15' y='50' width='6' height='80' fill='#6b7280' />
				<polygon points='18,0 48,15 48,45 18,60 -12,45 -12,15' fill='#ef4444' />
				<text x='18' y='35' textAnchor='middle' fill='white' fontSize='12' fontWeight='bold'>STOP</text>
			</g>
		</svg>
	);
}

// Scene for 401 - Key needed
function UnauthorizedIllustration() {
	return (
		<svg viewBox='0 0 400 300' className='w-full max-w-md mx-auto' aria-hidden='true'>
			<defs>
				<linearGradient id='authBg' x1='0%' y1='0%' x2='0%' y2='100%'>
					<stop offset='0%' stopColor='#fefce8' />
					<stop offset='100%' stopColor='#fef08a' />
				</linearGradient>
			</defs>
			<rect width='400' height='300' fill='url(#authBg)' rx='16' />

			{/* Door */}
			<rect x='140' y='80' width='120' height='180' fill='#8B4513' rx='5' />
			<rect x='150' y='90' width='100' height='160' fill='#A0522D' rx='3' />

			{/* Door panels */}
			<rect x='160' y='100' width='80' height='60' fill='#8B4513' rx='2' />
			<rect x='160' y='170' width='80' height='60' fill='#8B4513' rx='2' />

			{/* Door knob with keyhole */}
			<circle cx='245' cy='170' r='12' fill='#fcb142' />
			<ellipse cx='245' cy='168' rx='3' ry='5' fill='#1f2937' />
			<rect x='243' y='170' width='4' height='6' fill='#1f2937' />

			{/* Glowing effect around keyhole */}
			<circle cx='245' cy='170' r='18' fill='none' stroke='#fcb142' strokeWidth='2' opacity='0.5' className='animate-[pulse_2s_ease-in-out_infinite]' />

			{/* Character looking for key */}
			<g className='animate-[bounce_2s_ease-in-out_infinite]'>
				{/* Body */}
				<ellipse cx='80' cy='220' rx='30' ry='25' fill='#afbd43' />

				{/* Head */}
				<circle cx='80' cy='175' r='25' fill='#fce7f3' />

				{/* Eyes looking at door */}
				<circle cx='88' cy='172' r='4' fill='#333' />
				<circle cx='98' cy='172' r='4' fill='#333' />
				<circle cx='89' cy='170' r='1.5' fill='white' />
				<circle cx='99' cy='170' r='1.5' fill='white' />

				{/* Thinking expression */}
				<path d='M75 188 Q85 192 95 188' stroke='#333' strokeWidth='2' fill='none' />

				{/* Hand scratching head */}
				<ellipse cx='55' cy='155' rx='10' ry='8' fill='#fce7f3' />
			</g>

			{/* Giant floating key */}
			<g className='animate-[float_3s_ease-in-out_infinite]' transform='translate(290, 100)'>
				<ellipse cx='0' cy='0' rx='20' ry='20' fill='#fcb142' />
				<ellipse cx='0' cy='0' rx='10' ry='10' fill='#fef3c7' />
				<rect x='-5' y='15' width='10' height='60' fill='#fcb142' rx='3' />
				<rect x='0' y='55' width='20' height='8' fill='#fcb142' rx='2' />
				<rect x='0' y='40' width='15' height='8' fill='#fcb142' rx='2' />

				{/* Sparkles around key */}
				<g fill='#ea247b'>
					<polygon points='35,10 38,15 43,15 39,19 41,24 35,21 29,24 31,19 27,15 32,15' className='animate-[sparkle_1s_ease-in-out_infinite]' />
					<polygon points='-25,-5 -22,0 -17,0 -21,4 -19,9 -25,6 -31,9 -29,4 -33,0 -28,0' className='animate-[sparkle_1.5s_ease-in-out_infinite]' />
				</g>
			</g>

			{/* Thought bubble */}
			<g fill='white'>
				<circle cx='110' cy='140' r='5' opacity='0.8' />
				<circle cx='125' cy='125' r='8' opacity='0.8' />
				<ellipse cx='155' cy='100' rx='25' ry='20' />
				<text x='155' y='105' textAnchor='middle' fill='#333' fontSize='16'>🔑?</text>
			</g>
		</svg>
	);
}

const illustrationMap = {
	'not-found': NotFoundIllustration,
	forbidden: ForbiddenIllustration,
	error: ServerErrorIllustration,
	unauthorized: UnauthorizedIllustration,
};

export function ErrorPage({
	code,
	title,
	description,
	icon = 'not-found',
	showHomeButton = true,
	showBackButton = true,
	showRetryButton = false,
	showSearchButton = false,
	onRetry,
}: Readonly<ErrorPageProperties>) {
	const Illustration = illustrationMap[icon];

	return (
		<div className='min-h-[70vh] flex items-center justify-center px-4 py-12'>
			<div className='text-center max-w-xl'>
				{/* Illustration */}
				<div className='mb-8'>
					<Illustration />
				</div>

				{/* Error code - subtle */}
				<p className='text-sm font-mono text-gray-600 mb-2'>Foutcode {code}</p>

				{/* Title */}
				<h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>{title}</h1>

				{/* Description */}
				<p className='text-gray-600 mb-8 text-lg leading-relaxed'>{description}</p>

				{/* Action buttons */}
				<div className='flex flex-wrap justify-center gap-3'>
					{showHomeButton && (
						<Link
							href='/'
							className='inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-hover transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-elevated shadow-primary/25'
						>
							<Home className='w-5 h-5' />
							Naar home
						</Link>
					)}

					{showBackButton && (
						<button
							type='button'
							onClick={() => {
								window.history.back();
							}}
							className='inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 border border-gray-200 shadow-subtle'
						>
							<ArrowLeft className='w-5 h-5' />
							Ga terug
						</button>
					)}

					{showRetryButton && onRetry && (
						<button
							type='button'
							onClick={onRetry}
							className='inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 border border-gray-200 shadow-subtle'
						>
							<RefreshCw className='w-5 h-5' />
							Probeer opnieuw
						</button>
					)}

					{showSearchButton && (
						<Link
							href='/'
							className='inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 border border-gray-200 shadow-subtle'
						>
							<Search className='w-5 h-5' />
							Zoeken
						</Link>
					)}
				</div>

				{/* Help text */}
				<p className='mt-10 text-sm text-gray-500'>
					Blijft dit probleem?{' '}
					<Link href='/contact' className='text-primary hover:underline font-medium'>
						Laat het ons weten
					</Link>
					, dan helpen we je graag verder.
				</p>
			</div>
		</div>
	);
}

// Pre-configured error pages with fun copy
export function NotFoundPage() {
	return (
		<ErrorPage
			code='404'
			title='Oeps, verdwaald!'
			description='We hebben overal gezocht, maar deze pagina lijkt spoorloos verdwenen. Misschien is ze op avontuur gegaan?'
			icon='not-found'
			showSearchButton
		/>
	);
}

export function ForbiddenPage() {
	return (
		<ErrorPage
			code='403'
			title='Hier mag je niet komen'
			description='Deze schat is goed bewaakt! Je hebt geen toegang tot deze pagina. Probeer een andere route.'
			icon='forbidden'
			showSearchButton={false}
		/>
	);
}

export function UnauthorizedPage() {
	return (
		<ErrorPage
			code='401'
			title='Sleutel vergeten?'
			description='Om deze deur te openen moet je eerst inloggen. Pak je sleutel erbij!'
			icon='unauthorized'
			showBackButton={false}
			showSearchButton={false}
		/>
	);
}

type ServerErrorPageProperties = {
	reset?: () => void;
};

export function ServerErrorPage({reset}: Readonly<ServerErrorPageProperties>) {
	return (
		<ErrorPage
			code='500'
			title='Oeps, kortsluiting!'
			description='Onze robot heeft even een dipje. We zijn al bezig om hem weer op te laden. Probeer het zo opnieuw!'
			icon='error'
			showRetryButton={Boolean(reset)}
			onRetry={reset}
		/>
	);
}

// Admin-specific error pages with cleaner styling
type AdminErrorPageProperties = {
	code: string;
	title: string;
	description: string;
	showRetry?: boolean;
	onRetry?: () => void;
};

export function AdminErrorPage({
	code,
	title,
	description,
	showRetry = false,
	onRetry,
}: Readonly<AdminErrorPageProperties>) {
	return (
		<div className='flex items-center justify-center min-h-[50vh]'>
			<div className='text-center max-w-md'>
				<div className='mb-6 text-6xl'>
					{code === '500' ? '🤖' : code === '404' ? '🔍' : code === '403' ? '🔒' : '⚠️'}
				</div>
				<p className='text-sm font-mono text-gray-600 mb-2'>Fout {code}</p>
				<h1 className='text-xl font-bold text-gray-900 mb-2'>{title}</h1>
				<p className='text-gray-600 mb-6'>{description}</p>

				<div className='flex justify-center gap-3'>
					<Link
						href='/admin'
						className='inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-button hover:bg-primary-hover transition-colors'
					>
						<Home className='w-4 h-4' />
						Dashboard
					</Link>

					{showRetry && onRetry && (
						<button
							type='button'
							onClick={onRetry}
							className='inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-button hover:bg-gray-200 transition-colors'
						>
							<RefreshCw className='w-4 h-4' />
							Opnieuw
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
