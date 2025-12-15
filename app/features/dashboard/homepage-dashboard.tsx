'use client';

import {useEffect, useState} from 'react';
import {AnimatedLink} from '@components/ui';
import {CalendarIcon, NewsIcon} from '@components/ui/icons';

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

function HomepageDashboard({
	title = '',
	subtitle = '',
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
					fetch(`https://cdn.builder.io/api/v3/content/activiteit?apiKey=${builderApiKey}&limit=20&query.data.datum.$gte=${todayString}&sort.data.datum=1&noCache=true`, {cache: 'no-store'}),
					fetch(`https://cdn.builder.io/api/v3/content/nieuws?apiKey=${builderApiKey}&limit=10&sort.data.datum=-1&noCache=true`, {cache: 'no-store'}),
				]);

				const [activiteitenData, nieuwsData] = await Promise.all([
					activiteitenResponse.json() as Promise<{results?: Activiteit[]}>,
					nieuwsResponse.json() as Promise<{results?: NieuwsItem[]}>,
				]);

				// Process activities: sort by pinned first, then by volgorde, then by date
				if (activiteitenData.results) {
					const sortedActiviteiten = [...activiteitenData.results].sort((a: Activiteit, b: Activiteit) => {
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
					setActiviteiten(sortedActiviteiten.slice(0, 3));
				}

				// Process news: sort by pinned first, then by priority, then by date
				if (nieuwsData.results) {
					const sortedNieuws = [...nieuwsData.results].sort((a: NieuwsItem, b: NieuwsItem) => {
						// Pinned items first
						if (a.data.vastgepind && !b.data.vastgepind) {
							return -1;
						}

						if (!a.data.vastgepind && b.data.vastgepind) {
							return 1;
						}

						// Then by priority (lower = higher priority)
						const priorityA = a.data.prioriteit ?? 999;
						const priorityB = b.data.prioriteit ?? 999;
						if (priorityA !== priorityB) {
							return priorityA - priorityB;
						}

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

		void fetchData();
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
						<div className='bg-gradient-to-r from-brand-primary-500 to-brand-primary-600 px-6 py-3'>
							<h3 className='text-white font-semibold flex items-center gap-2'>
								<CalendarIcon className='h-5 w-5' />
								Komende Activiteiten
							</h3>
						</div>
						<div className='p-4 flex-grow'>
							{activiteiten.length > 0
								? (
									<div className='space-y-3'>
										{activiteiten.map(activiteit => (
											<a
												key={activiteit.id}
												href={`/activiteiten/${generateSlug(activiteit.data.titel)}`}
												className='block group'
											>
												<div className='flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors'>
													<div className='flex-shrink-0 w-12 h-12 bg-primary rounded-lg flex flex-col items-center justify-center text-white'>
														<span className='text-lg font-bold leading-none'>{formatDate(activiteit.data.datum).day}</span>
														<span className='text-[9px] uppercase'>{formatDate(activiteit.data.datum).month}</span>
													</div>
													<div className='flex-grow min-w-0'>
														<h4 className='font-semibold text-gray-800 group-hover:text-primary transition-colors text-sm truncate'>
															{activiteit.data.titel}
															{activiteit.data.vastgepind && (
																<svg xmlns='http://www.w3.org/2000/svg' className='inline-block ml-1 h-3 w-3 text-primary' viewBox='0 0 20 20' fill='currentColor' aria-label='Vastgepind'>
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
															? 'bg-category-event-bg text-category-event-text'
															: (activiteit.data.categorie === 'kalender'
																? 'bg-category-calendar-bg text-category-calendar-text'
																: 'bg-category-activity-bg text-category-activity-text')
													}`}>
														{activiteit.data.categorie}
													</span>
												</div>
											</a>
										))}
									</div>
								)
								: (
									<div className='text-center py-6'>
										<p className='text-gray-500 text-sm'>Geen activiteiten gepland</p>
									</div>
								)}
						</div>
						<div className='px-6 pb-4 border-t border-gray-100 pt-3 mt-auto'>
							<AnimatedLink href='/kalender' size='sm'>
								Bekijk alle activiteiten
							</AnimatedLink>
						</div>
					</div>

					{/* Laatste Nieuws */}
					<div className='bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col'>
						<div className='bg-gradient-to-r from-brand-secondary-400 to-brand-secondary-500 px-6 py-3'>
							<h3 className='text-white font-semibold flex items-center gap-2'>
								<NewsIcon className='h-5 w-5' />
								Laatste Nieuws
							</h3>
						</div>
						<div className='p-4 flex-grow'>
							{nieuwsItems.length > 0
								? (
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
															<h4 className='font-semibold text-gray-800 group-hover:text-secondary transition-colors text-sm truncate'>
																{nieuws.data.titel}
																{nieuws.data.vastgepind && (
																	<svg xmlns='http://www.w3.org/2000/svg' className='inline-block ml-1 h-3 w-3 text-secondary' viewBox='0 0 20 20' fill='currentColor' aria-label='Vastgepind'>
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
								)
								: (
									<div className='text-center py-6'>
										<p className='text-gray-500 text-sm'>Nog geen nieuws</p>
									</div>
								)}
						</div>
						<div className='px-6 pb-4 border-t border-gray-100 pt-3 mt-auto'>
							<AnimatedLink href='/nieuws' size='sm' variant='secondary'>
								Alle nieuwsberichten
							</AnimatedLink>
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
			defaultValue: '',
			helperText: 'Optioneel: titel boven het dashboard (gebruik liever Typography component)',
		},
		{
			name: 'subtitle',
			type: 'string',
			defaultValue: '',
			helperText: 'Optioneel: ondertitel (gebruik liever Typography component)',
		},
	],
};
