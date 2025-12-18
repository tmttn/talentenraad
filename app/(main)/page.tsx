import type {Metadata} from 'next';
import {BuilderContent} from '@components/builder/builder-content';
import {PageWithAnnouncements} from '@components/layout/page-with-announcements';
import {
	builderPublicApiKey,
	fetchBuilderContent,
	canShowBuilderContent,
	extractSeoData,
	ConfigurationError,
	FetchError,
	NotFoundContent,
	type PageSearchParameters,
// eslint-disable-next-line import-x/extensions
} from '../lib/builder-utils';
// eslint-disable-next-line import-x/extensions
import {generateMetadata as generateSeoMetadata, siteConfig} from '../lib/seo';

// Enable ISR with fast revalidation for quick content updates
export const revalidate = 5;

type PageProperties = {
	params: Promise<{slug: string[]}>;
	searchParams: Promise<PageSearchParameters>;
};

export async function generateMetadata(): Promise<Metadata> {
	if (!builderPublicApiKey) {
		return {title: siteConfig.name};
	}

	const {content} = await fetchBuilderContent('/', {}, builderPublicApiKey);
	const seoData = extractSeoData(content);

	if (seoData.title ?? seoData.description) {
		return generateSeoMetadata({
			title: seoData.title ?? siteConfig.name,
			description: seoData.description ?? siteConfig.description,
			url: '/',
			image: seoData.image,
			noIndex: seoData.noIndex,
		});
	}

	return {
		title: siteConfig.name,
		description: siteConfig.description,
	};
}

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

	return (
		<PageWithAnnouncements content={content ?? undefined}>
			<BuilderContent content={content ?? null} apiKey={builderPublicApiKey} model='page' />
		</PageWithAnnouncements>
	);
}
