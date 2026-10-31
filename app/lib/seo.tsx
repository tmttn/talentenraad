import type {Metadata} from 'next';

// Base site information
export const siteConfig = {
  name: 'Talentenraad',
  description: 'De Talentenraad van Talentenhuis - Een plek waar jongeren hun stem laten horen en samen bouwen aan een betere toekomst.',
  url: 'https://talentenraad.be',
  locale: 'nl_BE',
  type: 'website' as const,
  twitterHandle: '@talentenraad',
  defaultImage: '/og-default.png',
};

export type SeoConfig = {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
};

/**
 * Generate comprehensive metadata with OpenGraph and Twitter cards
 */
export function generateMetadata(config: SeoConfig): Metadata {
  const {
    title,
    description,
    url,
    image,
    type = 'website',
    publishedTime,
    modifiedTime,
    noIndex = false,
  } = config;

  const fullTitle = title === siteConfig.name ? title : `${title} | ${siteConfig.name}`;
  const pageUrl = url ? `${siteConfig.url}${url}` : siteConfig.url;
  const imageUrl = image ?? siteConfig.defaultImage;
  const absoluteImageUrl = imageUrl.startsWith('http') ? imageUrl : `${siteConfig.url}${imageUrl}`;

  const metadata: Metadata = {
    title: {absolute: fullTitle},
    description,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: pageUrl,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type,
      images: [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [absoluteImageUrl],
    },
  };

  // Add article-specific metadata
  if (type === 'article' && metadata.openGraph) {
    const openGraph = metadata.openGraph as Record<string, unknown>;
    if (publishedTime) {
      openGraph.publishedTime = publishedTime;
    }

    if (modifiedTime) {
      openGraph.modifiedTime = modifiedTime;
    }
  }

  // Add robots directives
  if (noIndex) {
    metadata.robots = {
      index: false,
      follow: false,
    };
  }

  return metadata;
}

/**
 * Generate structured data (JSON-LD) for organization
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
  };
}

/**
 * Generate structured data (JSON-LD) for a news article
 */
export function generateArticleSchema(article: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    url: `${siteConfig.url}${article.url}`,
    image: article.image ? (article.image.startsWith('http') ? article.image : `${siteConfig.url}${article.image}`) : undefined,
    datePublished: article.datePublished,
    dateModified: article.dateModified ?? article.datePublished,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

/**
 * Generate structured data (JSON-LD) for an event
 */
export function generateEventSchema(event: {
  name: string;
  description?: string;
  url: string;
  startDate: string;
  location?: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    url: `${siteConfig.url}${event.url}`,
    startDate: event.startDate,
    image: event.image,
    location: event.location
      ? {
        '@type': 'Place',
        name: event.location,
      }
      : undefined,
    organizer: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

/**
 * Generate breadcrumb structured data (JSON-LD)
 */
export function generateBreadcrumbSchema(items: Array<{name: string; url: string}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  };
}

/**
 * Serialize data for a JSON-LD script tag. Escapes `<` so content can never
 * close the script element.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replaceAll('<', String.raw`\u003c`);
}

/**
 * Component to render JSON-LD structured data
 */
export function JsonLd({data}: Readonly<{data: Record<string, unknown>}>) {
  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{__html: serializeJsonLd(data)}}
    />
  );
}
