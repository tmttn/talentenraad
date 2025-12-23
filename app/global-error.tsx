'use client';

import * as Sentry from '@sentry/nextjs';
import {useEffect} from 'react';
import {Home, RefreshCw, ServerCrash} from 'lucide-react';

type GlobalErrorProperties = {
  error: Error & {digest?: string};
  reset: () => void;
};

/**
 * Global Error Boundary
 *
 * This catches errors at the root level, including errors in layouts.
 * Since it replaces the root layout, it must include <html> and <body> tags.
 */
export default function GlobalError({error, reset}: Readonly<GlobalErrorProperties>) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang='nl'>
      <body className='min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4'>
        <div className='text-center max-w-lg'>
          {/* Icon */}
          <div className='mb-6 flex justify-center'>
            <div className='p-4 rounded-full bg-red-100 text-red-500'>
              <ServerCrash className='w-16 h-16' strokeWidth={1.5} />
            </div>
          </div>

          {/* Error code */}
          <p className='text-8xl font-bold text-gray-200 mb-2'>500</p>

          {/* Title */}
          <h1 className='text-2xl md:text-3xl font-bold text-gray-900 mb-4'>
            Er ging iets mis
          </h1>

          {/* Description */}
          <p className='text-gray-600 mb-8 text-lg'>
            Sorry, er is een onverwachte fout opgetreden. We werken eraan om dit op te lossen.
          </p>

          {/* Action buttons */}
          <div className='flex flex-wrap justify-center gap-3'>
            <a
              href='/'
              className='inline-flex items-center gap-2 px-6 py-3 bg-pink-600 text-white font-semibold rounded-button hover:bg-pink-700 transition-colors'
            >
              <Home className='w-5 h-5' />
              Naar homepagina
            </a>

            <button
              type='button'
              onClick={reset}
              className='inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-button hover:bg-gray-200 transition-colors'
            >
              <RefreshCw className='w-5 h-5' />
              Probeer opnieuw
            </button>
          </div>

          {/* Help text */}
          <p className='mt-8 text-sm text-gray-500'>
            Blijft dit probleem? Neem dan{' '}
            <a href='/contact' className='text-pink-600 hover:underline font-medium'>
              contact
            </a>{' '}
            met ons op.
          </p>
        </div>
      </body>
    </html>
  );
}
