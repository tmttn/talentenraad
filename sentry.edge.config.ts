// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
	dsn: 'https://835f4af2e856ff931e075fd0a14d3455@o4507423348293632.ingest.de.sentry.io/4507423348686928',

	// Adjust this value in production, or use tracesSampler for greater control
	tracesSampleRate: 1,

	// Setting this option to true will print useful information to the console while you're setting up Sentry.
	debug: false,

	// Ignore Next.js navigation errors - these are expected control flow, not real errors
	ignoreErrors: [
		'NEXT_NOT_FOUND',
		'NEXT_REDIRECT',
	],
});
