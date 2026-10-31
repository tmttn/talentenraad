import {defaultCache} from '@serwist/turbopack/worker';
import {
  Serwist,
  NetworkFirst,
  ExpirationPlugin,
  type PrecacheEntry,
  type SerwistGlobalConfig,
} from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: Array<PrecacheEntry | string> | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  // Disable precaching - it blocks SW activation
  // Runtime caching still works for dynamic content
  precacheEntries: [],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Cache page navigations
    {
      // Admin pages and API responses hold private data and must not be cached across logout
      matcher: ({request, sameOrigin, url}) => request.mode === 'navigate'
        && !(sameOrigin && (/^\/(?:admin|api)(?:\/|$)/.test(url.pathname))),
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

serwist.addEventListeners();
