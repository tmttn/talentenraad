'use client';

import {useEffect, useState} from 'react';
import {
	Info,
	AlertTriangle,
	Star,
	X,
} from 'lucide-react';

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

const builderApiKey = '3706422a8e454ceebe64acdc5a1475ba';

export function AnnouncementBanner() {
	const [announcement, setAnnouncement] = useState<Announcement | undefined>(undefined);
	const [isVisible, setIsVisible] = useState(true);

	useEffect(() => {
		async function fetchAnnouncement() {
			try {
				const url = new URL('https://cdn.builder.io/api/v3/content/aankondiging');
				url.searchParams.set('apiKey', builderApiKey);
				url.searchParams.set('limit', '1');
				url.searchParams.set('query.data.actief', 'true');
				url.searchParams.set('cachebust', 'true');

				const response = await fetch(url.toString(), {cache: 'no-store'});

				// Gracefully handle 404 - content type may not exist yet
				if (!response.ok) {
					return;
				}

				const data = await response.json() as {results?: Announcement[]};

				if (data.results && data.results.length > 0) {
					setAnnouncement(data.results[0]);
				}
			} catch {
				// Silently fail - announcements are optional
			}
		}

		void fetchAnnouncement();
	}, []);

	if (!announcement || !isVisible) {
		return null;
	}

	const typeStyles = {
		info: {
			bg: 'bg-info-600',
			icon: <Info className='h-5 w-5' aria-hidden='true' />,
		},
		waarschuwing: {
			bg: 'bg-warning-500',
			icon: <AlertTriangle className='h-5 w-5' aria-hidden='true' />,
		},
		belangrijk: {
			bg: 'bg-primary',
			icon: <Star className='h-5 w-5' aria-hidden='true' />,
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
					<X className='h-5 w-5' aria-hidden='true' />
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
