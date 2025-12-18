import {
	fetchOneEntry,
	getBuilderSearchParams,
	isPreviewing,
	isEditing,
} from '@builder.io/sdk-react-nextjs';

// Builder Public API Key set in .env file
// eslint-disable-next-line n/prefer-global/process
export const builderPublicApiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY!;

export type PageSearchParameters = Record<string, string>;

/**
 * Error component shown when API key is not configured
 */
export function ConfigurationError() {
	return (
		<div className='min-h-[50vh] flex items-center justify-center'>
			<div className='text-center'>
				<h1 className='text-2xl font-bold text-gray-800'>Configuration Error</h1>
				<p className='text-gray-600 mt-2'>NEXT_PUBLIC_BUILDER_API_KEY is not set</p>
			</div>
		</div>
	);
}

/**
 * Error component shown when content fetch fails
 */
export function FetchError({message}: Readonly<{message: string}>) {
	return (
		<div className='min-h-[50vh] flex items-center justify-center'>
			<div className='text-center'>
				<h1 className='text-2xl font-bold text-gray-800'>Error fetching content</h1>
				<p className='text-gray-600 mt-2'>{message}</p>
			</div>
		</div>
	);
}

type FetchBuilderContentResult = {
	content: Awaited<ReturnType<typeof fetchOneEntry>> | undefined;
	error?: string;
};

/**
 * Fetch Builder.io content for a given URL path
 * Uses userAttributes.urlPath to match against Builder.io's targeting query
 */
export async function fetchBuilderContent(
	urlPath: string,
	searchParameters: PageSearchParameters,
	apiKey: string,
): Promise<FetchBuilderContentResult> {
	try {
		// Use direct API call with userAttributes.urlPath for targeting-based page matching
		const url = new URL('https://cdn.builder.io/api/v3/content/page');
		url.searchParams.set('apiKey', apiKey);
		url.searchParams.set('userAttributes.urlPath', urlPath);
		url.searchParams.set('limit', '1');
		url.searchParams.set('cachebust', 'true');

		// Add preview/edit params if present
		const builderParams = getBuilderSearchParams(searchParameters);
		for (const [key, value] of Object.entries(builderParams)) {
			if (value) {
				url.searchParams.set(key, String(value));
			}
		}

		const response = await fetch(url.toString(), {cache: 'no-store'});

		if (!response.ok) {
			return {content: undefined, error: `HTTP ${response.status}`};
		}

		const data = await response.json() as {results?: Array<{id: string; data: Record<string, unknown>}>};
		const content = data.results?.[0] ?? null;

		return {content: content as Awaited<ReturnType<typeof fetchOneEntry>>};
	} catch (error) {
		return {
			content: undefined,
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
}

/**
 * Fetch Builder.io section content by model name
 * Use this for reusable sections like announcement bars, footer CTAs, etc.
 */
export async function fetchBuilderSection(
	model: string,
	urlPath = '/',
	apiKey: string = builderPublicApiKey,
): Promise<Awaited<ReturnType<typeof fetchOneEntry>> | undefined> {
	try {
		const content = await fetchOneEntry({
			model,
			apiKey,
			userAttributes: {
				urlPath,
			},
			cacheSeconds: 0,
			staleCacheSeconds: 0,
			fetchOptions: {
				cache: 'no-store',
			},
		});
		return content ?? undefined;
	} catch (error) {
		console.error(`Error fetching section ${model}:`, error);
		return undefined;
	}
}

/**
 * Check if content can be shown (content exists, or in preview/edit mode)
 */
export function canShowBuilderContent(
	content: Awaited<ReturnType<typeof fetchOneEntry>> | undefined,
	searchParameters: PageSearchParameters,
): boolean {
	return Boolean(content) || isPreviewing(searchParameters) || isEditing(searchParameters);
}

export {getBuilderSearchParams, isEditing, isPreviewing} from '@builder.io/sdk-react-nextjs';

// SEO data extraction from Builder.io content
export type BuilderSeoData = {
	title?: string;
	description?: string;
	image?: string;
	noIndex?: boolean;
};

/**
 * Extract SEO data from Builder.io page content
 * Builder.io pages can have seoTitle, seoDescription, and ogImage fields
 */
export function extractSeoData(content: Awaited<ReturnType<typeof fetchOneEntry>> | undefined): BuilderSeoData {
	if (!content?.data) {
		return {};
	}

	const data = content.data as Record<string, unknown>;

	return {
		title: (data.seoTitle as string) ?? (data.title as string),
		description: (data.seoDescription as string) ?? (data.description as string),
		image: (data.ogImage as string) ?? (data.image as string),
		noIndex: data.noIndex as boolean,
	};
}

// Announcement types
export type AnnouncementType = 'info' | 'waarschuwing' | 'belangrijk';

export type PageAnnouncementData = {
	actief: boolean;
	tekst: string;
	type: AnnouncementType;
	link?: string;
	linkTekst?: string;
};

export type GlobalAnnouncementEntry = {
	id: string;
	data: {
		tekst: string;
		link?: string;
		linkTekst?: string;
		type: AnnouncementType;
		actief: boolean;
	};
};

/**
 * Fetch global announcement from Builder.io
 * Returns the first active announcement from the 'aankondiging' model
 */
export async function fetchGlobalAnnouncement(apiKey: string = builderPublicApiKey): Promise<GlobalAnnouncementEntry['data'] | undefined> {
	try {
		const url = new URL('https://cdn.builder.io/api/v3/content/aankondiging');
		url.searchParams.set('apiKey', apiKey);
		url.searchParams.set('limit', '1');
		url.searchParams.set('query.data.actief', 'true');
		url.searchParams.set('cachebust', 'true');

		const response = await fetch(url.toString(), {cache: 'no-store'});

		if (!response.ok) {
			return undefined;
		}

		const data = await response.json() as {results?: GlobalAnnouncementEntry[]};

		if (data.results && data.results.length > 0) {
			return data.results[0].data;
		}

		return undefined;
	} catch {
		return undefined;
	}
}

/**
 * Extract page-specific announcement from Builder.io page content
 */
export function extractPageAnnouncement(content: Awaited<ReturnType<typeof fetchOneEntry>> | undefined): {tekst: string; type: AnnouncementType; link?: string; linkTekst?: string} | undefined {
	if (!content?.data) {
		return undefined;
	}

	const announcement = content.data.paginaAankondiging as PageAnnouncementData | undefined;

	if (!announcement?.actief || !announcement.tekst) {
		return undefined;
	}

	return {
		tekst: announcement.tekst,
		type: announcement.type ?? 'info',
		link: announcement.link,
		linkTekst: announcement.linkTekst,
	};
}
