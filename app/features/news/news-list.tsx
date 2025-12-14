'use client';

import {useEffect, useState} from 'react';
import {linkStyles} from '@components/ui';

/* eslint-disable @stylistic/max-len */
const calendarIconPath = 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z';
const pinnedIconPath = 'M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5zm7 14l-5-2.5V5h10v9.5L12 17z';
const newsIconPath = 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z';
const arrowIconPath = 'M17 8l4 4m0 0l-4 4m4-4H3';
const facebookIconPath = 'M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z';
const instagramIconPath = 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z';
/* eslint-enable @stylistic/max-len */

const articleListClassName = [
	'bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow group overflow-hidden',
	'p-6 border-l-4 border-primary',
].join(' ');

const articleGridClassName = 'bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow group overflow-hidden';

const linkClassName = [
	'block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
	'focus-visible:ring-offset-2 rounded-xl',
].join(' ');

const socialLinkClassName = [
	'inline-flex items-center gap-2 text-primary font-semibold hover:underline',
	'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded',
].join(' ');

type NewsItem = {
	id: string;
	data: {
		titel: string;
		datum: string;
		samenvatting: string;
		inhoud?: string;
		afbeelding?: string;
		vastgepind?: boolean;
		volgorde?: number;
	};
};

type NewsListProperties = {
	title?: string;
	subtitle?: string;
	limit?: number;
	layout?: 'list' | 'grid';
	showImages?: boolean;
};

// Use environment variable for API key
const builderApiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY; // eslint-disable-line n/prefer-global/process

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

function NewsList({
	title = 'Laatste nieuws',
	subtitle,
	limit = 10,
	layout = 'list',
	showImages = true,
}: Readonly<NewsListProperties>) {
	const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadingMessage, setLoadingMessage] = useState('Nieuwsberichten worden geladen...');

	useEffect(() => {
		async function fetchNews() {
			if (!builderApiKey) {
				console.error('Builder.io API key not configured');
				setLoadingMessage('Configuratiefout: API key ontbreekt');
				setLoading(false);
				return;
			}

			try {
				const url = new URL('https://cdn.builder.io/api/v3/content/nieuws');
				url.searchParams.set('apiKey', builderApiKey);
				url.searchParams.set('limit', String(limit));
				url.searchParams.set('sort.data.datum', '-1'); // Sort by date descending (newest first)
				url.searchParams.set('cachebust', 'true');

				const response = await fetch(url.toString(), {cache: 'no-store'});
				const data = await response.json() as {results?: NewsItem[]};

				if (data.results) {
					// Sort: pinned first, then by volgorde, then by date (newest first)
					const sortedNews = data.results.sort((a: NewsItem, b: NewsItem) => {
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

						// Then by date (newest first)
						return new Date(b.data.datum).getTime() - new Date(a.data.datum).getTime();
					});

					setNewsItems(sortedNews);
				}
			} catch (error) {
				console.error('Error fetching news:', error);
				setLoadingMessage('Er is een fout opgetreden bij het laden van nieuws.');
			} finally {
				setLoading(false);
				setLoadingMessage('');
			}
		}

		void fetchNews();
	}, [limit]);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('nl-BE', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});
	};

	if (loading) {
		return (
			<section className='py-16 px-6' aria-busy='true' aria-label='Nieuwsberichten worden geladen'>
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
		<section className='py-16 px-6' aria-labelledby={title ? 'nieuws-title' : undefined}>
			<style dangerouslySetInnerHTML={{__html: linkStyles}} />
			<div className='max-w-4xl mx-auto'>
				{(title || subtitle) && (
					<div className='text-center mb-12'>
						{title && (
							<h2 id='nieuws-title' className='text-3xl md:text-4xl font-bold text-gray-800 mb-4'>
								{title}
							</h2>
						)}
						{subtitle && (
							<p className='text-gray-600'>{subtitle}</p>
						)}
					</div>
				)}

				{newsItems.length > 0
					? (
						<div
							className={layout === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}
							role='feed'
							aria-label='Nieuwsberichten'
						>
							{newsItems.map(item => (
								<a
									key={item.id}
									href={`/nieuws/${generateSlug(item.data.titel)}`}
									className={linkClassName}
								>
									<article className={layout === 'list' ? articleListClassName : articleGridClassName}>
										{showImages && item.data.afbeelding && layout === 'grid' && (
											<div className='relative h-48 overflow-hidden'>
												<img
													src={item.data.afbeelding}
													alt=''
													className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
												/>
											</div>
										)}
										<div className={layout === 'grid' ? 'p-5' : ''}>
											<div className='flex items-center gap-2 text-sm text-gray-500 mb-2'>
												<svg
													xmlns='http://www.w3.org/2000/svg'
													className='h-4 w-4'
													fill='none'
													viewBox='0 0 24 24'
													stroke='currentColor'
													aria-hidden='true'
												>
													<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={calendarIconPath} />
												</svg>
												{formatDate(item.data.datum)}
											</div>
											<h3 className={[
												'font-bold text-gray-800 mb-2 flex items-center gap-2',
												'group-hover:text-primary transition-colors',
												layout === 'grid' ? 'text-lg line-clamp-2' : 'text-xl',
											].join(' ')}>
												{item.data.titel}
												{item.data.vastgepind && (
													<svg
														xmlns='http://www.w3.org/2000/svg'
														className='h-5 w-5 text-primary flex-shrink-0'
														viewBox='0 0 24 24'
														fill='currentColor'
														aria-label='Vastgepind'
													>
														<path d={pinnedIconPath} />
													</svg>
												)}
											</h3>
											<p className={`text-gray-600 ${layout === 'grid' ? 'text-sm line-clamp-2' : ''}`}>
												{item.data.samenvatting}
											</p>
											<span
												className='animated-link inline-flex items-center gap-1 mt-3 text-primary font-semibold text-sm'
												aria-hidden='true'
											>
												Lees meer
												<svg
													xmlns='http://www.w3.org/2000/svg'
													className='animated-link-arrow h-4 w-4'
													fill='none'
													viewBox='0 0 24 24'
													stroke='currentColor'
													aria-hidden='true'
												>
													<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={arrowIconPath} />
												</svg>
											</span>
										</div>
									</article>
								</a>
							))}
						</div>
					)
					: (
						<div className='text-center py-16 px-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-200'>
							<div className='w-20 h-20 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-sm'>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-10 w-10 text-primary'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'
									aria-hidden='true'
								>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d={newsIconPath} />
								</svg>
							</div>
							<h3 className='text-xl font-bold text-gray-800 mb-2'>Nog geen nieuwsberichten</h3>
							<p className='text-gray-500 max-w-sm mx-auto mb-6'>
								Hier verschijnt binnenkort nieuws van de Talentenraad. Volg ons op sociale media voor updates!
							</p>
							<div className='flex items-center justify-center gap-4'>
								<a
									href='https://facebook.com/talentenhuis'
									target='_blank'
									rel='noopener noreferrer'
									className={socialLinkClassName}
									aria-label='Facebook (opent in nieuw venster)'
								>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-5 w-5'
										fill='currentColor'
										viewBox='0 0 24 24'
										aria-hidden='true'
									>
										<path d={facebookIconPath} />
									</svg>
									Facebook
								</a>
								<a
									href='https://instagram.com/talentenhuis'
									target='_blank'
									rel='noopener noreferrer'
									className={socialLinkClassName}
									aria-label='Instagram (opent in nieuw venster)'
								>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-5 w-5'
										fill='currentColor'
										viewBox='0 0 24 24'
										aria-hidden='true'
									>
										<path d={instagramIconPath} />
									</svg>
									Instagram
								</a>
							</div>
						</div>
					)}
			</div>
		</section>
	);
}

export const NewsListInfo = {
	name: 'NewsList',
	component: NewsList,
	inputs: [
		{
			name: 'title',
			type: 'string',
			defaultValue: 'Laatste nieuws',
		},
		{
			name: 'subtitle',
			type: 'string',
		},
		{
			name: 'limit',
			type: 'number',
			defaultValue: 10,
			helperText: 'Maximum aantal nieuwsberichten',
		},
		{
			name: 'layout',
			type: 'string',
			enum: ['list', 'grid'],
			defaultValue: 'list',
			helperText: 'Weergave: lijst (verticaal) of grid (kaarten)',
		},
		{
			name: 'showImages',
			type: 'boolean',
			defaultValue: true,
			helperText: 'Toon afbeeldingen bij nieuwsberichten (alleen bij grid layout)',
		},
	],
};
