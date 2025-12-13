import {
	fetchOneEntry, isPreviewing, isEditing,
} from '@builder.io/sdk-react-nextjs';

// Builder Public API Key set in .env file
// eslint-disable-next-line n/prefer-global/process
export const builderPublicApiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

export type PageSearchParameters = Record<string, string>;

/**
 * Error component shown when API key is not configured
 */
export function ConfigurationError() {
	return (
		<div>
			<h1>Configuration Error</h1>
			<p>NEXT_PUBLIC_BUILDER_API_KEY is not set</p>
		</div>
	);
}

/**
 * Error component shown when content fetch fails
 */
export function FetchError({message}: Readonly<{message: string}>) {
	return (
		<div>
			<h1>Error fetching content</h1>
			<p>{message}</p>
		</div>
	);
}

/**
 * Component shown when no content is found
 */
export function NotFoundContent() {
	return (
		<>
			<h1>404</h1>
			<p>Make sure you have your content published at builder.io.</p>
		</>
	);
}

type FetchBuilderContentResult = {
	content: Awaited<ReturnType<typeof fetchOneEntry>> | undefined;
	error?: string;
};

/**
 * Fetch Builder.io content for a given URL path
 */
export async function fetchBuilderContent(
	urlPath: string,
	searchParameters: PageSearchParameters,
	apiKey: string,
): Promise<FetchBuilderContentResult> {
	try {
		const content = await fetchOneEntry({
			options: searchParameters,
			apiKey,
			model: 'page',
			userAttributes: {urlPath},
		});
		return {content};
	} catch (error) {
		return {
			content: undefined,
			error: error instanceof Error ? error.message : 'Unknown error',
		};
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
