'use client';

import Link from 'next/link';
import {Home, RefreshCw} from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className='min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-gray-50 to-gray-100'>
      <div className='text-center max-w-xl'>
        {/* Offline illustration */}
        <div className='mb-8'>
          <OfflineIllustration />
        </div>

        {/* Title */}
        <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
          Je bent offline
        </h1>

        {/* Description */}
        <p className='text-gray-600 mb-8 text-lg leading-relaxed'>
          Het lijkt erop dat je geen internetverbinding hebt.
          Controleer je verbinding en probeer het opnieuw.
        </p>

        {/* Action buttons */}
        <div className='flex flex-wrap justify-center gap-3'>
          <button
            type='button'
            onClick={() => {
              globalThis.location.reload();
            }}
            className={`inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold
							rounded-full hover:bg-primary-hover transition-all hover:scale-105 focus:outline-none
							focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-elevated shadow-primary/25`}
          >
            <RefreshCw className='w-5 h-5' />
            Probeer opnieuw
          </button>

          <Link
            href='/'
            className={`inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold
							rounded-full hover:bg-gray-50 transition-all hover:scale-105 focus:outline-none
							focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 border border-gray-200 shadow-subtle`}
          >
            <Home className='w-5 h-5' />
            Naar home
          </Link>
        </div>

        {/* Help text */}
        <p className='mt-10 text-sm text-gray-500'>
          Sommige pagina&apos;s die je eerder hebt bezocht zijn mogelijk nog beschikbaar.
        </p>
      </div>
    </div>
  );
}

function OfflineIllustration() {
  return (
    <svg viewBox='0 0 400 300' className='w-full max-w-md mx-auto' aria-hidden='true'>
      <defs>
        <linearGradient id='offlineBg' x1='0%' y1='0%' x2='0%' y2='100%'>
          <stop offset='0%' stopColor='#f3f4f6' />
          <stop offset='100%' stopColor='#e5e7eb' />
        </linearGradient>
      </defs>
      <rect width='400' height='300' fill='url(#offlineBg)' rx='16' />

      {/* Disconnected WiFi symbol */}
      <g transform='translate(200, 100)'>
        {/* WiFi arcs - grayed out */}
        <path
          d='M-60 20 Q0 -40 60 20'
          stroke='#9ca3af'
          strokeWidth='8'
          fill='none'
          strokeLinecap='round'
          opacity='0.3'
        />
        <path
          d='M-40 35 Q0 -10 40 35'
          stroke='#9ca3af'
          strokeWidth='8'
          fill='none'
          strokeLinecap='round'
          opacity='0.4'
        />
        <path
          d='M-20 50 Q0 25 20 50'
          stroke='#9ca3af'
          strokeWidth='8'
          fill='none'
          strokeLinecap='round'
          opacity='0.5'
        />

        {/* WiFi dot */}
        <circle cx='0' cy='65' r='10' fill='#9ca3af' />

        {/* Red X over WiFi */}
        <g stroke='#ef4444' strokeWidth='6' strokeLinecap='round'>
          <line x1='-35' y1='-15' x2='35' y2='55' />
          <line x1='35' y1='-15' x2='-35' y2='55' />
        </g>
      </g>

      {/* Sad device */}
      <g transform='translate(200, 220)'>
        {/* Phone body */}
        <rect x='-40' y='-30' width='80' height='60' fill='#374151' rx='8' />
        <rect x='-35' y='-25' width='70' height='45' fill='#1f2937' rx='4' />

        {/* Sad face on screen */}
        <circle cx='-12' cy='-8' r='4' fill='#9ca3af' />
        <circle cx='12' cy='-8' r='4' fill='#9ca3af' />
        <path d='M-15 10 Q0 0 15 10' stroke='#9ca3af' strokeWidth='3' fill='none' />

        {/* Disconnection lines */}
        <g className='animate-pulse'>
          <line x1='50' y1='-20' x2='70' y2='-30' stroke='#9ca3af' strokeWidth='2' strokeDasharray='4 4' />
          <line x1='55' y1='0' x2='75' y2='0' stroke='#9ca3af' strokeWidth='2' strokeDasharray='4 4' />
          <line x1='50' y1='20' x2='70' y2='30' stroke='#9ca3af' strokeWidth='2' strokeDasharray='4 4' />
        </g>
      </g>

      {/* Floating question marks */}
      <text
        x='100'
        y='80'
        fill='#9ca3af'
        fontSize='24'
        fontWeight='bold'
        className='animate-bounce'
      >
        ?
      </text>
      <text
        x='300'
        y='100'
        fill='#9ca3af'
        fontSize='20'
        fontWeight='bold'
        className='animate-bounce'
        style={{animationDelay: '0.5s'}}
      >
        ?
      </text>
    </svg>
  );
}
