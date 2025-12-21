// eslint-disable-next-line unicorn/prefer-module
const withSerwist = require('@serwist/next').default({
	swSrc: 'app/sw.ts',
	swDest: 'public/sw.js',
	// eslint-disable-next-line n/prefer-global/process
	disable: process.env.NODE_ENV === 'development',
});
// eslint-disable-next-line unicorn/prefer-module
const {withSentryConfig} = require('@sentry/nextjs');
// eslint-disable-next-line unicorn/prefer-module
const packageJson = require('./package.json');

/** @type {import('next').NextConfig} */
// Note: Turbopack is disabled via TURBOPACK=0 in vercel.json for Serwist PWA compatibility
// https://github.com/serwist/serwist/issues/54
const nextConfig = {
	serverExternalPackages: ['isolated-vm'],
};

nextConfig.webpack = (webpackConfig, {webpack}) => {
	// eslint-disable-next-line @stylistic/function-paren-newline
	webpackConfig.plugins.push(
		// Remove node: from import specifiers, because Next.js does not yet support node: scheme
		// https://github.com/vercel/next.js/issues/28774
		new webpack.NormalModuleReplacementPlugin(
			/^node:/,
			resource => {
				resource.request = resource.request.replace(/^node:/, '');
			},
		),
	// eslint-disable-next-line @stylistic/function-paren-newline
	);

	return webpackConfig;
};

nextConfig.images = {
	remotePatterns: [
		{
			protocol: 'https',
			hostname: 'cdn.builder.io',
			port: '',
			pathname: '/api/v1/image/*',
		},
		{
			protocol: 'https',
			hostname: 'lh3.googleusercontent.com',
		},
		{
			protocol: 'https',
			hostname: 's.gravatar.com',
		},
		{
			protocol: 'https',
			hostname: 'cdn.auth0.com',
		},
	],
};

// Security headers
nextConfig.headers = async () => [
	{
		source: '/(.*)',
		headers: [
			{
				key: 'Content-Security-Policy',
				value: 'frame-ancestors \'self\' https://*.builder.io https://builder.io',
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

// eslint-disable-next-line unicorn/prefer-module
module.exports = withSerwist(withSentryConfig(
	nextConfig,
	{
		// For all available options, see:
		// https://github.com/getsentry/sentry-webpack-plugin#options

		org: 'tom-metten',
		project: 'talentenraad',

		// Only print logs for uploading source maps in CI
		// eslint-disable-next-line n/prefer-global/process
		silent: !process.env.CI,

		// For all available options, see:
		// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

		// Upload a larger set of source maps for prettier stack traces (increases build time)
		widenClientFileUpload: true,

		// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
		// This can increase your server load as well as your hosting bill.
		// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
		// side errors will fail.
		tunnelRoute: '/monitoring',

		// Hides source maps from generated client bundles
		hideSourceMaps: true,

		// Webpack-specific options
		webpack: {
			// Automatically tree-shake Sentry logger statements to reduce bundle size
			treeshake: {
				removeDebugLogging: true,
			},
			// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
			// See the following for more information:
			// https://docs.sentry.io/product/crons/
			// https://vercel.com/docs/cron-jobs
			automaticVercelMonitors: true,
		},
	},
));
