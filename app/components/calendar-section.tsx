'use client';

import {useEffect, useRef, useState} from 'react';

// eslint-disable-next-line n/prefer-global/process
const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY!;

type CalendarEvent = {
	date: string;
	title: string;
	time?: string;
};

type Activiteit = {
	id: string;
	data: {
		titel: string;
		datum: string;
		tijd?: string;
	};
};

type CalendarSectionProperties = {
	title?: string;
	subtitle?: string;
	events?: CalendarEvent[];
	showViewAll?: boolean;
	viewAllLink?: string;
	limit?: number;
	fetchFromBuilder?: boolean;
};

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

function CalendarSection({
	title = 'Komende activiteiten',
	subtitle,
	events: staticEvents,
	showViewAll = true,
	viewAllLink = '/kalender',
	limit = 5,
	fetchFromBuilder = true,
}: Readonly<CalendarSectionProperties>) {
	const hasStaticEvents = staticEvents && staticEvents.length > 0;
	const [events, setEvents] = useState<CalendarEvent[]>(hasStaticEvents ? staticEvents : []);
	const [loading, setLoading] = useState(fetchFromBuilder && !hasStaticEvents);
	const hasFetched = useRef(false);

	useEffect(() => {
		// Only fetch from Builder if fetchFromBuilder is true and no static events provided
		if (!fetchFromBuilder || hasStaticEvents) {
			if (hasStaticEvents) {
				setEvents(staticEvents);
			}

			setLoading(false);
			return;
		}

		// Prevent duplicate fetches
		if (hasFetched.current) {
			return;
		}

		hasFetched.current = true;

		async function fetchActiviteiten() {
			try {
				// Get today's date in ISO format for API query
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				const todayIso = today.toISOString().split('T')[0];

				const url = new URL('https://cdn.builder.io/api/v3/content/activiteit');
				url.searchParams.set('apiKey', BUILDER_API_KEY);
				// Fetch more items to ensure we get future events after filtering
				url.searchParams.set('limit', '50');
				url.searchParams.set('sort.data.datum', '1');
				// Query for future events only (datum >= today)
				url.searchParams.set('query.data.datum.$gte', todayIso);

				const response = await fetch(url.toString());
				const data = await response.json() as {results?: Activiteit[]};

				if (data.results) {
					// Map and limit the results
					const futureEvents = data.results
						.slice(0, limit)
						.map((item: Activiteit) => ({
							date: item.data.datum,
							title: item.data.titel,
							time: item.data.tijd,
							slug: generateSlug(item.data.titel),
						}));

					setEvents(futureEvents);
				}
			} catch (error) {
				console.error('Error fetching activiteiten:', error);
			} finally {
				setLoading(false);
			}
		}

		fetchActiviteiten();
	}, [fetchFromBuilder, hasStaticEvents, staticEvents, limit]);

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
					<div className='text-center mb-12'>
						<div className='animate-pulse'>
							<div className='h-8 bg-gray-200 rounded w-64 mx-auto mb-4' />
							<div className='h-4 bg-gray-200 rounded w-48 mx-auto' />
						</div>
					</div>
					<div className='space-y-4'>
						{Array.from({length: 3}).map((_, i) => (
							<div key={i} className='animate-pulse flex items-center gap-6 bg-white p-4 rounded-xl shadow-md'>
								<div className='w-16 h-16 bg-gray-200 rounded-xl' />
								<div className='flex-grow'>
									<div className='h-5 bg-gray-200 rounded w-48 mb-2' />
									<div className='h-4 bg-gray-200 rounded w-24' />
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className='py-16 px-6' aria-labelledby='calendar-section-title'>
			<div className='max-w-4xl mx-auto'>
				<div className='text-center mb-12'>
					{title && (
						<h2 id='calendar-section-title' className='text-3xl md:text-4xl font-bold text-gray-800 mb-4'>
							{title}
						</h2>
					)}
					{subtitle && (
						<p className='text-gray-600'>{subtitle}</p>
					)}
				</div>

				{events.length > 0
					? (
						<div className='space-y-4'>
							{events.map((event, index) => {
								const {day, month} = formatDate(event.date);
								const slug = 'slug' in event ? (event as CalendarEvent & {slug: string}).slug : generateSlug(event.title);
								return (
									<a
										key={index}
										href={`/activiteiten/${slug}`}
										className='flex items-center gap-6 bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow group'
									>
										<div className='flex-shrink-0 w-16 h-16 bg-[#ea247b] rounded-xl flex flex-col items-center justify-center text-white'>
											<span className='text-2xl font-bold leading-none'>{day}</span>
											<span className='text-xs uppercase'>{month}</span>
										</div>
										<div className='flex-grow'>
											<h3 className='font-bold text-gray-800 group-hover:text-[#ea247b] transition-colors'>{event.title}</h3>
											{event.time && (
												<p className='text-sm text-gray-500 flex items-center gap-1'>
													<svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
														<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
													</svg>
													{event.time}
												</p>
											)}
										</div>
										<svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 text-gray-400 group-hover:text-[#ea247b] transition-colors' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
											<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
										</svg>
									</a>
								);
							})}
						</div>
					)
					: (
						<div className='text-center py-12 bg-gray-100 rounded-2xl'>
							<svg xmlns='http://www.w3.org/2000/svg' className='h-12 w-12 mx-auto text-gray-400 mb-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
							</svg>
							<p className='text-gray-500'>Geen activiteiten gepland</p>
						</div>
					)}

				{showViewAll && events.length > 0 && (
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

export const CalendarSectionInfo = {
	name: 'CalendarSection',
	component: CalendarSection,
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
			name: 'fetchFromBuilder',
			type: 'boolean',
			defaultValue: true,
			helperText: 'Automatisch activiteiten ophalen van Builder.io (aanbevolen)',
		},
		{
			name: 'limit',
			type: 'number',
			defaultValue: 5,
			helperText: 'Maximum aantal activiteiten om te tonen',
		},
		{
			name: 'events',
			type: 'list',
			helperText: 'Handmatig events toevoegen (alleen als fetchFromBuilder uit staat)',
			subFields: [
				{
					name: 'date',
					type: 'date',
					required: true,
				},
				{
					name: 'title',
					type: 'string',
					required: true,
				},
				{
					name: 'time',
					type: 'string',
				},
			],
			defaultValue: [],
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
	],
};
