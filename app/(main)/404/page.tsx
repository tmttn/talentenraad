import type {Metadata} from 'next';
import {NotFoundPage} from '@components/error-pages';

export const metadata: Metadata = {
	title: 'Pagina niet gevonden',
};

/**
 * Explicit 404 Page Route
 *
 * This route is used by middleware to redirect to when content is not found.
 * It renders the not-found page content and allows middleware to set the
 * 404 status code via rewrite.
 */
export default function NotFoundRoute() {
	return <NotFoundPage />;
}
