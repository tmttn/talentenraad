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
} from '../../lib/builder-utils';
import {
	generateMetadata as generateSeoMetadata,
	generateBreadcrumbSchema,
	JsonLd,
	siteConfig,
// eslint-disable-next-line import-x/extensions
} from '../../lib/seo';

// Enable ISR with fast revalidation for quick content updates
export const revalidate = 5;

type PageProperties = {
	params: Promise<{page: string[]}>;
	searchParams: Promise<PageSearchParameters>;
};

export async function generateMetadata({params}: PageProperties): Promise<Metadata> {
	const parameters = await params;
	const urlPath = '/' + (parameters?.page?.join('/') ?? '');

	if (!builderPublicApiKey) {
		return {title: siteConfig.name};
	}

	const {content} = await fetchBuilderContent(urlPath, {}, builderPublicApiKey);
	const seoData = extractSeoData(content);

	// Generate a readable title from the URL if no SEO title is set
	const fallbackTitle = parameters?.page?.at(-1)?.replaceAll('-', ' ').replaceAll(/\b\w/g, char => char.toUpperCase()) ?? siteConfig.name;

	return generateSeoMetadata({
		title: seoData.title ?? fallbackTitle,
		description: seoData.description ?? siteConfig.description,
		url: urlPath,
		image: seoData.image,
		noIndex: seoData.noIndex,
	});
}

export default async function Page(properties: Readonly<PageProperties>) {
	const parameters = await properties.params;
	const urlPath = '/' + (parameters?.page?.join('/') ?? '');

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

	// Generate breadcrumb schema from URL segments
	const breadcrumbItems = [{name: 'Home', url: '/'}];
	let currentPath = '';
	for (const segment of parameters?.page ?? []) {
		currentPath += `/${segment}`;
		const segmentName = segment.replaceAll('-', ' ').replaceAll(/\b\w/g, char => char.toUpperCase());
		breadcrumbItems.push({name: segmentName, url: currentPath});
	}

	const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

	return (
		<PageWithAnnouncements content={content ?? undefined}>
			<JsonLd data={breadcrumbSchema} />
			<BuilderContent content={content ?? null} apiKey={builderPublicApiKey} model='page' />
		</PageWithAnnouncements>
	);
}
