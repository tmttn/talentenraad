'use client';

import {useEffect, useState} from 'react';

type Announcement = {
	id: string;
	data: {
		tekst: string;
		link?: string;
		linkTekst?: string;
		type: 'info' | 'waarschuwing' | 'belangrijk';
		actief: boolean;
	};
};

const BUILDER_API_KEY = '3706422a8e454ceebe64acdc5a1475ba';

export function AnnouncementBanner() {
	const [announcement, setAnnouncement] = useState<Announcement | undefined>(undefined);
	const [isVisible, setIsVisible] = useState(true);

	useEffect(() => {
		async function fetchAnnouncement() {
			try {
				const url = new URL('https://cdn.builder.io/api/v3/content/aankondiging');
				url.searchParams.set('apiKey', BUILDER_API_KEY);
				url.searchParams.set('limit', '1');
				url.searchParams.set('query.data.actief', 'true');
				url.searchParams.set('cachebust', 'true');

				const response = await fetch(url.toString(), {cache: 'no-store'});

				// Gracefully handle 404 - content type may not exist yet
				if (!response.ok) {
					return;
				}

				const data = await response.json();

				if (data.results && data.results.length > 0) {
					setAnnouncement(data.results[0]);
				}
			} catch {
				// Silently fail - announcements are optional
			}
		}

		fetchAnnouncement();
	}, []);

	if (!announcement || !isVisible) {
		return null;
	}

	const typeStyles = {
		info: {
			bg: 'bg-blue-600',
			icon: (
				<svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
				</svg>
			),
		},
		waarschuwing: {
			bg: 'bg-amber-500',
			icon: (
				<svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
				</svg>
			),
		},
		belangrijk: {
			bg: 'bg-primary',
			icon: (
				<svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' />
				</svg>
			),
		},
	};

	const style = typeStyles[announcement.data.type] || typeStyles.info;

	return (
		<div className={`${style.bg} text-white`} role='alert'>
			<div className='max-w-[1280px] mx-auto px-4 py-3 flex items-center justify-between gap-4'>
				<div className='flex items-center gap-3 flex-1'>
					<span className='flex-shrink-0' aria-hidden='true'>{style.icon}</span>
					<p className='text-sm font-medium'>
						{announcement.data.tekst}
						{announcement.data.link && announcement.data.linkTekst && (
							<a
								href={announcement.data.link}
								className='ml-2 underline hover:no-underline font-bold'
							>
								{announcement.data.linkTekst} →
							</a>
						)}
					</p>
				</div>
				<button
					type='button'
					onClick={() => {
						setIsVisible(false);
					}}
					className='flex-shrink-0 p-1 rounded hover:bg-white/20 transition-colors'
					aria-label='Aankondiging sluiten'
				>
					<svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
						<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
					</svg>
				</button>
			</div>
		</div>
	);
}

export const AnnouncementBannerInfo = {
	name: 'AnnouncementBanner',
	component: AnnouncementBanner,
	inputs: [],
};
