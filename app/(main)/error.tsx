'use client';

import {useEffect} from 'react';
import * as Sentry from '@sentry/nextjs';
import {ServerErrorPage} from '@components/error-pages';

type ErrorProperties = {
	error: Error & {digest?: string};
	reset: () => void;
};

/**
 * Error Boundary for Main Site Routes
 *
 * Catches runtime errors in the main site section and displays
 * a user-friendly error page with retry option.
 */
export default function Error({error, reset}: Readonly<ErrorProperties>) {
	useEffect(() => {
		// Log error to Sentry
		Sentry.captureException(error);
	}, [error]);

	return <ServerErrorPage reset={reset} />;
}
