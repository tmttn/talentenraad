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
	let score = 100;

	// Title analysis
	if (!content.title) {
		issues.push({type: 'error', message: 'Titel ontbreekt', field: 'title'});
		score -= 25;
	} else if (content.title.length < 30) {
		issues.push({type: 'warning', message: 'Titel is te kort (min. 30 tekens)', field: 'title'});
		score -= 10;
	} else if (content.title.length > 60) {
		issues.push({type: 'warning', message: 'Titel is te lang (max. 60 tekens)', field: 'title'});
		score -= 5;
	}

	// Description analysis
	if (!content.description) {
		issues.push({type: 'error', message: 'Beschrijving ontbreekt', field: 'description'});
		score -= 25;
	} else if (content.description.length < 120) {
		issues.push({type: 'warning', message: 'Beschrijving is te kort (min. 120 tekens)', field: 'description'});
		score -= 10;
	} else if (content.description.length > 160) {
		issues.push({type: 'warning', message: 'Beschrijving is te lang (max. 160 tekens)', field: 'description'});
		score -= 5;
	}

	// Image analysis
	if (!content.image) {
		issues.push({type: 'warning', message: 'Geen afbeelding voor social media sharing', field: 'image'});
		score -= 15;
		suggestions.push('Voeg een afbeelding toe voor betere weergave op social media');
	}

	// Content analysis
	if (content.content) {
		const wordCount = content.content.split(/\s+/).length;
		if (wordCount < 300) {
			issues.push({type: 'info', message: `Inhoud is kort (${wordCount} woorden)`, field: 'content'});
			suggestions.push('Langere content presteert meestal beter in zoekmachines');
		}
	}

	// Ensure score doesn't go below 0
	score = Math.max(0, score);

	return {score, issues, suggestions};
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
