import {
	builderPublicApiKey,
	fetchBuilderContent,
	canShowBuilderContent,
	ConfigurationError,
	FetchError,
	NotFoundContent,
	type PageSearchParameters,
// eslint-disable-next-line import-x/extensions
} from '../lib/builder-utils';
// eslint-disable-next-line import-x/extensions
import {BuilderContent} from '@/components/builder-content';

// Add this line to make the page dynamic
export const dynamic = 'force-dynamic';

type PageProperties = {
	params: Promise<{slug: string[]}>;
	searchParams: Promise<PageSearchParameters>;
};

export default async function Page(properties: Readonly<PageProperties>) {
	const parameters = await properties.params;
	const urlPath = '/' + (parameters?.slug?.join('/') || '');

	if (!builderPublicApiKey) {
		return <ConfigurationError />;
	}

	const searchParameters = await properties.searchParams;
	const {content, error} = await fetchBuilderContent(urlPath, searchParameters, builderPublicApiKey);

	if (error) {
		return <FetchError message={error} />;
	}

	if (!canShowBuilderContent(content, searchParameters)) {
		return <NotFoundContent />;
	}

	return <BuilderContent content={content ?? null} apiKey={builderPublicApiKey} model='page' />;
}
