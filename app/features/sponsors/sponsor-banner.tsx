'use client';

import {
	useState,
	useEffect,
	useRef,
	useCallback,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type {Sponsor} from '@lib/builder-types';

type SponsorBannerProperties = {
	hidden?: boolean;
	rotationInterval?: number; // In seconds
	showTierBadge?: boolean;
	variant?: 'default' | 'compact' | 'minimal';
	title?: string;
};

const builderPublicApiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY ?? '';

// Track sponsor event (impression or click)
async function trackSponsorEvent(
	sponsorId: string,
	sponsorName: string,
	eventType: 'impression' | 'click',
) {
	try {
		await fetch('/api/sponsors/track', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({sponsorId, sponsorName, eventType}),
		});
	} catch (error) {
		// Silently fail - don't disrupt user experience
		console.error('Failed to track sponsor event:', error);
	}
}

function SponsorBanner({
	hidden = false,
	rotationInterval = 5,
	showTierBadge = true,
	variant = 'default',
	title = 'Met dank aan onze sponsors',
}: Readonly<SponsorBannerProperties>) {
	const [sponsors, setSponsors] = useState<Sponsor[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [isVisible, setIsVisible] = useState(false);
	const bannerRef = useRef<HTMLDivElement>(null);
	const trackedImpressions = useRef<Set<string>>(new Set());

	// Fetch sponsors from Builder.io
	useEffect(() => {
		async function fetchSponsors() {
			try {
				const url = new URL('https://cdn.builder.io/api/v3/content/sponsor');
				url.searchParams.set('apiKey', builderPublicApiKey);
				url.searchParams.set('limit', '50');
				url.searchParams.set('query.data.actief', 'true');
				url.searchParams.set('sort.data.volgorde', '1');

				const response = await fetch(url.toString(), {cache: 'no-store'});

				if (!response.ok) {
					throw new Error('Failed to fetch sponsors');
				}

				const data = await response.json() as {results: Sponsor[]};

				// Sort by tier priority and then by volgorde
				const tierOrder = {
					gold: 1,
					silver: 2,
					bronze: 3,
					partner: 4,
				};
				const sorted = [...data.results].sort((a, b) => {
					const tierDiff = (tierOrder[a.data.tier] ?? 5) - (tierOrder[b.data.tier] ?? 5);
					if (tierDiff !== 0) {
						return tierDiff;
					}

					return (a.data.volgorde ?? 0) - (b.data.volgorde ?? 0);
				});

				setSponsors(sorted);
			} catch (error) {
				console.error('Error fetching sponsors:', error);
			} finally {
				setIsLoading(false);
			}
		}

		if (!hidden) {
			void fetchSponsors();
		}
	}, [hidden]);

	// Set up rotation interval
	useEffect(() => {
		if (hidden || sponsors.length <= 1) {
			return;
		}

		const interval = setInterval(() => {
			setCurrentIndex(previousIndex => (previousIndex + 1) % sponsors.length);
		}, rotationInterval * 1000);

		return () => {
			clearInterval(interval);
		};
	}, [hidden, sponsors.length, rotationInterval]);

	// Set up Intersection Observer for impression tracking
	useEffect(() => {
		if (hidden || !bannerRef.current) {
			return;
		}

		const observer = new IntersectionObserver(
			entries => {
				const [entry] = entries;
				setIsVisible(entry?.isIntersecting ?? false);
			},
			{threshold: 0.5}, // At least 50% visible
		);

		observer.observe(bannerRef.current);

		return () => {
			observer.disconnect();
		};
	}, [hidden]);

	// Track impression when visible and sponsor changes
	useEffect(() => {
		if (!isVisible || sponsors.length === 0) {
			return;
		}

		const currentSponsor = sponsors[currentIndex];
		if (!currentSponsor) {
			return;
		}

		// Only track each sponsor impression once per page view
		const impressionKey = `${currentSponsor.id}-${currentIndex}`;
		if (trackedImpressions.current.has(impressionKey)) {
			return;
		}

		trackedImpressions.current.add(impressionKey);
		void trackSponsorEvent(currentSponsor.id, currentSponsor.data.naam, 'impression');
	}, [isVisible, currentIndex, sponsors]);

	// Handle sponsor click
	const handleClick = useCallback((sponsor: Sponsor) => {
		void trackSponsorEvent(sponsor.id, sponsor.data.naam, 'click');
	}, []);

	if (hidden || isLoading || sponsors.length === 0) {
		return null;
	}

	const currentSponsor = sponsors[currentIndex];
	if (!currentSponsor) {
		return null;
	}

	const tierColors = {
		gold: 'bg-amber-100 text-amber-800 border-amber-300',
		silver: 'bg-gray-100 text-gray-700 border-gray-300',
		bronze: 'bg-orange-100 text-orange-800 border-orange-300',
		partner: 'bg-blue-100 text-blue-800 border-blue-300',
	};

	const tierLabels = {
		gold: 'Goud',
		silver: 'Zilver',
		bronze: 'Brons',
		partner: 'Partner',
	};

	const variants = {
		default: 'py-8 md:py-12',
		compact: 'py-4 md:py-6',
		minimal: 'py-2 md:py-4',
	};

	const SponsorContent = (
		<div className='flex flex-col items-center gap-4'>
			{variant !== 'minimal' && title && (
				<p className='text-sm text-gray-500 uppercase tracking-wider font-medium'>
					{title}
				</p>
			)}

			<div className='flex items-center gap-4'>
				{currentSponsor.data.logo && (
					<div className='relative h-12 w-32 md:h-16 md:w-40'>
						<Image
							src={currentSponsor.data.logo}
							alt={currentSponsor.data.naam}
							fill
							className='object-contain'
							sizes='(max-width: 768px) 128px, 160px'
						/>
					</div>
				)}

				{showTierBadge && variant !== 'minimal' && (
					<span className={`px-2 py-1 text-xs font-medium rounded border ${tierColors[currentSponsor.data.tier]}`}>
						{tierLabels[currentSponsor.data.tier]}
					</span>
				)}
			</div>

			{variant === 'default' && currentSponsor.data.beschrijving && (
				<p className='text-sm text-gray-600 text-center max-w-md'>
					{currentSponsor.data.beschrijving}
				</p>
			)}

			{sponsors.length > 1 && variant !== 'minimal' && (
				<div className='flex gap-1.5 mt-2'>
					{sponsors.map((_, index) => (
						<button
							key={sponsors[index]?.id ?? index}
							type='button'
							onClick={() => {
								setCurrentIndex(index);
							}}
							className={`w-2 h-2 rounded-full transition-colors ${
								index === currentIndex
									? 'bg-brand-primary-500'
									: 'bg-gray-300 hover:bg-gray-400'
							}`}
							aria-label={`Ga naar sponsor ${index + 1}`}
						/>
					))}
				</div>
			)}
		</div>
	);

	return (
		<section
			ref={bannerRef}
			className={`bg-gray-50 ${variants[variant]}`}
		>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				{currentSponsor.data.website
					? (
						<Link
							href={currentSponsor.data.website}
							target='_blank'
							rel='noopener noreferrer sponsored'
							onClick={() => {
								handleClick(currentSponsor);
							}}
							className='block hover:opacity-80 transition-opacity'
						>
							{SponsorContent}
						</Link>
					)
					: SponsorContent}
			</div>
		</section>
	);
}

export const SponsorBannerInfo = {
	name: 'SponsorBanner',
	component: SponsorBanner,
	inputs: [
		{
			name: 'hidden',
			type: 'boolean',
			defaultValue: false,
			helperText: 'Verberg de sponsorbanner',
		},
		{
			name: 'rotationInterval',
			type: 'number',
			defaultValue: 5,
			helperText: 'Seconden tussen het wisselen van sponsors',
		},
		{
			name: 'showTierBadge',
			type: 'boolean',
			defaultValue: true,
			helperText: 'Toon het sponsorniveau (Goud, Zilver, etc.)',
		},
		{
			name: 'variant',
			type: 'string',
			enum: ['default', 'compact', 'minimal'],
			defaultValue: 'default',
			helperText: 'default: volledig met beschrijving, compact: kleiner, minimal: alleen logo',
		},
		{
			name: 'title',
			type: 'string',
			defaultValue: 'Met dank aan onze sponsors',
			helperText: 'Titel boven de sponsorbanner',
		},
	],
};
