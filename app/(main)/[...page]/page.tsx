import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {BuilderContent} from '@components/builder/builder-content';
import {PageWithAnnouncements} from '@components/layout/page-with-announcements';
import {
	builderPublicApiKey,
	fetchBuilderContent,
	canShowBuilderContent,
	extractSeoData,
	ConfigurationError,
	FetchError,
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

export async function generateMetadata({params, searchParams}: PageProperties): Promise<Metadata> {
	const parameters = await params;
	const searchParameters = await searchParams;
	const urlPath = '/' + (parameters?.page?.join('/') ?? '');

	if (!builderPublicApiKey) {
		return {title: siteConfig.name};
	}

	const {content} = await fetchBuilderContent(urlPath, searchParameters, builderPublicApiKey);

	// Call notFound() early (in generateMetadata) so the 404 status is set before streaming starts
	if (!canShowBuilderContent(content, searchParameters)) {
		notFound();
	}

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

	// Note: notFound() is called in generateMetadata before streaming starts
	// to ensure the 404 status code is properly set. This check is kept as a
	// safeguard in case metadata generation is skipped.
	if (!canShowBuilderContent(content, searchParameters)) {
		notFound();
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
