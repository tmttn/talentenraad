import {notFound} from 'next/navigation';
import Link from 'next/link';
import {Calendar, Clock, MapPin} from 'lucide-react';
import {AnimatedButton, AnimatedLink} from '@components/ui';
import {PageWithAnnouncements} from '@components/layout/page-with-announcements';

// eslint-disable-next-line n/prefer-global/process
const builderApiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY!;

type Activity = {
	id: string;
	data: {
		titel: string;
		datum: string;
		tijd?: string;
		locatie?: string;
		beschrijving?: string;
		categorie: string;
		afbeelding?: string;
	};
};

type BuilderResponse = {
	results?: Activity[];
};

// Dynamic rendering to avoid SSG issues with Builder.io components
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getActivity(slug: string): Promise<Activity | undefined> {
	try {
		// First try to find in the list
		const url = new URL('https://cdn.builder.io/api/v3/content/activiteit');
		url.searchParams.set('apiKey', builderApiKey);
		url.searchParams.set('limit', '100');

		const response = await fetch(url.toString(), {cache: 'no-store'});
		const data = await response.json() as BuilderResponse;

		if (data.results) {
			// Find item by ID or by slug generated from title
			const item = data.results.find(activity => {
				const itemSlug = generateSlug(activity.data.titel);
				return activity.id === slug || itemSlug === slug;
			});

			if (item) {
				return item;
			}
		}

		// Fallback: try direct query by matching slug in all items
		// This handles cases where CDN cache hasn't updated yet
		const allUrl = new URL('https://cdn.builder.io/api/v3/content/activiteit');
		allUrl.searchParams.set('apiKey', builderApiKey);
		allUrl.searchParams.set('limit', '100');
		allUrl.searchParams.set('includeUnpublished', 'false');
		allUrl.searchParams.set('cacheSeconds', '0');

		const allResponse = await fetch(allUrl.toString(), {cache: 'no-store'});
		const allData = await allResponse.json() as BuilderResponse;

		if (allData.results) {
			const item = allData.results.find(activity => {
				const itemSlug = generateSlug(activity.data.titel);
				return activity.id === slug || itemSlug === slug;
			});
			if (item) {
				return item;
			}
		}

		return undefined;
	} catch (error) {
		console.error('Error fetching activity:', error);
		return undefined;
	}
}

function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.normalize('NFD')
		.replaceAll(/[\u0300-\u036F]/g, '') // Remove diacritics
		.replaceAll(/[^a-z\d\s-]/g, '') // Remove special chars
		.replaceAll(/\s+/g, '-') // Replace spaces with -
		.replaceAll(/-+/g, '-') // Replace multiple - with single -
		.trim();
}

function formatDate(dateString: string) {
	const date = new Date(dateString);
	return date.toLocaleDateString('nl-BE', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
}

function formatShortDate(dateString: string) {
	const date = new Date(dateString);
	const day = date.getDate();
	const month = date.toLocaleDateString('nl-BE', {month: 'short'}).toUpperCase();
	return {day, month};
}

const categoryStyles: Record<string, {bg: string; text: string}> = {
	feest: {bg: 'bg-category-event-bg', text: 'text-category-event-text'},
	kalender: {bg: 'bg-category-calendar-bg', text: 'text-category-calendar-text'},
	activiteit: {bg: 'bg-category-activity-bg', text: 'text-category-activity-text'},
	nieuws: {bg: 'bg-category-news-bg', text: 'text-category-news-text'},
};

export async function generateMetadata({params}: {params: Promise<{slug: string}>}) {
	const {slug} = await params;
	const item = await getActivity(slug);

	if (!item) {
		return {title: 'Activiteit niet gevonden'};
	}

	return {
		title: `${item.data.titel} - Talentenraad`,
		description: item.data.beschrijving ?? `Activiteit op ${formatDate(item.data.datum)}`,
	};
}

type PageProperties = {
	params: Promise<{slug: string}>;
};

export default async function ActivityDetailPage({params}: Readonly<PageProperties>) {
	const {slug} = await params;
	const item = await getActivity(slug);

	if (!item) {
		notFound();
	}

	const {day, month} = formatShortDate(item.data.datum);
	const style = categoryStyles[item.data.categorie] || categoryStyles.activiteit;

	// Check if event is in the past
	const eventDate = new Date(item.data.datum);
	const now = new Date();
	now.setHours(0, 0, 0, 0);
	const isPast = eventDate < now;

	return (
		<PageWithAnnouncements content={undefined}>
			<article className='py-12 px-6'>
				<div className='max-w-3xl mx-auto'>
					{/* Breadcrumb */}
					<nav className='mb-8' aria-label='Breadcrumb'>
						<ol className='flex items-center gap-2 text-sm text-gray-500'>
							<li>
								<Link href='/' className='hover:text-primary'>Home</Link>
							</li>
							<li>/</li>
							<li>
								<Link href='/kalender' className='hover:text-primary'>Kalender</Link>
							</li>
							<li>/</li>
							<li className='text-gray-800 font-medium truncate max-w-[200px]'>
								{item.data.titel}
							</li>
						</ol>
					</nav>

					{/* Header with date badge */}
					<header className='mb-8'>
						<div className='flex items-start gap-6'>
							<div className='flex-shrink-0 w-20 h-20 bg-primary rounded-2xl flex flex-col items-center justify-center text-white shadow-lg'>
								<span className='text-3xl font-bold leading-none'>{day}</span>
								<span className='text-sm uppercase'>{month}</span>
							</div>
							<div className='flex-grow'>
								<div className='flex items-center gap-3 mb-2'>
									<span className={`px-3 py-1 text-sm font-medium rounded-full ${style.bg} ${style.text}`}>
										{item.data.categorie}
									</span>
									{isPast && (
										<span className='px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-600'>
											Afgelopen
										</span>
									)}
								</div>
								<h1 className='text-3xl md:text-4xl font-bold text-gray-800'>
									{item.data.titel}
								</h1>
							</div>
						</div>
					</header>

					{/* Event details card */}
					<div className='bg-gray-50 rounded-2xl p-6 mb-8'>
						<h2 className='text-lg font-bold text-gray-800 mb-4'>Details</h2>
						<dl className='space-y-4'>
							<div className='flex items-start gap-3'>
								<dt className='sr-only'>Datum</dt>
								<Calendar className='h-5 w-5 text-primary mt-0.5' />
								<dd className='text-gray-700'>{formatDate(item.data.datum)}</dd>
							</div>

							{item.data.tijd && (
								<div className='flex items-start gap-3'>
									<dt className='sr-only'>Tijd</dt>
									<Clock className='h-5 w-5 text-primary mt-0.5' />
									<dd className='text-gray-700'>{item.data.tijd}</dd>
								</div>
							)}

							{item.data.locatie && (
								<div className='flex items-start gap-3'>
									<dt className='sr-only'>Locatie</dt>
									<MapPin className='h-5 w-5 text-primary mt-0.5' />
									<dd className='text-gray-700'>{item.data.locatie}</dd>
								</div>
							)}
						</dl>
					</div>

					{/* Image */}
					{item.data.afbeelding && (
						<div className='mb-8 rounded-2xl overflow-hidden shadow-lg'>
							<img
								src={item.data.afbeelding}
								alt={item.data.titel}
								className='w-full h-auto'
							/>
						</div>
					)}

					{/* Description */}
					{item.data.beschrijving && (
						<div className='prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-600'>
							<h2>Over deze activiteit</h2>
							<p className='whitespace-pre-line'>{item.data.beschrijving}</p>
						</div>
					)}

					{/* CTA for future events */}
					{!isPast && (
						<div className='mt-8 p-6 bg-gradient-to-r from-primary/10 to-brand-primary-50 rounded-2xl'>
							<h3 className='font-bold text-gray-800 mb-2'>Vragen over deze activiteit?</h3>
							<p className='text-gray-600 mb-4'>
								Neem contact op met de Talentenraad voor meer informatie.
							</p>
							<AnimatedButton href='/contact?onderwerp=activiteit'>
								Contact opnemen
							</AnimatedButton>
						</div>
					)}

					{/* Back link */}
					<div className='mt-12 pt-8 border-t border-gray-200'>
						<AnimatedLink href='/kalender' arrowDirection='left'>
							Terug naar kalender
						</AnimatedLink>
					</div>
				</div>
			</article>
		</PageWithAnnouncements>
	);
}
