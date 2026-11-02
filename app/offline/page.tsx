'use client';

import Link from 'next/link';
import {Home, RefreshCw} from 'lucide-react';
import {SpeechBubble} from '@components/ui';
import {ctaButtonClassName} from '@components/ui/cta-button';
import {LogoCircles} from '@components/layout/contour-parts';

/** Shown by the service worker when a page is not cached and there is no connection. */
export default function OfflinePage() {
  return (
    <main className='min-h-screen bg-white px-3 py-10 sm:px-6'>
      <div className='max-w-[1000px] mx-auto'>
        <LogoCircles className='h-[clamp(180px,26vw,320px)]' />
        <SpeechBubble className='-mt-[clamp(48px,7vw,110px)] mx-2 sm:mx-[clamp(8px,3vw,40px)] max-w-[640px]'>
          <div className='flex flex-col items-start gap-[18px]'>
            <h1 className='font-display font-extrabold text-black text-[clamp(38px,4.6vw,58px)] leading-none tracking-[-0.02em]'>Je bent offline</h1>
            <p className='text-gray-700 text-[clamp(17px,1.4vw,19px)] leading-relaxed'>
              Het lijkt erop dat je geen internetverbinding hebt. Controleer je verbinding en probeer het opnieuw.
            </p>
            <div className='flex flex-wrap gap-3.5 pt-1'>
              <button
                type='button'
                onClick={() => {
                  globalThis.location.reload();
                }}
                className={`${ctaButtonClassName('contour')} gap-2`}
              >
                <RefreshCw className='h-5 w-5' aria-hidden='true' />
                Probeer opnieuw
              </button>
              <Link href='/' className={`${ctaButtonClassName('contour-outline')} gap-2`}>
                <Home className='h-5 w-5' aria-hidden='true' />
                Naar home
              </Link>
            </div>
            <p className='text-sm text-gray-600'>Sommige pagina&apos;s die je eerder bezocht, zijn mogelijk nog beschikbaar.</p>
          </div>
        </SpeechBubble>
      </div>
    </main>
  );
}
