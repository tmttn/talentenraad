'use client';

import {createContext, useContext, type ReactNode} from 'react';

// Type defined here to avoid importing from server-only @/lib/db in client component
export type SeasonalDecorationsConfig = {
	enabled: boolean;
	season: 'christmas' | 'easter' | 'halloween' | 'none';
	decorations: {
		christmasLights: boolean;
		snowfall: boolean;
		icicles: boolean;
		gingerbreadMan: boolean;
		christmasBalls: boolean;
	};
};

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
