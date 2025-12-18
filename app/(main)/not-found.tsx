import {NotFoundPage} from '@components/error-pages';

/**
 * 404 Not Found Page for Main Site Routes
 *
 * This page is shown when notFound() is called from any page in the (main) route group.
 * Having this file inside (main) ensures the 404 status code is properly set
 * before streaming begins, avoiding the issue where the layout starts streaming
 * with a 200 status before the page determines it should be a 404.
 */
export default function NotFound() {
	return <NotFoundPage />;
}
