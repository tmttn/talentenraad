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

// Enable ISR with revalidation every 60 seconds for better performance
// While still keeping content relatively fresh
export const revalidate = 60;

type PageProperties = {
	params: Promise<{page: string[]}>;
	searchParams: Promise<PageSearchParameters>;
};

export default async function Page(properties: Readonly<PageProperties>) {
	const parameters = await properties.params;
	const urlPath = '/' + (parameters?.page?.join('/') || '');

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
