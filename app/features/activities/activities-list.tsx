'use client';

import {useEffect, useState} from 'react';
import {AnimatedLink} from '@components/ui';

const locationIconPath = 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z';
const locationDotPath = 'M15 11a3 3 0 11-6 0 3 3 0 016 0z';

const articleClassName = [
	'flex items-start gap-6 bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow',
	'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 group',
].join(' ');

type Activity = {
	id: string;
	data: {
		titel: string;
		datum: string;
		tijd?: string;
		locatie?: string;
		beschrijving?: string;
		categorie: string;
		vastgepind?: boolean;
		volgorde?: number;
	};
};

type ActivitiesListProperties = {
	title?: string;
	subtitle?: string;
	showViewAll?: boolean;
	viewAllLink?: string;
	limit?: number;
	category?: string;
	showLocation?: boolean;
	showDescription?: boolean;
};

// Use environment variable for API key
// eslint-disable-next-line n/prefer-global/process
const builderApiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY!;

function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.normalize('NFD')
		.replaceAll(/[\u0300-\u036F]/g, '')
		.replaceAll(/[^a-z\d\s-]/g, '')
		.replaceAll(/\s+/g, '-')
		.replaceAll(/-+/g, '-')
		.trim();
}

function ActivitiesList({
	title = 'Komende activiteiten',
	subtitle,
	showViewAll = true,
	viewAllLink = '/kalender',
	limit = 5,
	category,
	showLocation = true,
	showDescription = false,
}: Readonly<ActivitiesListProperties>) {
	const [activities, setActivities] = useState<Activity[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadingMessage, setLoadingMessage] = useState('Activiteiten worden geladen...');

	useEffect(() => {
		async function fetchActivities() {
			try {
				// Get today's date in YYYY-MM-DD format for API filtering
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				const todayString = today.toISOString().split('T')[0];

				const url = new URL('https://cdn.builder.io/api/v3/content/activiteit');
				url.searchParams.set('apiKey', builderApiKey);
				// Fetch more than limit to account for pinning/sorting, then slice
				url.searchParams.set('limit', String(Math.max(limit * 3, 20)));
				url.searchParams.set('sort.data.datum', '1'); // Sort by date ascending
				url.searchParams.set('cachebust', 'true');
				// Filter for future events at API level
				url.searchParams.set('query.data.datum.$gte', todayString);

				if (category) {
					url.searchParams.set('query.data.categorie.$eq', category);
				}

				const response = await fetch(url.toString(), {cache: 'no-store'});
				const data = await response.json() as {results?: Activity[]};

				if (data.results) {
					// Sort: pinned first, then by volgorde, then by date
					const sortedEvents = [...data.results].sort((a: Activity, b: Activity) => {
						// Pinned items first
						if (a.data.vastgepind && !b.data.vastgepind) {
							return -1;
						}

						if (!a.data.vastgepind && b.data.vastgepind) {
							return 1;
						}

						// Then by volgorde (lower = earlier)
						const orderA = a.data.volgorde ?? 999;
						const orderB = b.data.volgorde ?? 999;
						if (orderA !== orderB) {
							return orderA - orderB;
						}

						// Then by date
						return new Date(a.data.datum).getTime() - new Date(b.data.datum).getTime();
					});

					// Apply limit after sorting
					setActivities(sortedEvents.slice(0, limit));
				}
			} catch (error) {
				console.error('Error fetching activities:', error);
				setLoadingMessage('Er is een fout opgetreden bij het laden van activiteiten.');
			} finally {
				setLoading(false);
				setLoadingMessage('');
			}
		}

		void fetchActivities();
	}, [limit, category]);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const day = date.getDate();
		const month = date.toLocaleDateString('nl-BE', {month: 'short'}).toUpperCase();
		return {day, month};
	};

	if (loading) {
		return (
			<section className='py-16 px-6' aria-busy='true' aria-label='Activiteiten worden geladen'>
				<div className='max-w-4xl mx-auto'>
					<div className='text-center'>
						<div className='animate-pulse'>
							<div className='h-8 bg-gray-200 rounded w-64 mx-auto mb-4' />
							<div className='h-4 bg-gray-200 rounded w-48 mx-auto' />
						</div>
					</div>
				</div>
				{/* Screen reader announcement */}
				<div className='sr-only' role='status' aria-live='polite'>
					{loadingMessage}
				</div>
			</section>
		);
	}

	return (
		<section className='py-16 px-6' aria-labelledby={title ? 'activiteiten-title' : undefined}>
			<div className='max-w-4xl mx-auto'>
				<div className='text-center mb-12'>
					{title && (
						<h2 id='activiteiten-title' className='text-3xl md:text-4xl font-bold text-gray-800 mb-4'>
							{title}
						</h2>
					)}
					{subtitle && (
						<p className='text-gray-600'>{subtitle}</p>
					)}
				</div>

				{activities.length > 0
					? (
						<div className='space-y-4' role='list' aria-label='Lijst van activiteiten'>
							{activities.map(activity => {
								const {day, month} = formatDate(activity.data.datum);
								return (
									<a
										key={activity.id}
										href={`/activiteiten/${generateSlug(activity.data.titel)}`}
										className='block'
									>
										<article
											role='listitem'
											className={articleClassName}
										>
											<div className='flex-shrink-0 w-16 h-16 bg-primary rounded-xl flex flex-col items-center justify-center text-white'>
												<span className='text-2xl font-bold leading-none'>{day}</span>
												<span className='text-xs uppercase'>{month}</span>
											</div>
											<div className='flex-grow'>
												<h3 className='font-bold text-gray-800 flex items-center gap-2 group-hover:text-primary transition-colors'>
													{activity.data.titel}
													{activity.data.vastgepind && (
														<svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 text-primary' viewBox='0 0 24 24' fill='currentColor' aria-label='Vastgepind'>
															<path d='M16 4h2a2 2 0 012 2v14l-7-3.5L6 20V6a2 2 0 012-2h2' />
															<path d='M12 2L8 6h8l-4-4z' />
														</svg>
													)}
												</h3>
												{activity.data.tijd && (
													<p className='text-sm text-gray-500 flex items-center gap-1'>
														<svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
															<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
														</svg>
														{activity.data.tijd}
													</p>
												)}
												{showLocation && activity.data.locatie && (
													<p className='text-sm text-gray-500 flex items-center gap-1 mt-1'>
														<svg
															xmlns='http://www.w3.org/2000/svg'
															className='h-4 w-4'
															fill='none'
															viewBox='0 0 24 24'
															stroke='currentColor'
															aria-hidden='true'
														>
															<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={locationIconPath} />
															<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={locationDotPath} />
														</svg>
														{activity.data.locatie}
													</p>
												)}
												{showDescription && activity.data.beschrijving && (
													<p className='text-sm text-gray-600 mt-2 line-clamp-2'>
														{activity.data.beschrijving.length > 150
															? `${activity.data.beschrijving.slice(0, 150)}...`
															: activity.data.beschrijving}
													</p>
												)}
											</div>
											<div className='flex-shrink-0 flex flex-col items-end gap-2'>
												<span className={`px-2 py-1 text-xs font-medium rounded-full ${
													activity.data.categorie === 'feest'
														? 'bg-category-event-bg text-category-event-text'
														: (activity.data.categorie === 'kalender'
															? 'bg-category-calendar-bg text-category-calendar-text'
															: 'bg-category-activity-bg text-category-activity-text')
												}`}>
													{activity.data.categorie}
												</span>
												<span className='text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity'>
													Meer info →
												</span>
											</div>
										</article>
									</a>
								);
							})}
						</div>
					)
					: (
						<div className='text-center py-16 px-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-200'>
							<div className='w-20 h-20 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-sm'>
								<svg xmlns='http://www.w3.org/2000/svg' className='h-10 w-10 text-primary' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
								</svg>
							</div>
							<h3 className='text-xl font-bold text-gray-800 mb-2'>Nog geen activiteiten gepland</h3>
							<p className='text-gray-500 max-w-sm mx-auto mb-6'>
								Binnenkort plannen we nieuwe activiteiten voor de schoolgemeenschap. Houd deze pagina in de gaten!
							</p>
							<AnimatedLink href='/contact' size='sm'>
								Heb je een idee? Laat het ons weten!
							</AnimatedLink>
						</div>
					)}

				{showViewAll && activities.length > 0 && (
					<div className='text-center mt-8'>
						<AnimatedLink href={viewAllLink}>
							Bekijk alle activiteiten
						</AnimatedLink>
					</div>
				)}
			</div>
		</section>
	);
}

export const ActivitiesListInfo = {
	name: 'ActivitiesList',
	component: ActivitiesList,
	inputs: [
		{
			name: 'title',
			type: 'string',
			defaultValue: 'Komende activiteiten',
		},
		{
			name: 'subtitle',
			type: 'string',
			defaultValue: 'Mis geen enkele activiteit van de Talentenraad',
		},
		{
			name: 'limit',
			type: 'number',
			defaultValue: 5,
			helperText: 'Maximum aantal activiteiten om te tonen',
		},
		{
			name: 'category',
			type: 'string',
			enum: ['', 'kalender', 'activiteit', 'nieuws', 'feest'],
			helperText: 'Filter op categorie (leeg voor alle)',
		},
		{
			name: 'showViewAll',
			type: 'boolean',
			defaultValue: true,
		},
		{
			name: 'viewAllLink',
			type: 'string',
			defaultValue: '/kalender',
		},
		{
			name: 'showLocation',
			type: 'boolean',
			defaultValue: true,
			helperText: 'Toon locatie van activiteiten',
		},
		{
			name: 'showDescription',
			type: 'boolean',
			defaultValue: false,
			helperText: 'Toon beschrijving van activiteiten',
		},
	],
};
