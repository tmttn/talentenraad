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
		<div className="min-h-[50vh] flex items-center justify-center">
			<div className="text-center">
				<h1 className="text-2xl font-bold text-gray-800">Configuration Error</h1>
				<p className="text-gray-600 mt-2">NEXT_PUBLIC_BUILDER_API_KEY is not set</p>
			</div>
		</div>
	);
}

/**
 * Error component shown when content fetch fails
 */
export function FetchError({message}: Readonly<{message: string}>) {
	return (
		<div className="min-h-[50vh] flex items-center justify-center">
			<div className="text-center">
				<h1 className="text-2xl font-bold text-gray-800">Error fetching content</h1>
				<p className="text-gray-600 mt-2">{message}</p>
			</div>
		</div>
	);
}

/**
 * Component shown when no content is found
 */
export function NotFoundContent() {
	return (
		<div className="min-h-[50vh] flex items-center justify-center">
			<div className="text-center">
				<h1 className="text-6xl font-bold text-[#ea247b]">404</h1>
				<p className="text-gray-600 mt-4">Deze pagina bestaat niet.</p>
				<p className="text-gray-500 text-sm mt-2">Controleer of de content gepubliceerd is op builder.io</p>
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
 */
export async function fetchBuilderContent(
	urlPath: string,
	searchParameters: PageSearchParameters,
	apiKey: string,
): Promise<FetchBuilderContentResult> {
	try {
		const content = await fetchOneEntry({
			model: 'page',
			apiKey,
			options: getBuilderSearchParams(searchParameters),
			userAttributes: {
				urlPath,
			},
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
 * Fetch Builder.io section content by model name
 * Use this for reusable sections like announcement bars, footer CTAs, etc.
 */
export async function fetchBuilderSection(
	model: string,
	urlPath: string = '/',
	apiKey: string = builderPublicApiKey,
): Promise<Awaited<ReturnType<typeof fetchOneEntry>> | undefined> {
	try {
		const content = await fetchOneEntry({
			model,
			apiKey,
			userAttributes: {
				urlPath,
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

export {getBuilderSearchParams, isPreviewing, isEditing};
