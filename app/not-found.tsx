import {Suspense} from 'react';
import {SiteFooterServer} from '@components/layout/site-footer-server';
import {SiteHeaderServer} from '@components/layout/site-header-server';
import {SiteHeaderSkeleton, SiteFooterSkeleton} from '@components/skeletons';
import {NotFoundPage} from '@components/error-pages';

/**
 * Global 404 Not Found Page
 *
 * This page is shown when:
 * - A route doesn't exist
 * - notFound() is called from a server component
 * - A page explicitly throws a not found error
 */
export default function NotFound() {
	return (
		<>
			<Suspense fallback={<SiteHeaderSkeleton />}>
				<SiteHeaderServer />
			</Suspense>
			<main className='flex-1'>
				<NotFoundPage />
			</main>
			<Suspense fallback={<SiteFooterSkeleton />}>
				<SiteFooterServer />
			</Suspense>
		</>
	);
}
