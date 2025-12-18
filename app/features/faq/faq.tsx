'use client';

import {
	useEffect, useState, useRef, useCallback, type KeyboardEvent,
} from 'react';
import {ChevronDown, HelpCircle} from 'lucide-react';

const faqButtonClassName = [
	'faq-button w-full px-6 py-4 text-left flex items-center justify-between gap-4',
	'hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2',
	'focus-visible:ring-focus focus-visible:ring-offset-2',
].join(' ');

/**
 * CSS for smooth height animation using CSS Grid trick
 * Uses design token variables for transitions
 */
const faqStyles = `
	.faq-content-wrapper {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows var(--duration-slow) var(--easing-smooth);
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
		transition: opacity var(--duration-fast) ease-out, transform var(--duration-fast) ease-out;
	}

	.faq-content-wrapper.open .faq-content-text {
		opacity: 1;
		transform: translateY(0);
		transition-delay: 0.1s;
	}

	.faq-item {
		opacity: 0;
		transform: translateY(16px);
		animation: faq-item-enter 0.4s var(--easing-smooth) forwards;
	}

	@keyframes faq-item-enter {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.faq-chevron {
		transition: transform var(--duration-slow) var(--easing-smooth);
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

// Use environment variable for API key
const builderApiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY ?? '3706422a8e454ceebe64acdc5a1475ba'; // eslint-disable-line n/prefer-global/process

function Faq() {
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
			<div className='max-w-4xl mx-auto px-6 animate-pulse space-y-4'>
				{[1, 2, 3].map(i => (
					<div key={i} className='h-16 bg-gray-200 rounded' />
				))}
			</div>
		);
	}

	if (faqs.length === 0) {
		return (
			<div className='max-w-4xl mx-auto px-6 text-center py-section-sm bg-gradient-to-br from-white to-gray-50 rounded-modal border-2 border-dashed border-gray-200'>
				<div className='w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center'>
					<HelpCircle className='h-10 w-10 text-primary' aria-hidden='true' />
				</div>
				<p className='text-gray-500'>Geen veelgestelde vragen gevonden</p>
			</div>
		);
	}

	return (
		<div className='max-w-4xl mx-auto px-6'>
			<style dangerouslySetInnerHTML={{__html: faqStyles}} />
			{faqs.length > 0 && (
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(generateFaqStructuredData(faqs)),
					}}
				/>
			)}
			<div className='sr-only' role='status' aria-live='polite' aria-atomic='true'>
				{statusMessage}
			</div>

			<div className='space-y-4' role='region' aria-label='Veelgestelde vragen accordeon'>
				{faqs.map((faq, index) => (
					<div
						key={faq.id}
						className='faq-item bg-white rounded-card shadow-subtle overflow-hidden hover:shadow-base transition-shadow duration-base'
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
							<ChevronDown
								className={`faq-chevron h-5 w-5 text-primary flex-shrink-0 ${openIndex === index ? 'open' : ''}`}
								aria-hidden='true'
							/>
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
		</div>
	);
}

export const FaqInfo = {
	name: 'FAQ',
	component: Faq,
	inputs: [],
};
