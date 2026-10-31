const packageJson = require('./package.json');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Esbuild-wasm is required for @serwist/turbopack
  serverExternalPackages: ['isolated-vm', 'esbuild-wasm'],
};

// Turbopack is the default bundler; an empty config acknowledges the webpack config below
nextConfig.turbopack = {};

nextConfig.webpack = (webpackConfig, {webpack}) => {
  webpackConfig.plugins.push(
    // Remove node: from import specifiers, because Next.js does not yet support node: scheme
    // https://github.com/vercel/next.js/issues/28774
    new webpack.NormalModuleReplacementPlugin(
      /^node:/,
      resource => {
        resource.request = resource.request.replace(/^node:/, '');
      },
    ),
  );

  return webpackConfig;
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

// Expose version to client
nextConfig.env = {
  NEXT_PUBLIC_APP_VERSION: packageJson.version,
};

module.exports = nextConfig;
