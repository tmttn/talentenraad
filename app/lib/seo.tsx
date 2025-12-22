import type {Metadata} from 'next';

// Base site information
export const siteConfig = {
	name: 'Talentenraad',
	description: 'De Talentenraad van Talentenhuis - Een plek waar jongeren hun stem laten horen en samen bouwen aan een betere toekomst.',
	url: 'https://talentenraad.be',
	locale: 'nl_BE',
	type: 'website' as const,
	twitterHandle: '@talentenraad',
	defaultImage: '/images/og-default.jpg',
};

export type SeoConfig = {
	title: string;
	description: string;
	url?: string;
	image?: string;
	type?: 'website' | 'article';
	publishedTime?: string;
	modifiedTime?: string;
	noIndex?: boolean;
};

/**
 * Generate comprehensive metadata with OpenGraph and Twitter cards
 */
export function generateMetadata(config: SeoConfig): Metadata {
	const {
		title,
		description,
		url,
		image,
		type = 'website',
		publishedTime,
		modifiedTime,
		noIndex = false,
	} = config;

	const fullTitle = title === siteConfig.name ? title : `${title} | ${siteConfig.name}`;
	const pageUrl = url ? `${siteConfig.url}${url}` : siteConfig.url;
	const imageUrl = image ?? siteConfig.defaultImage;
	const absoluteImageUrl = imageUrl.startsWith('http') ? imageUrl : `${siteConfig.url}${imageUrl}`;

	const metadata: Metadata = {
		title: fullTitle,
		description,
		metadataBase: new URL(siteConfig.url),
		alternates: {
			canonical: pageUrl,
		},
		openGraph: {
			title: fullTitle,
			description,
			url: pageUrl,
			siteName: siteConfig.name,
			locale: siteConfig.locale,
			type,
			images: [
				{
					url: absoluteImageUrl,
					width: 1200,
					height: 630,
					alt: title,
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title: fullTitle,
			description,
			images: [absoluteImageUrl],
		},
	};

	// Add article-specific metadata
	if (type === 'article' && metadata.openGraph) {
		const openGraph = metadata.openGraph as Record<string, unknown>;
		if (publishedTime) {
			openGraph.publishedTime = publishedTime;
		}

		if (modifiedTime) {
			openGraph.modifiedTime = modifiedTime;
		}
	}

	// Add robots directives
	if (noIndex) {
		metadata.robots = {
			index: false,
			follow: false,
		};
	}

	return metadata;
}

/**
 * Generate structured data (JSON-LD) for organization
 */
export function generateOrganizationSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: siteConfig.name,
		url: siteConfig.url,
		logo: `${siteConfig.url}/logo.png`,
		description: siteConfig.description,
	};
}

/**
 * Generate structured data (JSON-LD) for a news article
 */
export function generateArticleSchema(article: {
	title: string;
	description: string;
	url: string;
	image?: string;
	datePublished: string;
	dateModified?: string;
}) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: article.title,
		description: article.description,
		url: `${siteConfig.url}${article.url}`,
		image: article.image ? (article.image.startsWith('http') ? article.image : `${siteConfig.url}${article.image}`) : undefined,
		datePublished: article.datePublished,
		dateModified: article.dateModified ?? article.datePublished,
		publisher: {
			'@type': 'Organization',
			name: siteConfig.name,
			url: siteConfig.url,
		},
	};
}

/**
 * Generate structured data (JSON-LD) for an event
 */
export function generateEventSchema(event: {
	name: string;
	description?: string;
	url: string;
	startDate: string;
	location?: string;
	image?: string;
}) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Event',
		name: event.name,
		description: event.description,
		url: `${siteConfig.url}${event.url}`,
		startDate: event.startDate,
		image: event.image,
		location: event.location
			? {
				'@type': 'Place',
				name: event.location,
			}
			: undefined,
		organizer: {
			'@type': 'Organization',
			name: siteConfig.name,
			url: siteConfig.url,
		},
	};
}

/**
 * Generate breadcrumb structured data (JSON-LD)
 */
export function generateBreadcrumbSchema(items: Array<{name: string; url: string}>) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: `${siteConfig.url}${item.url}`,
		})),
	};
}

/**
 * Component to render JSON-LD structured data
 */
export function JsonLd({data}: Readonly<{data: Record<string, unknown>}>) {
	return (
		<script
			type='application/ld+json'
			dangerouslySetInnerHTML={{__html: JSON.stringify(data)}}
		/>
	);
}

// SEO analysis utilities for admin dashboard
export type SeoAnalysis = {
	score: number;
	issues: SeoIssue[];
	suggestions: string[];
	fieldScores: {
		title: FieldScore;
		description: FieldScore;
		image: FieldScore;
		content?: FieldScore;
	};
	quickWins: QuickWin[];
};

export type FieldScore = {
	score: number;
	maxScore: number;
	status: 'good' | 'warning' | 'error' | 'missing';
	recommendation?: string;
};

export type QuickWin = {
	field: 'title' | 'description' | 'image' | 'content';
	action: string;
	impact: number; // How many points this would add
};

export type SeoIssue = {
	type: 'error' | 'warning' | 'info';
	message: string;
	field?: string;
};

/**
 * Analyze SEO quality of content
 */
export function analyzeSeo(content: {
	title?: string;
	description?: string;
	image?: string;
	content?: string;
}): SeoAnalysis {
	const issues: SeoIssue[] = [];
	const suggestions: string[] = [];
	const quickWins: QuickWin[] = [];
	let score = 100;

	// Field scores initialization
	const fieldScores: SeoAnalysis['fieldScores'] = {
		title: {score: 0, maxScore: 25, status: 'missing'},
		description: {score: 0, maxScore: 25, status: 'missing'},
		image: {score: 0, maxScore: 15, status: 'missing'},
	};

	// Title analysis (25 points max)
	if (!content.title) {
		issues.push({type: 'error', message: 'Titel ontbreekt', field: 'title'});
		score -= 25;
		fieldScores.title = {
			score: 0,
			maxScore: 25,
			status: 'missing',
			recommendation: 'Voeg een pakkende titel toe van 30-60 tekens',
		};
		quickWins.push({field: 'title', action: 'Voeg een titel toe', impact: 25});
	} else if (content.title.length < 30) {
		issues.push({type: 'warning', message: `Titel is te kort (${content.title.length}/30 tekens)`, field: 'title'});
		score -= 10;
		fieldScores.title = {
			score: 15,
			maxScore: 25,
			status: 'warning',
			recommendation: `Voeg nog ${30 - content.title.length} tekens toe`,
		};
		quickWins.push({field: 'title', action: `Verleng titel met ${30 - content.title.length} tekens`, impact: 10});
	} else if (content.title.length > 60) {
		issues.push({type: 'warning', message: `Titel is te lang (${content.title.length}/60 tekens)`, field: 'title'});
		score -= 5;
		fieldScores.title = {
			score: 20,
			maxScore: 25,
			status: 'warning',
			recommendation: `Verkort titel met ${content.title.length - 60} tekens`,
		};
		quickWins.push({field: 'title', action: `Verkort titel met ${content.title.length - 60} tekens`, impact: 5});
	} else {
		fieldScores.title = {score: 25, maxScore: 25, status: 'good'};
	}

	// Description analysis (25 points max)
	if (!content.description) {
		issues.push({type: 'error', message: 'Samenvatting ontbreekt', field: 'description'});
		score -= 25;
		fieldScores.description = {
			score: 0,
			maxScore: 25,
			status: 'missing',
			recommendation: 'Voeg een samenvatting toe van 120-160 tekens',
		};
		quickWins.push({field: 'description', action: 'Voeg een samenvatting toe', impact: 25});
	} else if (content.description.length < 120) {
		issues.push({type: 'warning', message: `Samenvatting is te kort (${content.description.length}/120 tekens)`, field: 'description'});
		score -= 10;
		fieldScores.description = {
			score: 15,
			maxScore: 25,
			status: 'warning',
			recommendation: `Voeg nog ${120 - content.description.length} tekens toe`,
		};
		quickWins.push({field: 'description', action: `Verleng samenvatting met ${120 - content.description.length} tekens`, impact: 10});
	} else if (content.description.length > 160) {
		issues.push({type: 'warning', message: `Samenvatting is te lang (${content.description.length}/160 tekens)`, field: 'description'});
		score -= 5;
		fieldScores.description = {
			score: 20,
			maxScore: 25,
			status: 'warning',
			recommendation: `Verkort samenvatting met ${content.description.length - 160} tekens`,
		};
		quickWins.push({field: 'description', action: `Verkort samenvatting met ${content.description.length - 160} tekens`, impact: 5});
	} else {
		fieldScores.description = {score: 25, maxScore: 25, status: 'good'};
	}

	// Image analysis (15 points max)
	if (!content.image) {
		issues.push({type: 'warning', message: 'Geen afbeelding voor social media sharing', field: 'image'});
		score -= 15;
		fieldScores.image = {
			score: 0,
			maxScore: 15,
			status: 'missing',
			recommendation: 'Voeg een afbeelding toe (1200x630px aanbevolen)',
		};
		suggestions.push('Voeg een afbeelding toe voor betere weergave op social media');
		quickWins.push({field: 'image', action: 'Voeg een afbeelding toe', impact: 15});
	} else {
		fieldScores.image = {score: 15, maxScore: 15, status: 'good'};
	}

	// Content analysis (35 points max - only when content is provided/expected)
	if (content.content !== undefined) {
		const strippedContent = content.content.replaceAll(/<[^>]*>/g, '').trim(); // Strip HTML tags
		const wordCount = strippedContent ? strippedContent.split(/\s+/).length : 0;

		if (!strippedContent || wordCount === 0) {
			issues.push({type: 'error', message: 'Inhoud ontbreekt', field: 'content'});
			score -= 35;
			fieldScores.content = {
				score: 0,
				maxScore: 35,
				status: 'missing',
				recommendation: 'Voeg inhoud toe van minimaal 100 woorden',
			};
			quickWins.push({field: 'content', action: 'Voeg inhoud toe', impact: 35});
		} else if (wordCount < 100) {
			issues.push({type: 'warning', message: `Inhoud is te kort (${wordCount}/100 woorden)`, field: 'content'});
			score -= 20;
			fieldScores.content = {
				score: 15,
				maxScore: 35,
				status: 'warning',
				recommendation: `Voeg nog ${100 - wordCount} woorden toe`,
			};
			quickWins.push({field: 'content', action: `Voeg nog ${100 - wordCount} woorden toe`, impact: 20});
		} else if (wordCount < 300) {
			issues.push({type: 'info', message: `Inhoud is kort (${wordCount} woorden)`, field: 'content'});
			score -= 5;
			fieldScores.content = {
				score: 30,
				maxScore: 35,
				status: 'good',
				recommendation: `Overweeg nog ${300 - wordCount} woorden toe te voegen voor optimale SEO`,
			};
			suggestions.push('Langere content (300+ woorden) presteert meestal beter in zoekmachines');
		} else {
			fieldScores.content = {score: 35, maxScore: 35, status: 'good'};
		}
	}

	// Ensure score doesn't go below 0
	score = Math.max(0, score);

	// Sort quick wins by impact (highest first)
	quickWins.sort((a, b) => b.impact - a.impact);

	return {score, issues, suggestions, fieldScores, quickWins};
}

/**
 * Get SEO score color based on score value
 */
export function getSeoScoreColor(score: number): string {
	if (score >= 80) return 'text-green-600';
	if (score >= 60) return 'text-yellow-600';
	return 'text-red-600';
}

/**
 * Get SEO score background color
 */
export function getSeoScoreBgColor(score: number): string {
	if (score >= 80) return 'bg-green-100';
	if (score >= 60) return 'bg-yellow-100';
	return 'bg-red-100';
}

/**
 * Get SEO score label
 */
export function getSeoScoreLabel(score: number): string {
	if (score >= 80) return 'Goed';
	if (score >= 60) return 'Kan beter';
	return 'Aandacht nodig';
}
