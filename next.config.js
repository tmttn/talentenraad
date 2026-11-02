const path = require('node:path');
const packageJson = require('./package.json');
const {contentRedirects} = require('./scripts/content-redirects.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Esbuild-wasm is required for @serwist/turbopack
  serverExternalPackages: ['isolated-vm', 'esbuild-wasm', 'better-sqlite3'],
  // Photos of up to 10 MB go through a server action; the default limit is 1 MB (proxy: 10 MB).
  experimental: {
    serverActions: {bodySizeLimit: '11mb'},
    proxyClientMaxBodySize: '11mb',
  },
};

// Security headers
nextConfig.headers = async () => [
  {
    // Allow service worker to control root scope
    source: '/serwist/sw.js',
    headers: [
      {
        key: 'Service-Worker-Allowed',
        value: '/',
      },
    ],
  },
  {
    source: '/(.*)',
    headers: [
      {
        key: 'Content-Security-Policy',
        value: 'frame-ancestors \'self\'',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      },
    ],
  },
];

// Old addresses of activities and news (`aliassen` in content/) redirect permanently (308) to the current slug.
// Read at build time; the detail pages only render known slugs (dynamicParams = false).
nextConfig.redirects = async () => contentRedirects(path.join(__dirname, 'content'));

// Expose version to client
nextConfig.env = {
  NEXT_PUBLIC_APP_VERSION: packageJson.version,
};

module.exports = nextConfig;
