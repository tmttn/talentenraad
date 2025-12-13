import {
	fetchOneEntry, isPreviewing, isEditing,
} from '@builder.io/sdk-react-nextjs';
import {BuilderContent} from '@components/builder-content';

// Builder Public API Key set in .env file
// eslint-disable-next-line n/prefer-global/process
const builderPublicApiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

type PageProperties = {
	params: Promise<{slug: string[]}>;
	searchParams: Promise<Record<string, string>>;
};

export default async function Page(properties: Readonly<PageProperties>) {
	const urlPath = '/';

	if (!builderPublicApiKey) {
		return (
			<div>
				<h1>Configuration Error</h1>
				<p>NEXT_PUBLIC_BUILDER_API_KEY is not set</p>
			</div>
		);
	}

	let content;
	try {
		content = await fetchOneEntry({
			options: (await properties.searchParams),
			apiKey: builderPublicApiKey,
			model: 'page',
			userAttributes: {urlPath},
		});
	} catch (error) {
		return (
			<div>
				<h1>Error fetching content</h1>
				<p>{error instanceof Error ? error.message : 'Unknown error'}</p>
			</div>
		);
	}

	const canShowContent
    = content ?? isPreviewing((await properties.searchParams)) ?? isEditing((await properties.searchParams));

	if (!canShowContent) {
		return (
			<>
				<h1>404</h1>
				<p>Make sure you have your content published at builder.io.</p>
			</>
		);
	}

	return <BuilderContent content={content} apiKey={builderPublicApiKey} model='page' />;
}
