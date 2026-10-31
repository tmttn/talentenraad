'use client';

import {useEffect} from 'react';
import {AdminErrorPage} from '@components/error-pages';

type ErrorProperties = {
  error: Error & {digest?: string};
  reset: () => void;
};

/**
 * Error Boundary for Admin Protected Routes
 *
 * Catches runtime errors in the admin section and displays
 * a compact error page with retry option.
 */
export default function AdminError({error, reset}: Readonly<ErrorProperties>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <AdminErrorPage
      code='500'
      title='Er ging iets mis'
      description='Er is een onverwachte fout opgetreden. Probeer het opnieuw of ga terug naar het dashboard.'
      showRetry
      onRetry={reset}
    />
  );
}
