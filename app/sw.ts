import {defaultCache} from '@serwist/turbopack/worker';
import {
	Serwist,
	CacheFirst,
	NetworkFirst,
	StaleWhileRevalidate,
	ExpirationPlugin,
	type PrecacheEntry,
	type SerwistGlobalConfig,
} from 'serwist';

declare global {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface WorkerGlobalScope extends SerwistGlobalConfig {
		__SW_MANIFEST: Array<PrecacheEntry | string> | undefined;
	}
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
	precacheEntries: self.__SW_MANIFEST,
	skipWaiting: true,
	clientsClaim: true,
	navigationPreload: true,
	runtimeCaching: [
		// Cache Builder.io CDN images
		{
			matcher: /^https:\/\/cdn\.builder\.io\/api\/v1\/image\/.*/i,
			handler: new CacheFirst({
				cacheName: 'builder-images',
				plugins: [
					new ExpirationPlugin({
						maxEntries: 100,
						maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
					}),
				],
			}),
		},
		// Cache Builder.io content API (stale-while-revalidate for dynamic content)
		{
			matcher: /^https:\/\/cdn\.builder\.io\/api\/v3\/content\/.*/i,
			handler: new StaleWhileRevalidate({
				cacheName: 'builder-content',
				plugins: [
					new ExpirationPlugin({
						maxEntries: 50,
						maxAgeSeconds: 60 * 60, // 1 hour
					}),
				],
			}),
		},
		// Cache page navigations
		{
			matcher: ({request}) => request.mode === 'navigate',
			handler: new NetworkFirst({
				cacheName: 'pages',
				networkTimeoutSeconds: 3,
				plugins: [
					new ExpirationPlugin({
						maxEntries: 50,
						maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
					}),
				],
			}),
		},
		// Include default Next.js caching
		...defaultCache,
	],
	fallbacks: {
		entries: [
			{
				url: '/offline',
				matcher: ({request}) => request.destination === 'document',
			},
		],
	},
});

// Push notification handling
self.addEventListener('push', event => {
	if (!event.data) {
		return;
	}

	const data = event.data.json() as {
		title: string;
		body: string;
		icon?: string;
		badge?: string;
		url?: string;
		tag?: string;
	};

	const options: NotificationOptions = {
		body: data.body,
		icon: data.icon ?? '/favicons/android-chrome-192x192.png',
		badge: data.badge ?? '/favicons/favicon-32x32.png',
		tag: data.tag ?? 'talentenraad-notification',
		data: {url: data.url ?? '/'},
	};

	event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', event => {
	event.notification.close();

	const url = (event.notification.data as {url?: string})?.url ?? '/';

	const handleClick = async () => {
		const clients = await self.clients.matchAll({type: 'window'});

		// Focus existing window if available
		for (const client of clients) {
			if (client.url === url && 'focus' in client) {
				return client.focus();
			}
		}

		// Open new window
		return self.clients.openWindow(url);
	};

	event.waitUntil(handleClick());
});

serwist.addEventListeners();
