'use client';

import {createContext, useContext, type ReactNode} from 'react';
import type {FlagValues} from '@generated/hypertune/hypertune';
import {flagFallbacks} from './flag-defaults';

// Context for feature flags
const FlagsContext = createContext<FlagValues>(flagFallbacks);

type FlagsProviderProps = {
	flags: FlagValues;
	children: ReactNode;
};

/**
 * Provider for feature flags in client components
 *
 * Usage in layout.tsx:
 *   import { FlagsProvider } from '@lib/flags-client';
 *   import { getAllFlags } from '@lib/flags';
 *
 *   export default async function Layout({ children }) {
 *     const flags = await getAllFlags();
 *     return <FlagsProvider flags={flags}>{children}</FlagsProvider>;
 *   }
 */
export function FlagsProvider({flags, children}: FlagsProviderProps) {
	return <FlagsContext.Provider value={flags}>{children}</FlagsContext.Provider>;
}

/**
 * Hook to access feature flags in client components
 *
 * Usage:
 *   const flags = useFlags();
 *   if (flags.pushNotifications) { ... }
 */
export function useFlags(): FlagValues {
	return useContext(FlagsContext);
}

/**
 * Hook to access a single feature flag
 *
 * Usage:
 *   const isPushEnabled = useFlag('pushNotifications');
 */
export function useFlag<K extends keyof FlagValues>(key: K): FlagValues[K] {
	const flags = useContext(FlagsContext);
	return flags[key];
}
