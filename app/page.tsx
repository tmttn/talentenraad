import {BuilderContent} from '@components/builder-content';
import {
	builderPublicApiKey,
	fetchBuilderContent,
	canShowBuilderContent,
	ConfigurationError,
	FetchError,
	NotFoundContent,
	type PageSearchParameters,
// eslint-disable-next-line import-x/extensions
} from './lib/builder-utils';

type PageProperties = {
	params: Promise<{slug: string[]}>;
	searchParams: Promise<PageSearchParameters>;
};

export default async function Page(properties: Readonly<PageProperties>) {
	const urlPath = '/';

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
