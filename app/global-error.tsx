'use client';

import * as Sentry from '@sentry/nextjs';
import {useEffect} from 'react';

type GlobalErrorProperties = {
	error: Error & {digest?: string};
};

export default function GlobalError({error}: Readonly<GlobalErrorProperties>) {
	useEffect(() => {
		Sentry.captureException(error);
	}, [error]);

	return (
		<html lang='nl'>
			<body>
				<h1>Something went wrong</h1>
			</body>
		</html>
	);
}
