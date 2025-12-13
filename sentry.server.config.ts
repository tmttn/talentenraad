// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
	dsn: 'https://835f4af2e856ff931e075fd0a14d3455@o4507423348293632.ingest.de.sentry.io/4507423348686928',

	// Adjust this value in production, or use tracesSampler for greater control
	tracesSampleRate: 1,

	// Setting this option to true will print useful information to the console while you're setting up Sentry.
	debug: false,

	// Uncomment the line below to enable Spotlight (https://spotlightjs.com)
	// eslint-disable-next-line n/prefer-global/process
	spotlight: process.env.NODE_ENV === 'development',

});
