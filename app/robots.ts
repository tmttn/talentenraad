import type {MetadataRoute} from 'next';
// eslint-disable-next-line import-x/extensions
import {siteConfig} from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: '*',
			allow: '/',
		},
		sitemap: `${siteConfig.url}/sitemap.xml`,
	};
}
