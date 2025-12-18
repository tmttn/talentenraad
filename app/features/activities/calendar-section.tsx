'use client';

import {useEffect, useRef, useState} from 'react';
import {Calendar, Clock, ChevronRight} from 'lucide-react';
import {AnimatedLink} from '@components/ui';
import {Stack} from '@components/ui/layout';

// eslint-disable-next-line n/prefer-global/process
const builderApiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY!;

type CalendarEvent = {
	date: string;
	title: string;
	time?: string;
};

type Activity = {
	id: string;
	data: {
		titel: string;
		datum: string;
		tijd?: string;
	};
};

type CalendarSectionProperties = {
	showViewAll?: boolean;
	viewAllLink?: string;
	limit?: number;
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
	showViewAll = true,
	viewAllLink = '/kalender',
	limit = 5,
}: Readonly<CalendarSectionProperties>) {
	const [events, setEvents] = useState<CalendarEvent[]>([]);
	const [loading, setLoading] = useState(true);
	const hasFetched = useRef(false);

	useEffect(() => {
		if (hasFetched.current) {
			return;
		}

		hasFetched.current = true;

		async function fetchActivities() {
			try {
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				const todayIso = today.toISOString().split('T')[0];

				const url = new URL('https://cdn.builder.io/api/v3/content/activiteit');
				url.searchParams.set('apiKey', builderApiKey);
				url.searchParams.set('limit', '50');
				url.searchParams.set('sort.data.datum', '1');
				url.searchParams.set('query.data.datum.$gte', todayIso);
				url.searchParams.set('cachebust', 'true');

				const response = await fetch(url.toString(), {cache: 'no-store'});
				const data = await response.json() as {results?: Activity[]};

				if (data.results) {
					const futureEvents = data.results
						.slice(0, limit)
						.map((item: Activity) => ({
							date: item.data.datum,
							title: item.data.titel,
							time: item.data.tijd,
							slug: generateSlug(item.data.titel),
						}));

					setEvents(futureEvents);
				}
			} catch (error) {
				console.error('Error fetching activities:', error);
			} finally {
				setLoading(false);
			}
		}

		void fetchActivities();
	}, [limit]);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const day = date.getDate();
		const month = date.toLocaleDateString('nl-BE', {month: 'short'}).toUpperCase();
		return {day, month};
	};

	if (loading) {
		return (
			<Stack gap='sm' className='animate-pulse'>
				{Array.from({length: 3}).map((_, i) => (
					<div key={i} className='flex items-center gap-6 bg-white p-4 rounded-card shadow-base'>
						<div className='w-16 h-16 bg-gray-200 rounded-card' />
						<div className='flex-grow'>
							<div className='h-5 bg-gray-200 rounded w-48 mb-2' />
							<div className='h-4 bg-gray-200 rounded w-24' />
						</div>
					</div>
				))}
			</Stack>
		);
	}

	if (events.length === 0) {
		return (
			<div className='text-center py-12 bg-gray-100 rounded-modal'>
				<Calendar className='h-12 w-12 mx-auto text-gray-400 mb-4' aria-hidden='true' />
				<p className='text-gray-500'>Geen activiteiten gepland</p>
			</div>
		);
	}

	return (
		<div>
			<Stack gap='sm'>
				{events.map((event, index) => {
					const {day, month} = formatDate(event.date);
					const slug = 'slug' in event ? (event as CalendarEvent & {slug: string}).slug : generateSlug(event.title);
					return (
						<a
							key={index}
							href={`/activiteiten/${slug}`}
							className='flex items-center gap-6 bg-white p-4 rounded-card shadow-base hover:shadow-elevated transition-shadow group'
						>
							<div className='flex-shrink-0 w-16 h-16 bg-primary rounded-card flex flex-col items-center justify-center text-white'>
								<span className='text-2xl font-bold leading-none'>{day}</span>
								<span className='text-xs uppercase'>{month}</span>
							</div>
							<div className='flex-grow'>
								<h3 className='font-bold text-gray-800 group-hover:text-primary transition-colors'>{event.title}</h3>
								{event.time && (
									<p className='text-sm text-gray-500 flex items-center gap-1'>
										<Clock className='h-4 w-4' aria-hidden='true' />
										{event.time}
									</p>
								)}
							</div>
							<ChevronRight className='h-6 w-6 text-gray-400 group-hover:text-primary transition-colors' aria-hidden='true' />
						</a>
					);
				})}
			</Stack>

			{showViewAll && (
				<div className='text-center mt-8'>
					<AnimatedLink href={viewAllLink}>
						Bekijk alle activiteiten
					</AnimatedLink>
				</div>
			)}
		</div>
	);
}

export const CalendarSectionInfo = {
	name: 'CalendarSection',
	component: CalendarSection,
	inputs: [
		{
			name: 'limit',
			type: 'number',
			defaultValue: 5,
			helperText: 'Maximum aantal activiteiten om te tonen',
		},
		{
			name: 'showViewAll',
			type: 'boolean',
			defaultValue: true,
			helperText: 'Toon "Bekijk alle activiteiten" link',
		},
		{
			name: 'viewAllLink',
			type: 'string',
			defaultValue: '/kalender',
			helperText: 'Link naar alle activiteiten',
		},
	],
};
