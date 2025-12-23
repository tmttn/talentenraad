'use client';

import {useState, useEffect, useCallback} from 'react';
import type {ViewMode} from './view-mode-toggle';

const LG_BREAKPOINT = 1024;

type UseViewModeReturn = {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isManualMode: boolean;
};

export function useViewMode(): UseViewModeReturn {
  const [manualMode, setManualMode] = useState<ViewMode | null>(null);
  const [isLargeScreen, setIsLargeScreen] = useState(true);

  useEffect(() => {
    // Check initial screen size
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= LG_BREAKPOINT);
    };

    checkScreenSize();

    // Listen for resize events
    const mediaQuery = window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`);
    const handleChange = (event: MediaQueryListEvent) => {
      setIsLargeScreen(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    setManualMode(mode);
  }, []);

  // If user manually selected a mode, use that; otherwise auto-switch based on screen size
  const viewMode: ViewMode = manualMode ?? (isLargeScreen ? 'table' : 'cards');

  return {
    viewMode,
    setViewMode,
    isManualMode: manualMode !== null,
  };
}
