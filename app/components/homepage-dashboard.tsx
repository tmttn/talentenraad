'use client';

import {useEffect, useState} from 'react';

type Activiteit = {
	id: string;
	data: {
		titel: string;
		datum: string;
		tijd?: string;
		locatie?: string;
		categorie: string;
		vastgepind?: boolean;
		volgorde?: number;
	};
};

type NieuwsItem = {
	id: string;
	data: {
		titel: string;
		datum: string;
		samenvatting: string;
		vastgepind?: boolean;
		prioriteit?: number;
	};
};

type HomepageDashboardProperties = {
	title?: string;
	subtitle?: string;
};

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

function HomepageDashboard({
	title = 'Op een oogopslag',
	subtitle = 'Bekijk snel wat er speelt bij de Talentenraad',
}: Readonly<HomepageDashboardProperties>) {
	const [activiteiten, setActiviteiten] = useState<Activiteit[]>([]);
	const [nieuwsItems, setNieuwsItems] = useState<NieuwsItem[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			try {
				// Get today's date for filtering future events
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				const todayString = today.toISOString().split('T')[0];

				// Fetch activities and news in parallel
				const [activiteitenResponse, nieuwsResponse] = await Promise.all([
					fetch(`https://cdn.builder.io/api/v3/content/activiteit?apiKey=${BUILDER_API_KEY}&limit=20&query.data.datum.$gte=${todayString}&sort.data.datum=1&noCache=true`, {cache: 'no-store'}),
					fetch(`https://cdn.builder.io/api/v3/content/nieuws?apiKey=${BUILDER_API_KEY}&limit=10&sort.data.datum=-1&noCache=true`, {cache: 'no-store'}),
				]);

				const [activiteitenData, nieuwsData] = await Promise.all([
					activiteitenResponse.json(),
					nieuwsResponse.json(),
				]);

				// Process activities: sort by pinned first, then by volgorde, then by date
				if (activiteitenData.results) {
					const sortedActiviteiten = [...activiteitenData.results].sort((a: Activiteit, b: Activiteit) => {
						// Pinned items first
						if (a.data.vastgepind && !b.data.vastgepind) return -1;
						if (!a.data.vastgepind && b.data.vastgepind) return 1;

						// Then by volgorde (lower = earlier)
						const orderA = a.data.volgorde ?? 999;
						const orderB = b.data.volgorde ?? 999;
						if (orderA !== orderB) return orderA - orderB;

						// Then by date
						return new Date(a.data.datum).getTime() - new Date(b.data.datum).getTime();
					});
					setActiviteiten(sortedActiviteiten.slice(0, 3));
				}

				// Process news: sort by pinned first, then by priority, then by date
				if (nieuwsData.results) {
					const sortedNieuws = [...nieuwsData.results].sort((a: NieuwsItem, b: NieuwsItem) => {
						// Pinned items first
						if (a.data.vastgepind && !b.data.vastgepind) return -1;
						if (!a.data.vastgepind && b.data.vastgepind) return 1;

						// Then by priority (lower = higher priority)
						const priorityA = a.data.prioriteit ?? 999;
						const priorityB = b.data.prioriteit ?? 999;
						if (priorityA !== priorityB) return priorityA - priorityB;

						// Then by date (newest first)
						return new Date(b.data.datum).getTime() - new Date(a.data.datum).getTime();
					});
					setNieuwsItems(sortedNieuws.slice(0, 3));
				}
			} catch (error) {
				console.error('Error fetching dashboard data:', error);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, []);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const day = date.getDate();
		const month = date.toLocaleDateString('nl-BE', {month: 'short'}).toUpperCase();
		return {day, month};
	};

	const formatFullDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('nl-BE', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});
	};

	if (loading) {
		return (
			<section className='py-12 px-6 bg-gray-50' aria-busy='true' aria-label='Dashboard wordt geladen'>
				<div className='max-w-6xl mx-auto'>
					<div className='animate-pulse'>
						<div className='h-8 bg-gray-200 rounded w-48 mx-auto mb-4' />
						<div className='grid md:grid-cols-2 gap-6 mt-8'>
							<div className='bg-white rounded-2xl p-6 h-64' />
							<div className='bg-white rounded-2xl p-6 h-64' />
						</div>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className='py-12 px-6 bg-gray-50' aria-labelledby='dashboard-title'>
			<div className='max-w-6xl mx-auto'>
				{(title || subtitle) && (
					<div className='text-center mb-10'>
						{title && (
							<h2 id='dashboard-title' className='text-2xl md:text-3xl font-bold text-gray-900 mb-2'>
								{title}
							</h2>
						)}
						{subtitle && (
							<p className='text-gray-600'>{subtitle}</p>
						)}
					</div>
				)}

				<div className='grid md:grid-cols-2 gap-6'>
					{/* Komende Activiteiten */}
					<div className='bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col'>
						<div className='bg-gradient-to-r from-[#ea247b] to-[#d11d6d] px-6 py-3'>
							<h3 className='text-white font-semibold flex items-center gap-2'>
								<svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
								</svg>
								Komende Activiteiten
							</h3>
						</div>
						<div className='p-4 flex-grow'>
							{activiteiten.length > 0 ? (
								<div className='space-y-3'>
									{activiteiten.map(activiteit => (
										<a
											key={activiteit.id}
											href={`/activiteiten/${generateSlug(activiteit.data.titel)}`}
											className='block group'
										>
											<div className='flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors'>
												<div className='flex-shrink-0 w-12 h-12 bg-[#ea247b] rounded-lg flex flex-col items-center justify-center text-white'>
													<span className='text-lg font-bold leading-none'>{formatDate(activiteit.data.datum).day}</span>
													<span className='text-[9px] uppercase'>{formatDate(activiteit.data.datum).month}</span>
												</div>
												<div className='flex-grow min-w-0'>
													<h4 className='font-semibold text-gray-800 group-hover:text-[#ea247b] transition-colors text-sm truncate'>
														{activiteit.data.titel}
														{activiteit.data.vastgepind && (
															<svg xmlns='http://www.w3.org/2000/svg' className='inline-block ml-1 h-3 w-3 text-[#ea247b]' viewBox='0 0 20 20' fill='currentColor' aria-label='Vastgepind'>
																<path d='M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z' />
															</svg>
														)}
													</h4>
													<div className='flex items-center gap-2 text-xs text-gray-500'>
														{activiteit.data.tijd && <span>{activiteit.data.tijd}</span>}
														{activiteit.data.tijd && activiteit.data.locatie && <span>•</span>}
														{activiteit.data.locatie && <span className='truncate'>{activiteit.data.locatie}</span>}
													</div>
												</div>
												<span className={`flex-shrink-0 px-2 py-0.5 text-[10px] font-medium rounded-full ${
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
							) : (
								<div className='text-center py-6'>
									<p className='text-gray-500 text-sm'>Geen activiteiten gepland</p>
								</div>
							)}
						</div>
						<div className='px-6 pb-4 border-t border-gray-100 pt-3 mt-auto'>
							<a
								href='/kalender'
								className='inline-flex items-center gap-1 text-sm text-[#ea247b] font-medium hover:underline'
							>
								Bekijk alle activiteiten
								<svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
								</svg>
							</a>
						</div>
					</div>

					{/* Laatste Nieuws */}
					<div className='bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col'>
						<div className='bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3'>
							<h3 className='text-white font-semibold flex items-center gap-2'>
								<svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' />
								</svg>
								Laatste Nieuws
							</h3>
						</div>
						<div className='p-4 flex-grow'>
							{nieuwsItems.length > 0 ? (
								<div className='space-y-3'>
									{nieuwsItems.map(nieuws => (
										<a
											key={nieuws.id}
											href={`/nieuws/${generateSlug(nieuws.data.titel)}`}
											className='block group'
										>
											<div className='p-2 rounded-lg hover:bg-gray-50 transition-colors'>
												<div className='flex items-start justify-between gap-2'>
													<div className='min-w-0'>
														<h4 className='font-semibold text-gray-800 group-hover:text-blue-600 transition-colors text-sm truncate'>
															{nieuws.data.titel}
															{nieuws.data.vastgepind && (
																<svg xmlns='http://www.w3.org/2000/svg' className='inline-block ml-1 h-3 w-3 text-blue-600' viewBox='0 0 20 20' fill='currentColor' aria-label='Vastgepind'>
																	<path d='M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z' />
																</svg>
															)}
														</h4>
														<p className='text-xs text-gray-500 mt-0.5'>{formatFullDate(nieuws.data.datum)}</p>
													</div>
												</div>
												<p className='text-xs text-gray-600 mt-1 line-clamp-2'>
													{nieuws.data.samenvatting}
												</p>
											</div>
										</a>
									))}
								</div>
							) : (
								<div className='text-center py-6'>
									<p className='text-gray-500 text-sm'>Nog geen nieuws</p>
								</div>
							)}
						</div>
						<div className='px-6 pb-4 border-t border-gray-100 pt-3 mt-auto'>
							<a
								href='/nieuws'
								className='inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:underline'
							>
								Alle nieuwsberichten
								<svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
								</svg>
							</a>
						</div>
					</div>
				</div>

			</div>
		</section>
	);
}

export const HomepageDashboardInfo = {
	name: 'HomepageDashboard',
	component: HomepageDashboard,
	inputs: [
		{
			name: 'title',
			type: 'string',
			defaultValue: 'Op een oogopslag',
			helperText: 'Titel boven het dashboard',
		},
		{
			name: 'subtitle',
			type: 'string',
			defaultValue: 'Bekijk snel wat er speelt bij de Talentenraad',
			helperText: 'Ondertitel',
		},
	],
};
