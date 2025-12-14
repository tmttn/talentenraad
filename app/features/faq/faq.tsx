'use client';

import {
	useEffect, useState, useRef, useCallback, type KeyboardEvent,
} from 'react';
import {
	QuestionIcon, ArrowRightIcon, questionPath, arrowRightPath,
} from '@components/ui/icons';

const faqButtonClassName = [
	'faq-button w-full px-6 py-4 text-left flex items-center justify-between gap-4',
	'hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2',
	'focus-visible:ring-focus focus-visible:ring-offset-2',
].join(' ');

const contactButtonClassName = [
	'inline-flex items-center gap-2 bg-primary text-white font-semibold py-3 px-6 rounded-lg',
	'hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2',
].join(' ');

// CSS for smooth height animation using CSS Grid trick
const faqStyles = `
	.faq-content-wrapper {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.faq-content-wrapper.open {
		grid-template-rows: 1fr;
	}

	.faq-content-inner {
		overflow: hidden;
	}

	.faq-content-text {
		opacity: 0;
		transform: translateY(-8px);
		transition: opacity 0.2s ease-out, transform 0.2s ease-out;
	}

	.faq-content-wrapper.open .faq-content-text {
		opacity: 1;
		transform: translateY(0);
		transition-delay: 0.1s;
	}

	.faq-item {
		opacity: 0;
		transform: translateY(16px);
		animation: faq-item-enter 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}

	@keyframes faq-item-enter {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.faq-chevron {
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.faq-chevron.open {
		transform: rotate(180deg);
	}

	.faq-button:hover .faq-chevron {
		transform: translateY(2px);
	}

	.faq-button:hover .faq-chevron.open {
		transform: rotate(180deg) translateY(2px);
	}
`;

type FaqItem = {
	id: string;
	data: {
		vraag: string;
		antwoord: string;
		volgorde?: number;
	};
};

// Generate JSON-LD structured data for FAQPage schema
function generateFaqStructuredData(faqs: FaqItem[]) {
	/* eslint-disable @typescript-eslint/naming-convention -- JSON-LD requires @context/@type */
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs.map(faq => ({
			'@type': 'Question',
			name: faq.data.vraag,
			acceptedAnswer: {
				'@type': 'Answer',
				text: faq.data.antwoord,
			},
		})),
	};
	/* eslint-enable @typescript-eslint/naming-convention */
}

type FaqProperties = {
	title?: string;
	subtitle?: string;
	showAskQuestion?: boolean;
};

// Use environment variable for API key
const builderApiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY ?? '3706422a8e454ceebe64acdc5a1475ba'; // eslint-disable-line n/prefer-global/process

function Faq({
	title = 'Veelgestelde vragen',
	subtitle,
	showAskQuestion = true,
}: Readonly<FaqProperties>) {
	const [faqs, setFaqs] = useState<FaqItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [openIndex, setOpenIndex] = useState<number | undefined>(undefined);
	const [statusMessage, setStatusMessage] = useState<string>('');
	const buttonRefs = useRef<Array<HTMLButtonElement | undefined>>([]);

	// Keyboard navigation handler for accordion
	const handleKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>, index: number) => {
		const {key} = event;
		const totalItems = faqs.length;

		let newIndex: number | undefined;

		switch (key) {
			case 'ArrowDown': {
				event.preventDefault();
				newIndex = index < totalItems - 1 ? index + 1 : 0;
				break;
			}

			case 'ArrowUp': {
				event.preventDefault();
				newIndex = index > 0 ? index - 1 : totalItems - 1;
				break;
			}

			case 'Home': {
				event.preventDefault();
				newIndex = 0;
				break;
			}

			case 'End': {
				event.preventDefault();
				newIndex = totalItems - 1;
				break;
			}

			default: {
				break;
			}
		}

		if (newIndex !== undefined) {
			buttonRefs.current[newIndex]?.focus();
		}
	}, [faqs.length]);

	useEffect(() => {
		async function fetchFaqs() {
			try {
				const url = new URL('https://cdn.builder.io/api/v3/content/faq');
				url.searchParams.set('apiKey', builderApiKey);
				url.searchParams.set('limit', '20');
				url.searchParams.set('sort.data.volgorde', '1');
				url.searchParams.set('cachebust', 'true');

				const response = await fetch(url.toString(), {cache: 'no-store'});

				// Gracefully handle 404 - content type may not exist yet
				if (!response.ok) {
					setLoading(false);
					return;
				}

				const data = await response.json() as {results?: FaqItem[]};

				if (data.results) {
					setFaqs(data.results);
				}
			} catch {
				// Silently fail - FAQs will show empty state
			} finally {
				setLoading(false);
			}
		}

		void fetchFaqs();
	}, []);

	const toggleFaq = (index: number) => {
		const isOpening = openIndex !== index;
		setOpenIndex(isOpening ? index : undefined);
		// Announce state change to screen readers
		const faqTitle = faqs[index]?.data.vraag ?? '';
		setStatusMessage(isOpening ? `${faqTitle} geopend` : `${faqTitle} gesloten`);
	};

	if (loading) {
		return (
			<section className='py-16 px-6 bg-gray-50' aria-busy='true' aria-label='Veelgestelde vragen worden geladen'>
				<div className='max-w-3xl mx-auto'>
					<div className='animate-pulse'>
						<div className='h-8 bg-gray-200 rounded w-64 mx-auto mb-4' />
						<div className='h-4 bg-gray-200 rounded w-48 mx-auto mb-8' />
						<div className='space-y-4'>
							{[1, 2, 3].map(i => (
								<div key={i} className='h-16 bg-gray-200 rounded' />
							))}
						</div>
					</div>
				</div>
				{/* Screen reader announcement for loading state */}
				<div className='sr-only' role='status' aria-live='polite'>
					Veelgestelde vragen worden geladen...
				</div>
			</section>
		);
	}

	return (
		<section className='py-16 px-6 bg-gray-50' aria-labelledby='faq-title'>
			{/* Inject FAQ animation styles */}
			<style dangerouslySetInnerHTML={{__html: faqStyles}} />
			{/* JSON-LD structured data for SEO */}
			{faqs.length > 0 && (
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(generateFaqStructuredData(faqs)),
					}}
				/>
			)}
			<div className='max-w-3xl mx-auto'>
				{/* Screen reader announcement for accordion state changes */}
				<div className='sr-only' role='status' aria-live='polite' aria-atomic='true'>
					{statusMessage}
				</div>

				{(title || subtitle) && (
					<div className='text-center mb-12'>
						{title && (
							<h2 id='faq-title' className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
								{title}
							</h2>
						)}
						{subtitle && (
							<p className='text-gray-600'>{subtitle}</p>
						)}
					</div>
				)}

				{faqs.length > 0
					? (
						<div className='space-y-4' role='region' aria-label='Veelgestelde vragen accordeon'>
							{faqs.map((faq, index) => (
								<div
									key={faq.id}
									className='faq-item bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow'
									style={{animationDelay: `${index * 0.08}s`}}
								>
									<button
										ref={element => {
											buttonRefs.current[index] = element ?? undefined;
										}}
										type='button'
										onClick={() => {
											toggleFaq(index);
										}}
										onKeyDown={event => {
											handleKeyDown(event, index);
										}}
										className={faqButtonClassName}
										aria-expanded={openIndex === index}
										aria-controls={`faq-answer-${index}`}
										id={`faq-button-${index}`}
									>
										<span className='font-semibold text-gray-900'>{faq.data.vraag}</span>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											className={`faq-chevron h-5 w-5 text-primary flex-shrink-0 ${openIndex === index ? 'open' : ''}`}
											fill='none'
											viewBox='0 0 24 24'
											stroke='currentColor'
											aria-hidden='true'
										>
											<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
										</svg>
									</button>
									<div
										id={`faq-answer-${index}`}
										role='region'
										aria-labelledby={`faq-button-${index}`}
										className={`faq-content-wrapper ${openIndex === index ? 'open' : ''}`}
										aria-hidden={openIndex !== index}
									>
										<div className='faq-content-inner'>
											<div className='faq-content-text px-6 pb-4 text-gray-700'>
												<p>{faq.data.antwoord}</p>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					)
					: (
						<div className='text-center py-16 px-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-dashed border-gray-200'>
							<div className='w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center'>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-10 w-10 text-primary'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'
									aria-hidden='true'
								>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d={questionPath} />
								</svg>
							</div>
							<h3 className='text-xl font-bold text-gray-800 mb-2'>Nog geen vragen</h3>
							<p className='text-gray-500 max-w-sm mx-auto'>
								Binnenkort voegen we hier veelgestelde vragen toe.
							</p>
						</div>
					)}

				{showAskQuestion && (
					<div className='mt-12 text-center p-8 bg-white rounded-2xl shadow-sm'>
						<h3 className='text-xl font-bold text-gray-900 mb-2'>
							Staat jouw vraag er niet bij?
						</h3>
						<p className='text-gray-600 mb-6'>
							Neem gerust contact met ons op. We helpen je graag verder!
						</p>
						<a href='/contact' className={contactButtonClassName}>
							Stel je vraag
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-5 w-5'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
								aria-hidden='true'
							>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={arrowRightPath} />
							</svg>
						</a>
					</div>
				)}
			</div>
		</section>
	);
}

export const FaqInfo = {
	name: 'FAQ',
	component: Faq,
	inputs: [
		{
			name: 'title',
			type: 'string',
			defaultValue: 'Veelgestelde vragen',
		},
		{
			name: 'subtitle',
			type: 'string',
		},
		{
			name: 'showAskQuestion',
			type: 'boolean',
			defaultValue: true,
			helperText: 'Toon "Stel je vraag" sectie onderaan',
		},
	],
};
