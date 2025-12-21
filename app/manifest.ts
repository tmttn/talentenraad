/* eslint-disable @typescript-eslint/naming-convention */
import type {MetadataRoute} from 'next';
// eslint-disable-next-line import-x/extensions
import {siteConfig} from '@/lib/seo';

// Web App Manifest spec requires snake_case property names
export default function manifest(): MetadataRoute.Manifest {
	return {
		name: siteConfig.name,
		short_name: 'Talentenraad',
		description: siteConfig.description,
		start_url: '/',
		display: 'standalone',
		background_color: '#ffffff',
		theme_color: '#ea247b',
		orientation: 'portrait-primary',
		scope: '/',
		lang: 'nl-BE',
		icons: [
			{
				src: '/favicons/android-chrome-192x192.png',
				sizes: '192x192',
				type: 'image/png',
				purpose: 'any',
			},
			{
				src: '/favicons/android-chrome-512x512.png',
				sizes: '512x512',
				type: 'image/png',
				purpose: 'any',
			},
			{
				src: '/favicons/android-chrome-512x512.png',
				sizes: '512x512',
				type: 'image/png',
				purpose: 'maskable',
			},
		],
		categories: ['education', 'community'],
	};
}
