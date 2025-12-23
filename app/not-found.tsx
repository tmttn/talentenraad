import {NotFoundPage} from '@components/error-pages';

/**
 * Global 404 Not Found Page
 *
 * This page is shown when:
 * - A route doesn't exist
 * - notFound() is called from a server component
 * - A page explicitly throws a not found error
 *
 * Note: This page intentionally doesn't include header/footer to avoid
 * potential errors from async data fetching that could convert a 404 into a 500.
 */
export default function NotFound() {
  return (
    <div className='min-h-screen flex flex-col'>
      <main className='flex-1'>
        <NotFoundPage />
      </main>
    </div>
  );
}
