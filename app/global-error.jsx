'use client';

import * as Sentry from '@sentry/nextjs';
import {useEffect} from 'react';
import PropTypes from 'prop-types';

GlobalError.propTypes = {
	error: PropTypes.string.isRequired,
};

export default function GlobalError({error}) {
	useEffect(() => {
		Sentry.captureException(error);
	}, [error]);

	return (
		<html lang='nl'>
			<body>
				<Error />
			</body>
		</html>
	);
}
