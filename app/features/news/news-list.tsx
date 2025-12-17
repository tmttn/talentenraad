'use client';

import {useEffect, useState} from 'react';
import {
	Calendar,
	Pin,
	Newspaper,
	ArrowRight,
} from 'lucide-react';
import {linkStyles} from '@components/ui';

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
		<section className='py-16 px-6'>
			<style dangerouslySetInnerHTML={{__html: linkStyles}} />
			<div className='max-w-4xl mx-auto'>
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
												<Calendar className='h-4 w-4' aria-hidden='true' />
												{formatDate(item.data.datum)}
											</div>
											<h3 className={[
												'font-bold text-gray-800 mb-2 flex items-center gap-2',
												'group-hover:text-primary transition-colors',
												layout === 'grid' ? 'text-lg line-clamp-2' : 'text-xl',
											].join(' ')}>
												{item.data.titel}
												{item.data.vastgepind && (
													<span className='text-primary flex-shrink-0' aria-label='Vastgepind'>
														<Pin className='h-5 w-5' aria-hidden='true' />
													</span>
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
												<ArrowRight className='h-4 w-4 animated-link-arrow' aria-hidden='true' />
											</span>
										</div>
									</article>
								</a>
							))}
						</div>
					)
					: (
						<div className='text-center py-16 px-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-200'>
							<div className='w-20 h-20 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-sm text-primary'>
								<Newspaper className='h-10 w-10' aria-hidden='true' />
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
									Facebook
									<ArrowRight className='h-4 w-4' aria-hidden='true' />
								</a>
								<a
									href='https://instagram.com/talentenhuis'
									target='_blank'
									rel='noopener noreferrer'
									className={socialLinkClassName}
									aria-label='Instagram (opent in nieuw venster)'
								>
									Instagram
									<ArrowRight className='h-4 w-4' aria-hidden='true' />
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
