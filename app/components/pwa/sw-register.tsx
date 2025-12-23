'use client';

import {useEffect} from 'react';

export function SwRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/serwist/sw.js', {scope: '/'}).catch(error => {
        console.error('Service worker registration failed:', error);
      });
    }
  }, []);

  return null;
}
