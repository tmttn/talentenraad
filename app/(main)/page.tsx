import type {Metadata} from 'next';
import {BuilderContent} from '@components/builder/builder-content';
import {PageWithAnnouncements} from '@components/layout/page-with-announcements';
import {
  builderPublicApiKey,
  fetchBuilderContent,
  extractSeoData,
  ConfigurationError,
  type PageSearchParameters,
} from '@lib/builder-utils';
import {generateMetadata as generateSeoMetadata, siteConfig} from '@lib/seo';

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
  if (!builderPublicApiKey) {
    return <ConfigurationError />;
  }

  const searchParameters = await properties.searchParams;
  const {content} = await fetchBuilderContent('/', searchParameters, builderPublicApiKey);

  return (
    <PageWithAnnouncements content={content ?? undefined}>
      <BuilderContent content={content ?? null} apiKey={builderPublicApiKey} model='page' />
    </PageWithAnnouncements>
  );
}
