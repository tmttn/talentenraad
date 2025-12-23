'use client';

import {
  useState, useCallback, useEffect, useRef,
} from 'react';

type ClapContentType = 'nieuws' | 'activiteit';

type ClapsState = {
  totalClaps: number;
  userClaps: number;
  maxClaps: number;
  isLoading: boolean;
  error: string | null;
};

type UseClapsResult = ClapsState & {
  addClap: () => void;
  canClap: boolean;
};

const DEBOUNCE_DELAY = 300;

export function useClaps(contentType: ClapContentType, contentId: string): UseClapsResult {
  const [state, setState] = useState<ClapsState>({
    totalClaps: 0,
    userClaps: 0,
    maxClaps: 50,
    isLoading: true,
    error: null,
  });

  const pendingClapsRef = useRef(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial clap counts
  useEffect(() => {
    async function fetchClaps() {
      try {
        const response = await fetch(`/api/claps?contentType=${contentType}&contentId=${contentId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch claps');
        }

        const data = await response.json() as {
          totalClaps: number;
          userClaps: number;
          maxClaps: number;
        };

        setState(prev => ({
          ...prev,
          totalClaps: data.totalClaps,
          userClaps: data.userClaps,
          maxClaps: data.maxClaps,
          isLoading: false,
        }));
      } catch (error) {
        console.error('Error fetching claps:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Kon claps niet ophalen',
        }));
      }
    }

    void fetchClaps();
  }, [contentType, contentId]);

  // Send pending claps to server
  const flushClaps = useCallback(async () => {
    const clapsToSend = pendingClapsRef.current;
    if (clapsToSend === 0) {
      return;
    }

    pendingClapsRef.current = 0;

    try {
      const response = await fetch('/api/claps', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          contentType,
          contentId,
          count: clapsToSend,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add claps');
      }

      const data = await response.json() as {
        totalClaps: number;
        userClaps: number;
        maxClaps: number;
        added: number;
      };

      setState(prev => ({
        ...prev,
        totalClaps: data.totalClaps,
        userClaps: data.userClaps,
        maxClaps: data.maxClaps,
      }));
    } catch (error) {
      console.error('Error adding claps:', error);
      // Rollback optimistic update
      setState(prev => ({
        ...prev,
        totalClaps: prev.totalClaps - clapsToSend,
        userClaps: prev.userClaps - clapsToSend,
      }));
    }
  }, [contentType, contentId]);

  // Add a clap with debouncing
  const addClap = useCallback(() => {
    if (state.userClaps >= state.maxClaps) {
      return;
    }

    // Optimistic update
    setState(prev => ({
      ...prev,
      totalClaps: prev.totalClaps + 1,
      userClaps: prev.userClaps + 1,
    }));

    pendingClapsRef.current += 1;

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      void flushClaps();
    }, DEBOUNCE_DELAY);
  }, [state.userClaps, state.maxClaps, flushClaps]);

  // Cleanup on unmount - flush any pending claps
  useEffect(() => () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (pendingClapsRef.current > 0) {
      void flushClaps();
    }
  }, [flushClaps]);

  return {
    ...state,
    addClap,
    canClap: state.userClaps < state.maxClaps,
  };
}
