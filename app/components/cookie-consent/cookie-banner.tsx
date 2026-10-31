'use client';

import Link from 'next/link';
import {Cookie} from 'lucide-react';
import {useCookieConsent} from './cookie-consent-context';

export function CookieBanner() {
  const recaptchaEnabled = Boolean(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);
  const {showBanner, dismiss} = useCookieConsent();

  if (!showBanner) {
    return null;
  }

  return (
    <div className='fixed inset-x-0 bottom-0 z-50 p-4' role='dialog' aria-labelledby='cookie-banner-title'>
      {/* Banner - uses rounded-modal, shadow-overlay, p-component-md tokens */}
      <div className='mx-auto max-w-4xl bg-white rounded-modal shadow-overlay border border-gray-200 overflow-hidden'>
        <div className='p-component-md'>
          <div className='flex flex-col md:flex-row md:items-center gap-4'>
            {/* Cookie icon and text */}
            <div className='flex-1'>
              <div className='flex items-start gap-3'>
                <div className='p-2 bg-primary/10 rounded-full flex-shrink-0'>
                  <Cookie className='w-5 h-5 text-primary' />
                </div>
                <div>
                  <h2 id='cookie-banner-title' className='font-bold text-gray-800'>
                    Cookies en opslag
                  </h2>
                  <p className='text-gray-600 text-sm mt-1'>
                    Deze website gebruikt alleen strikt noodzakelijke opslag, geen analyse of advertenties.
                    {recaptchaEnabled && ' Op de formulieren gebruiken we Google reCAPTCHA tegen spam.'}
                    {' '}
                    <Link href='/cookiebeleid' className='text-primary hover:underline'>
                      Lees ons cookiebeleid
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Button */}
            <div className='flex'>
              <button
                type='button'
                onClick={dismiss}
                className='py-2.5 px-5 bg-primary text-white font-medium rounded-card hover:bg-primary-hover transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-sm'
              >
                Begrepen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
