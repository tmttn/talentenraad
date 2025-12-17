'use client';

import {createContext, useContext, type ReactNode} from 'react';
import {defaultSeasonalConfig, type SeasonalDecorationsConfig} from '@/lib/types';

export type {SeasonalDecorationsConfig} from '@/lib/types';

const SeasonalDecorationsContext = createContext<SeasonalDecorationsConfig>(defaultSeasonalConfig);

export function SeasonalDecorationsProvider({
	config,
	children,
}: Readonly<{
	config: SeasonalDecorationsConfig;
	children: ReactNode;
}>) {
	return (
		<SeasonalDecorationsContext.Provider value={config}>
			{children}
		</SeasonalDecorationsContext.Provider>
	);
}

export function useSeasonalDecorations() {
	return useContext(SeasonalDecorationsContext);
}
