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
	};
};

type ActiviteitenArchiefProperties = {
	title?: string;
	subtitle?: string;
	limit?: number;
	showYear?: boolean;
};

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

function ActiviteitenArchief({
	title = 'Archief',
	subtitle = 'Bekijk onze voorbije activiteiten',
	limit = 20,
	showYear = true,
}: Readonly<ActiviteitenArchiefProperties>) {
	const [activiteiten, setActiviteiten] = useState<Activiteit[]>([]);
	const [loading, setLoading] = useState(true);
	const [isExpanded, setIsExpanded] = useState(false);

	useEffect(() => {
		async function fetchActiviteiten() {
			try {
				const url = new URL('https://cdn.builder.io/api/v3/content/activiteit');
				url.searchParams.set('apiKey', builderApiKey);
				url.searchParams.set('limit', '100');
				url.searchParams.set('sort.data.datum', '-1'); // Sort by date descending (newest first)
				url.searchParams.set('cachebust', 'true');

				const response = await fetch(url.toString(), {cache: 'no-store'});
				const data = await response.json() as {results?: Activiteit[]};

				if (data.results) {
					// Filter to only show past events
					const now = new Date();
					now.setHours(0, 0, 0, 0);
					const pastEvents = data.results
						.filter((item: Activiteit) => {
							const eventDate = new Date(item.data.datum);
							return eventDate < now;
						})
						.slice(0, limit);

					setActiviteiten(pastEvents);
				}
			} catch (error) {
				console.error('Error fetching archief:', error);
			} finally {
				setLoading(false);
			}
		}

		void fetchActiviteiten();
	}, [limit]);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('nl-BE', {
			day: 'numeric',
			month: 'long',
			year: showYear ? 'numeric' : undefined,
		});
	};

	const groupByYear = (items: Activiteit[]) => {
		const groups: Record<string, Activiteit[]> = {};
		for (const item of items) {
			const year = new Date(item.data.datum).getFullYear().toString();
			groups[year] ||= [];

			groups[year].push(item);
		}

		return groups;
	};

	if (loading) {
		return (
			<section className='py-12 px-6 bg-gray-50' aria-busy='true'>
				<div className='max-w-4xl mx-auto'>
					<div className='animate-pulse'>
						<div className='h-6 bg-gray-200 rounded w-32 mb-4' />
						<div className='space-y-2'>
							<div className='h-4 bg-gray-200 rounded w-full' />
							<div className='h-4 bg-gray-200 rounded w-3/4' />
						</div>
					</div>
				</div>
			</section>
		);
	}

	if (activiteiten.length === 0) {
		return null;
	}

	const groupedActiviteiten = groupByYear(activiteiten);
	const years = Object.keys(groupedActiviteiten).sort((a, b) => Number(b) - Number(a));

	return (
		<section className='py-12 px-6 bg-gray-50' aria-labelledby='archief-title'>
			<div className='max-w-4xl mx-auto'>
				<button
					type='button'
					onClick={() => {
						setIsExpanded(!isExpanded);
					}}
					className='w-full flex items-center justify-between text-left mb-6 group'
					aria-expanded={isExpanded}
					aria-controls='archief-content'
				>
					<div>
						<h2 id='archief-title' className='text-2xl font-bold text-gray-800 flex items-center gap-3'>
							<svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' />
							</svg>
							{title}
							<span className='text-sm font-normal text-gray-500'>
								({activiteiten.length} activiteiten)
							</span>
						</h2>
						{subtitle && (
							<p className='text-gray-600 mt-1'>{subtitle}</p>
						)}
					</div>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						className={`h-6 w-6 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'
						aria-hidden='true'
					>
						<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
					</svg>
				</button>

				<div
					id='archief-content'
					className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
				>
					{years.map(year => (
						<div key={year} className='mb-8'>
							<h3 className='text-lg font-bold text-gray-700 mb-4 flex items-center gap-2'>
								<span className='w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm'>
									{groupedActiviteiten[year].length}
								</span>
								{year}
							</h3>
							<div className='space-y-3 pl-4 border-l-2 border-gray-200'>
								{groupedActiviteiten[year].map(activiteit => (
									<a
										key={activiteit.id}
										href={`/activiteiten/${generateSlug(activiteit.data.titel)}`}
										className='block bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow group'
									>
										<div className='flex items-center justify-between'>
											<div>
												<h4 className='font-semibold text-gray-800 group-hover:text-primary transition-colors'>
													{activiteit.data.titel}
												</h4>
												<p className='text-sm text-gray-500'>
													{formatDate(activiteit.data.datum)}
													{activiteit.data.locatie && ` • ${activiteit.data.locatie}`}
												</p>
											</div>
											<span className={`px-2 py-1 text-xs font-medium rounded-full ${
												activiteit.data.categorie === 'feest'
													? 'bg-pink-100 text-pink-800'
													: (activiteit.data.categorie === 'kalender'
														? 'bg-blue-100 text-blue-800'
														: 'bg-green-100 text-green-800')
											}`}>
												{activiteit.data.categorie}
											</span>
										</div>
									</a>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

export const ActiviteitenArchiefInfo = {
	name: 'ActiviteitenArchief',
	component: ActiviteitenArchief,
	inputs: [
		{
			name: 'title',
			type: 'string',
			defaultValue: 'Archief',
			helperText: 'Titel van de archief sectie',
		},
		{
			name: 'subtitle',
			type: 'string',
			defaultValue: 'Bekijk onze voorbije activiteiten',
			helperText: 'Ondertitel van de archief sectie',
		},
		{
			name: 'limit',
			type: 'number',
			defaultValue: 20,
			helperText: 'Maximum aantal voorbije activiteiten om te tonen',
		},
		{
			name: 'showYear',
			type: 'boolean',
			defaultValue: true,
			helperText: 'Toon het jaar bij de datum',
		},
	],
};
