
import * as Sentry from '@sentry/nextjs';
import type {Instrumentation} from 'next';

/**
 * Custom error handler that filters out NEXT_NOT_FOUND errors
 * These should result in 404 status codes, not be reported as errors
 */
export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
	// Don't report NEXT_NOT_FOUND errors to Sentry
	// These are expected 404 responses, not actual errors
	const errorObject = error as Error & {digest?: string};
	const digest = errorObject.digest ?? '';
	if (errorObject.message === 'NEXT_NOT_FOUND' || digest.startsWith('NEXT_NOT_FOUND')) {
		return;
	}

	// Report other errors to Sentry
	Sentry.captureRequestError(error, request, context);
};

export async function register() {
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		await import('./sentry.server.config');
	}

	if (process.env.NEXT_RUNTIME === 'edge') {
		await import('./sentry.edge.config');
	}
}
