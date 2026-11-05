import type {MetadataRoute} from 'next';
import {siteConfig} from '@lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Order pages (/b/<token>) are private links
      disallow: '/b/',
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
