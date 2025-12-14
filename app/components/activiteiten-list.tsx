'use client';

import {useEffect, useState} from 'react';

type Activiteit = {
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

type ActiviteitenListProperties = {
	title?: string;
	subtitle?: string;
	showViewAll?: boolean;
	viewAllLink?: string;
	limit?: number;
	categorie?: string;
	showLocation?: boolean;
	showDescription?: boolean;
};

// Use environment variable for API key
// eslint-disable-next-line n/prefer-global/process
const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY!;

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

function ActiviteitenList({
	title = 'Komende activiteiten',
	subtitle,
	showViewAll = true,
	viewAllLink = '/kalender',
	limit = 5,
	categorie,
	showLocation = false,
	showDescription = false,
}: Readonly<ActiviteitenListProperties>) {
	const [activiteiten, setActiviteiten] = useState<Activiteit[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadingMessage, setLoadingMessage] = useState('Activiteiten worden geladen...');

	useEffect(() => {
		async function fetchActiviteiten() {
			try {
				const url = new URL('https://cdn.builder.io/api/v3/content/activiteit');
				url.searchParams.set('apiKey', BUILDER_API_KEY);
				url.searchParams.set('limit', String(limit));
				url.searchParams.set('sort.data.datum', '1'); // Sort by date ascending
				url.searchParams.set('cachebust', 'true');

				if (categorie) {
					url.searchParams.set('query.data.categorie.$eq', categorie);
				}

				const response = await fetch(url.toString(), {cache: 'no-store'});
				const data = await response.json();

				if (data.results) {
					// Filter to only show future events
					const now = new Date();
					now.setHours(0, 0, 0, 0);
					const futureEvents = data.results.filter((item: Activiteit) => {
						const eventDate = new Date(item.data.datum);
						return eventDate >= now;
					});

					// Sort: pinned first, then by volgorde, then by date
					const sortedEvents = futureEvents.sort((a: Activiteit, b: Activiteit) => {
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

					setActiviteiten(sortedEvents);
				}
			} catch (error) {
				console.error('Error fetching activiteiten:', error);
				setLoadingMessage('Er is een fout opgetreden bij het laden van activiteiten.');
			} finally {
				setLoading(false);
				setLoadingMessage('');
			}
		}

		fetchActiviteiten();
	}, [limit, categorie]);

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

				{activiteiten.length > 0
					? (
						<div className='space-y-4' role='list' aria-label='Lijst van activiteiten'>
							{activiteiten.map(activiteit => {
								const {day, month} = formatDate(activiteit.data.datum);
								return (
									<a
										key={activiteit.id}
										href={`/activiteiten/${generateSlug(activiteit.data.titel)}`}
										className='block'
									>
										<article
											role='listitem'
											className='flex items-start gap-6 bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-[#ea247b] focus-within:ring-offset-2 group'
										>
											<div className='flex-shrink-0 w-16 h-16 bg-[#ea247b] rounded-xl flex flex-col items-center justify-center text-white'>
												<span className='text-2xl font-bold leading-none'>{day}</span>
												<span className='text-xs uppercase'>{month}</span>
											</div>
											<div className='flex-grow'>
												<h3 className='font-bold text-gray-800 flex items-center gap-2 group-hover:text-[#ea247b] transition-colors'>
													{activiteit.data.titel}
													{activiteit.data.vastgepind && (
														<svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 text-[#ea247b]' viewBox='0 0 24 24' fill='currentColor' aria-label='Vastgepind'>
															<path d='M16 4h2a2 2 0 012 2v14l-7-3.5L6 20V6a2 2 0 012-2h2' />
															<path d='M12 2L8 6h8l-4-4z' />
														</svg>
													)}
												</h3>
												{activiteit.data.tijd && (
													<p className='text-sm text-gray-500 flex items-center gap-1'>
														<svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
															<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
														</svg>
														{activiteit.data.tijd}
													</p>
												)}
												{showLocation && activiteit.data.locatie && (
													<p className='text-sm text-gray-500 flex items-center gap-1 mt-1'>
														<svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
															<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
															<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
														</svg>
														{activiteit.data.locatie}
													</p>
												)}
												{showDescription && activiteit.data.beschrijving && (
													<p className='text-sm text-gray-600 mt-2 line-clamp-2'>
														{activiteit.data.beschrijving.length > 150
															? `${activiteit.data.beschrijving.slice(0, 150)}...`
															: activiteit.data.beschrijving}
													</p>
												)}
											</div>
											<div className='flex-shrink-0 flex flex-col items-end gap-2'>
												<span className={`px-2 py-1 text-xs font-medium rounded-full ${
													activiteit.data.categorie === 'feest'
														? 'bg-pink-100 text-pink-800'
														: (activiteit.data.categorie === 'kalender'
															? 'bg-blue-100 text-blue-800'
															: 'bg-green-100 text-green-800')
												}`}>
													{activiteit.data.categorie}
												</span>
												<span className='text-[#ea247b] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity'>
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
								<svg xmlns='http://www.w3.org/2000/svg' className='h-10 w-10 text-[#ea247b]' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
								</svg>
							</div>
							<h3 className='text-xl font-bold text-gray-800 mb-2'>Nog geen activiteiten gepland</h3>
							<p className='text-gray-500 max-w-sm mx-auto mb-6'>
								Binnenkort plannen we nieuwe activiteiten voor de schoolgemeenschap. Houd deze pagina in de gaten!
							</p>
							<a
								href='/contact'
								className='inline-flex items-center gap-2 text-[#ea247b] font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-[#ea247b] focus:ring-offset-2 rounded'
							>
								Heb je een idee? Laat het ons weten!
								<svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
								</svg>
							</a>
						</div>
					)}

				{showViewAll && activiteiten.length > 0 && (
					<div className='text-center mt-8'>
						<a
							href={viewAllLink}
							className='inline-flex items-center gap-2 text-[#ea247b] font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-[#ea247b] focus:ring-offset-2 rounded'
						>
							Bekijk alle activiteiten
							<svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
							</svg>
						</a>
					</div>
				)}
			</div>
		</section>
	);
}

export const ActiviteitenListInfo = {
	name: 'ActiviteitenList',
	component: ActiviteitenList,
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
			name: 'categorie',
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
			defaultValue: false,
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
