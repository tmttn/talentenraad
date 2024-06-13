/* eslint-disable import/extensions */
import {env} from 'node:process';

export async function register() {
	if (env.NEXT_RUNTIME === 'nodejs') {
		await import('./sentry.server.config');
	}

	if (env.NEXT_RUNTIME === 'edge') {
		await import('./sentry.edge.config');
	}
}
