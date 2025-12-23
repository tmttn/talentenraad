'use client';

import {useEffect, useCallback, useRef} from 'react';
import {useRouter, usePathname} from 'next/navigation';

const SESSION_CHECK_INTERVAL = 60_000; // Check every minute
const SESSION_CHECK_ON_FOCUS = true;

export function SessionValidator() {
  const router = useRouter();
  const pathname = usePathname();
  const lastCheckRef = useRef<number>(Date.now());

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/session', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        // Session expired, redirect to login
        window.location.href = `/admin/login?returnTo=${encodeURIComponent(pathname)}`;
      }

      lastCheckRef.current = Date.now();
    } catch {
      // Network error, don't redirect - let user retry
      console.error('Session check failed');
    }
  }, [pathname]);

  // Check session on mount and periodically
  useEffect(() => {
    // Initial check
    void checkSession();

    // Set up interval
    const interval = setInterval(() => {
      void checkSession();
    }, SESSION_CHECK_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [checkSession]);

  // Check session when tab becomes visible
  useEffect(() => {
    if (!SESSION_CHECK_ON_FOCUS) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Only check if it's been more than 10 seconds since last check
        const timeSinceLastCheck = Date.now() - lastCheckRef.current;
        if (timeSinceLastCheck > 10_000) {
          void checkSession();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkSession]);

  // Check session on route change
  useEffect(() => {
    void checkSession();
  }, [pathname, checkSession]);

  // Intercept fetch to handle 401 responses globally
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      // Check if it's an admin API request that returned 401
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
      if (url.startsWith('/api/admin') && response.status === 401) {
        // Session expired, redirect to login
        window.location.href = `/admin/login?returnTo=${encodeURIComponent(pathname)}`;
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [pathname, router]);

  return null;
}
