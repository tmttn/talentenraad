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
	};
};

type NieuwsItem = {
	id: string;
	data: {
		titel: string;
		datum: string;
		samenvatting: string;
	};
};

type FAQItem = {
	id: string;
	data: {
		vraag: string;
		antwoord: string;
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
	const [activiteit, setActiviteit] = useState<Activiteit | undefined>(undefined);
	const [nieuws, setNieuws] = useState<NieuwsItem | undefined>(undefined);
	const [faq, setFaq] = useState<FAQItem | undefined>(undefined);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			try {
				// Fetch all data in parallel
				const [activiteitenResponse, nieuwsResponse, faqResponse] = await Promise.all([
					fetch(`https://cdn.builder.io/api/v3/content/activiteit?apiKey=${BUILDER_API_KEY}&limit=10&sort.data.datum=1&cachebust=true`, {cache: 'no-store'}),
					fetch(`https://cdn.builder.io/api/v3/content/nieuws?apiKey=${BUILDER_API_KEY}&limit=1&sort.data.datum=-1&cachebust=true`, {cache: 'no-store'}),
					fetch(`https://cdn.builder.io/api/v3/content/faq?apiKey=${BUILDER_API_KEY}&limit=1&sort.data.volgorde=1&cachebust=true`, {cache: 'no-store'}),
				]);

				const [activiteitenData, nieuwsData, faqData] = await Promise.all([
					activiteitenResponse.json(),
					nieuwsResponse.json(),
					faqResponse.ok ? faqResponse.json() : {results: []},
				]);

				// Get next upcoming activity
				if (activiteitenData.results) {
					const now = new Date();
					now.setHours(0, 0, 0, 0);
					const futureEvents = activiteitenData.results.filter((item: Activiteit) => {
						const eventDate = new Date(item.data.datum);
						return eventDate >= now;
					});
					if (futureEvents.length > 0) {
						setActiviteit(futureEvents[0]);
					}
				}

				// Get latest news
				if (nieuwsData.results?.[0]) {
					setNieuws(nieuwsData.results[0]);
				}

				// Get first FAQ
				if (faqData.results?.[0]) {
					setFaq(faqData.results[0]);
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
						<div className='grid md:grid-cols-3 gap-6 mt-8'>
							{[1, 2, 3].map(i => (
								<div key={i} className='bg-white rounded-2xl p-6 h-48' />
							))}
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

				<div className='grid md:grid-cols-3 gap-6'>
					{/* Volgende Activiteit */}
					<div className='bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden'>
						<div className='bg-gradient-to-r from-[#ea247b] to-[#d11d6d] px-6 py-3'>
							<h3 className='text-white font-semibold flex items-center gap-2'>
								<svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
								</svg>
								Volgende Activiteit
							</h3>
						</div>
						<div className='p-6'>
							{activiteit ? (
								<a
									href={`/activiteiten/${generateSlug(activiteit.data.titel)}`}
									className='block group'
								>
									<div className='flex items-start gap-4'>
										<div className='flex-shrink-0 w-14 h-14 bg-[#ea247b] rounded-xl flex flex-col items-center justify-center text-white'>
											<span className='text-xl font-bold leading-none'>{formatDate(activiteit.data.datum).day}</span>
											<span className='text-[10px] uppercase'>{formatDate(activiteit.data.datum).month}</span>
										</div>
										<div className='flex-grow min-w-0'>
											<h4 className='font-bold text-gray-800 group-hover:text-[#ea247b] transition-colors truncate'>
												{activiteit.data.titel}
											</h4>
											{activiteit.data.tijd && (
												<p className='text-sm text-gray-500 flex items-center gap-1 mt-1'>
													<svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
														<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
													</svg>
													{activiteit.data.tijd}
												</p>
											)}
											{activiteit.data.locatie && (
												<p className='text-sm text-gray-500 flex items-center gap-1 mt-1'>
													<svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
														<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
														<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
													</svg>
													<span className='truncate'>{activiteit.data.locatie}</span>
												</p>
											)}
											<span className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full ${
												activiteit.data.categorie === 'feest'
													? 'bg-pink-100 text-pink-800'
													: (activiteit.data.categorie === 'kalender'
														? 'bg-blue-100 text-blue-800'
														: 'bg-green-100 text-green-800')
											}`}>
												{activiteit.data.categorie}
											</span>
										</div>
									</div>
								</a>
							) : (
								<div className='text-center py-4'>
									<p className='text-gray-500 text-sm'>Geen activiteiten gepland</p>
								</div>
							)}
						</div>
						<div className='px-6 pb-4'>
							<a
								href='/kalender'
								className='inline-flex items-center gap-1 text-sm text-[#ea247b] font-medium hover:underline'
							>
								Bekijk kalender
								<svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
								</svg>
							</a>
						</div>
					</div>

					{/* Laatste Nieuws */}
					<div className='bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden'>
						<div className='bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3'>
							<h3 className='text-white font-semibold flex items-center gap-2'>
								<svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' />
								</svg>
								Laatste Nieuws
							</h3>
						</div>
						<div className='p-6'>
							{nieuws ? (
								<a
									href={`/nieuws/${generateSlug(nieuws.data.titel)}`}
									className='block group'
								>
									<p className='text-xs text-gray-500 mb-2'>{formatFullDate(nieuws.data.datum)}</p>
									<h4 className='font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2'>
										{nieuws.data.titel}
									</h4>
									<p className='text-sm text-gray-600 line-clamp-2'>
										{nieuws.data.samenvatting}
									</p>
								</a>
							) : (
								<div className='text-center py-4'>
									<p className='text-gray-500 text-sm'>Nog geen nieuws</p>
								</div>
							)}
						</div>
						<div className='px-6 pb-4'>
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

					{/* Snelle Vraag */}
					<div className='bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden'>
						<div className='bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3'>
							<h3 className='text-white font-semibold flex items-center gap-2'>
								<svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
								</svg>
								Veelgestelde Vraag
							</h3>
						</div>
						<div className='p-6'>
							{faq ? (
								<div>
									<h4 className='font-bold text-gray-800 mb-2'>
										{faq.data.vraag}
									</h4>
									<p className='text-sm text-gray-600 line-clamp-3'>
										{faq.data.antwoord}
									</p>
								</div>
							) : (
								<div className='text-center py-4'>
									<p className='text-gray-500 text-sm'>Geen FAQ beschikbaar</p>
								</div>
							)}
						</div>
						<div className='px-6 pb-4'>
							<a
								href='/contact'
								className='inline-flex items-center gap-1 text-sm text-amber-600 font-medium hover:underline'
							>
								Stel je vraag
								<svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
								</svg>
							</a>
						</div>
					</div>
				</div>

				{/* Quick action buttons */}
				<div className='flex flex-wrap justify-center gap-4 mt-10'>
					<a
						href='/kalender'
						className='inline-flex items-center gap-2 bg-[#ea247b] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#d11d6d] transition-colors focus:outline-none focus:ring-2 focus:ring-[#ea247b] focus:ring-offset-2'
					>
						<svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
						</svg>
						Bekijk alle activiteiten
					</a>
					<a
						href='/nieuws'
						className='inline-flex items-center gap-2 bg-white text-gray-800 font-semibold py-3 px-6 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2'
					>
						<svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' />
						</svg>
						Lees het nieuws
					</a>
					<a
						href='/contact'
						className='inline-flex items-center gap-2 bg-white text-gray-800 font-semibold py-3 px-6 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2'
					>
						<svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
						</svg>
						Neem contact op
					</a>
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
