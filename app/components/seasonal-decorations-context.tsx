'use client';

import {createContext, useContext, type ReactNode} from 'react';
import type {SeasonalDecorationsConfig} from '@/lib/db';

export type {SeasonalDecorationsConfig};

const defaultConfig: SeasonalDecorationsConfig = {
	enabled: false,
	season: 'none',
	decorations: {
		christmasLights: false,
		snowfall: false,
		icicles: false,
		gingerbreadMan: false,
		christmasBalls: false,
	},
};

const SeasonalDecorationsContext = createContext<SeasonalDecorationsConfig>(defaultConfig);

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
