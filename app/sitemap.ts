import type {MetadataRoute} from 'next';
// eslint-disable-next-line import-x/extensions
import {siteConfig} from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = siteConfig.url;

	return [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 1,
		},
	];
}
