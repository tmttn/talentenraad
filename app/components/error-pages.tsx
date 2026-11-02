'use client';

import Link from 'next/link';
import {ArrowLeft, Home, RefreshCw} from 'lucide-react';
import {SpeechBubble} from '@components/ui';
import {ctaButtonClassName} from '@components/ui/cta-button';
import {LogoCircles} from '@components/layout/contour-parts';

type ErrorPageProperties = {
  code: string;
  title: string;
  description: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  showRetryButton?: boolean;
  onRetry?: () => void;
};

/**
 * Error page in the contour style: the logo-color panel of the homepage with a speech bubble over it,
 * holding the code, a friendly title and the way back.
 */
export function ErrorPage({
  code,
  title,
  description,
  showHomeButton = true,
  showBackButton = true,
  showRetryButton = false,
  onRetry,
}: Readonly<ErrorPageProperties>) {
  return (
    <section className='px-3 sm:px-[clamp(12px,2vw,24px)] pt-6 pb-[clamp(64px,7vw,96px)]'>
      <div className='max-w-[1000px] mx-auto'>
        <LogoCircles className='h-[clamp(180px,26vw,320px)]' />
        <SpeechBubble className='-mt-[clamp(48px,7vw,110px)] mx-2 sm:mx-[clamp(8px,3vw,40px)] max-w-[640px]'>
          <div className='flex flex-col items-start gap-[18px]'>
            <p className='rounded-full contour-xs bg-logo-orange px-3 py-0.5 text-sm font-bold text-black'>Foutcode {code}</p>
            <h1 className='font-display font-extrabold text-black text-[clamp(38px,4.6vw,58px)] leading-none tracking-[-0.02em]'>{title}</h1>
            <p className='text-gray-700 text-[clamp(17px,1.4vw,19px)] leading-relaxed'>{description}</p>
            <div className='flex flex-wrap gap-3.5 pt-1'>
              {showHomeButton && (
                <Link href='/' className={`${ctaButtonClassName('contour')} gap-2`}>
                  <Home className='h-5 w-5' aria-hidden='true' />
                  Naar home
                </Link>
              )}
              {showRetryButton && onRetry && (
                <button type='button' onClick={onRetry} className={`${ctaButtonClassName('contour-outline')} gap-2`}>
                  <RefreshCw className='h-5 w-5' aria-hidden='true' />
                  Probeer opnieuw
                </button>
              )}
              {showBackButton && (
                <button
                  type='button'
                  onClick={() => {
                    window.history.back();
                  }}
                  className={`${ctaButtonClassName('contour-outline')} gap-2`}
                >
                  <ArrowLeft className='h-5 w-5' aria-hidden='true' />
                  Ga terug
                </button>
              )}
            </div>
            <p className='text-sm text-gray-600'>
              Blijft dit probleem?{' '}
              <Link href='/contact' className='font-bold text-primary-text underline underline-offset-2'>Laat het ons weten</Link>
              , dan helpen we je graag verder.
            </p>
          </div>
        </SpeechBubble>
      </div>
    </section>
  );
}

export function NotFoundPage() {
  return (
    <ErrorPage
      code='404'
      title='Oeps, verdwaald!'
      description='We hebben overal gezocht, maar deze pagina lijkt spoorloos verdwenen. Misschien vind je wat je zoekt via de kalender of het nieuws.'
    />
  );
}

type ServerErrorPageProperties = {
  reset?: () => void;
};

export function ServerErrorPage({reset}: Readonly<ServerErrorPageProperties>) {
  return (
    <ErrorPage
      code='500'
      title='Oeps, kortsluiting!'
      description='Er ging aan onze kant iets mis. Probeer het zo opnieuw; lukt het dan nog niet, laat het ons weten.'
      showRetryButton={Boolean(reset)}
      onRetry={reset}
    />
  );
}

// Admin-specific error pages with cleaner styling
type AdminErrorPageProperties = {
  code: string;
  title: string;
  description: string;
  showRetry?: boolean;
  onRetry?: () => void;
};

export function AdminErrorPage({
  code,
  title,
  description,
  showRetry = false,
  onRetry,
}: Readonly<AdminErrorPageProperties>) {
  return (
    <div className='flex items-center justify-center min-h-[50vh]'>
      <div className='text-center max-w-md'>
        <div className='mb-6 text-6xl'>
          {code === '500' ? '🤖' : code === '404' ? '🔍' : code === '403' ? '🔒' : '⚠️'}
        </div>
        <p className='text-sm font-mono text-gray-600 mb-2'>Fout {code}</p>
        <h1 className='text-xl font-bold text-gray-900 mb-2'>{title}</h1>
        <p className='text-gray-600 mb-6'>{description}</p>

        <div className='flex justify-center gap-3'>
          <Link
            href='/admin'
            className='inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-button hover:bg-primary-hover transition-colors'
          >
            <Home className='w-4 h-4' />
            Dashboard
          </Link>

          {showRetry && onRetry && (
            <button
              type='button'
              onClick={onRetry}
              className='inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-button hover:bg-gray-200 transition-colors'
            >
              <RefreshCw className='w-4 h-4' />
              Opnieuw
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
