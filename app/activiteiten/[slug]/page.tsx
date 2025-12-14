import {notFound} from 'next/navigation';
import Link from 'next/link';

// eslint-disable-next-line n/prefer-global/process
const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY!;

type Activiteit = {
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

// Dynamic rendering to avoid SSG issues with Builder.io components
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getActiviteit(slug: string): Promise<Activiteit | null> {
	try {
		// First try to find in the list
		const url = new URL('https://cdn.builder.io/api/v3/content/activiteit');
		url.searchParams.set('apiKey', BUILDER_API_KEY);
		url.searchParams.set('limit', '100');

		const response = await fetch(url.toString(), {cache: 'no-store'});
		const data = await response.json();

		if (data.results) {
			// Find item by ID or by slug generated from title
			const item = data.results.find((item: Activiteit) => {
				const itemSlug = generateSlug(item.data.titel);
				return item.id === slug || itemSlug === slug;
			});

			if (item) return item;
		}

		// Fallback: try direct query by matching slug in all items
		// This handles cases where CDN cache hasn't updated yet
		const allUrl = new URL('https://cdn.builder.io/api/v3/content/activiteit');
		allUrl.searchParams.set('apiKey', BUILDER_API_KEY);
		allUrl.searchParams.set('limit', '100');
		allUrl.searchParams.set('includeUnpublished', 'false');
		allUrl.searchParams.set('cacheSeconds', '0');

		const allResponse = await fetch(allUrl.toString(), {cache: 'no-store'});
		const allData = await allResponse.json();

		if (allData.results) {
			const item = allData.results.find((item: Activiteit) => {
				const itemSlug = generateSlug(item.data.titel);
				return item.id === slug || itemSlug === slug;
			});
			if (item) return item;
		}

		return null;
	} catch (error) {
		console.error('Error fetching activiteit:', error);
		return null;
	}
}

function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // Remove diacritics
		.replace(/[^a-z0-9\s-]/g, '') // Remove special chars
		.replace(/\s+/g, '-') // Replace spaces with -
		.replace(/-+/g, '-') // Replace multiple - with single -
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
	feest: {bg: 'bg-pink-100', text: 'text-pink-800'},
	kalender: {bg: 'bg-blue-100', text: 'text-blue-800'},
	activiteit: {bg: 'bg-green-100', text: 'text-green-800'},
	nieuws: {bg: 'bg-purple-100', text: 'text-purple-800'},
};

export async function generateMetadata({params}: {params: Promise<{slug: string}>}) {
	const {slug} = await params;
	const item = await getActiviteit(slug);

	if (!item) {
		return {title: 'Activiteit niet gevonden'};
	}

	return {
		title: `${item.data.titel} - Talentenraad`,
		description: item.data.beschrijving || `Activiteit op ${formatDate(item.data.datum)}`,
	};
}

type PageProperties = {
	params: Promise<{slug: string}>;
};

export default async function ActiviteitDetailPage({params}: Readonly<PageProperties>) {
	const {slug} = await params;
	const item = await getActiviteit(slug);

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
		<article className="py-12 px-6">
			<div className="max-w-3xl mx-auto">
				{/* Breadcrumb */}
				<nav className="mb-8" aria-label="Breadcrumb">
					<ol className="flex items-center gap-2 text-sm text-gray-500">
						<li>
							<Link href="/" className="hover:text-[#ea247b]">Home</Link>
						</li>
						<li>/</li>
						<li>
							<Link href="/kalender" className="hover:text-[#ea247b]">Kalender</Link>
						</li>
						<li>/</li>
						<li className="text-gray-800 font-medium truncate max-w-[200px]">
							{item.data.titel}
						</li>
					</ol>
				</nav>

				{/* Header with date badge */}
				<header className="mb-8">
					<div className="flex items-start gap-6">
						<div className="flex-shrink-0 w-20 h-20 bg-[#ea247b] rounded-2xl flex flex-col items-center justify-center text-white shadow-lg">
							<span className="text-3xl font-bold leading-none">{day}</span>
							<span className="text-sm uppercase">{month}</span>
						</div>
						<div className="flex-grow">
							<div className="flex items-center gap-3 mb-2">
								<span className={`px-3 py-1 text-sm font-medium rounded-full ${style.bg} ${style.text}`}>
									{item.data.categorie}
								</span>
								{isPast && (
									<span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-600">
										Afgelopen
									</span>
								)}
							</div>
							<h1 className="text-3xl md:text-4xl font-bold text-gray-800">
								{item.data.titel}
							</h1>
						</div>
					</div>
				</header>

				{/* Event details card */}
				<div className="bg-gray-50 rounded-2xl p-6 mb-8">
					<h2 className="text-lg font-bold text-gray-800 mb-4">Details</h2>
					<dl className="space-y-4">
						<div className="flex items-start gap-3">
							<dt className="sr-only">Datum</dt>
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#ea247b] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
							<dd className="text-gray-700">{formatDate(item.data.datum)}</dd>
						</div>

						{item.data.tijd && (
							<div className="flex items-start gap-3">
								<dt className="sr-only">Tijd</dt>
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#ea247b] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<dd className="text-gray-700">{item.data.tijd}</dd>
							</div>
						)}

						{item.data.locatie && (
							<div className="flex items-start gap-3">
								<dt className="sr-only">Locatie</dt>
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#ea247b] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
								<dd className="text-gray-700">{item.data.locatie}</dd>
							</div>
						)}
					</dl>
				</div>

				{/* Image */}
				{item.data.afbeelding && (
					<div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
						<img
							src={item.data.afbeelding}
							alt={item.data.titel}
							className="w-full h-auto"
						/>
					</div>
				)}

				{/* Description */}
				{item.data.beschrijving && (
					<div className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-600">
						<h2>Over deze activiteit</h2>
						<p className="whitespace-pre-line">{item.data.beschrijving}</p>
					</div>
				)}

				{/* CTA for future events */}
				{!isPast && (
					<div className="mt-8 p-6 bg-gradient-to-r from-[#ea247b]/10 to-pink-50 rounded-2xl">
						<h3 className="font-bold text-gray-800 mb-2">Vragen over deze activiteit?</h3>
						<p className="text-gray-600 mb-4">
							Neem contact op met de Talentenraad voor meer informatie.
						</p>
						<Link
							href="/contact"
							className="inline-flex items-center gap-2 bg-[#ea247b] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#d11d6d] transition-colors"
						>
							Contact opnemen
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
							</svg>
						</Link>
					</div>
				)}

				{/* Back link */}
				<div className="mt-12 pt-8 border-t border-gray-200">
					<Link
						href="/kalender"
						className="inline-flex items-center gap-2 text-[#ea247b] font-semibold hover:underline"
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
						</svg>
						Terug naar kalender
					</Link>
				</div>
			</div>
		</article>
	);
}
