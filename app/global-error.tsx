'use client';

import {useEffect} from 'react';
import {Home, RefreshCw} from 'lucide-react';
import {SpeechBubble} from '@components/ui';
import {ctaButtonClassName} from '@components/ui/cta-button';
import {LogoCircles} from '@components/layout/contour-parts';
// This boundary replaces the root layout, so it brings the stylesheet itself
import './globals.css';

type GlobalErrorProperties = {
  error: Error & {digest?: string};
  reset: () => void;
};

/**
 * Global Error Boundary
 *
 * This catches errors at the root level, including errors in layouts.
 * Since it replaces the root layout, it must include <html> and <body> tags,
 * and it uses plain links: a full reload is the point when the layout itself broke.
 */
export default function GlobalError({error, reset}: Readonly<GlobalErrorProperties>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang='nl'>
      <body className='min-h-screen bg-white px-3 py-10 sm:px-6'>
        <main className='max-w-[1000px] mx-auto'>
          <LogoCircles className='h-[clamp(180px,26vw,320px)]' />
          <SpeechBubble className='-mt-[clamp(48px,7vw,110px)] mx-2 sm:mx-[clamp(8px,3vw,40px)] max-w-[640px]'>
            <div className='flex flex-col items-start gap-[18px]'>
              <p className='rounded-full contour-xs bg-logo-orange px-3 py-0.5 text-sm font-bold text-black'>Foutcode 500</p>
              <h1 className='font-display font-extrabold text-black text-[clamp(38px,4.6vw,58px)] leading-none tracking-[-0.02em]'>Er ging iets mis</h1>
              <p className='text-gray-700 text-[clamp(17px,1.4vw,19px)] leading-relaxed'>
                Sorry, er is een onverwachte fout opgetreden. Probeer het zo opnieuw; we werken eraan.
              </p>
              <div className='flex flex-wrap gap-3.5 pt-1'>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- root layout is stuk; volle reload is de bedoeling */}
                <a href='/' className={`${ctaButtonClassName('contour')} gap-2`}>
                  <Home className='h-5 w-5' aria-hidden='true' />
                  Naar home
                </a>
                <button type='button' onClick={reset} className={`${ctaButtonClassName('contour-outline')} gap-2`}>
                  <RefreshCw className='h-5 w-5' aria-hidden='true' />
                  Probeer opnieuw
                </button>
              </div>
              <p className='text-sm text-gray-600'>
                Blijft dit probleem? Neem dan{' '}
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- root layout is stuk; volle reload is de bedoeling */}
                <a href='/contact' className='font-bold text-primary-text underline underline-offset-2'>contact</a>{' '}
                met ons op.
              </p>
            </div>
          </SpeechBubble>
        </main>
      </body>
    </html>
  );
}
