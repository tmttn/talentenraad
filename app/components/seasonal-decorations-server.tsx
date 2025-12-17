import {eq} from 'drizzle-orm';
import {db, siteSettings} from '@/lib/db';
import {SeasonalDecorationsProvider, type SeasonalDecorationsConfig} from './seasonal-decorations-context';
import {Snowfall, SeasonalStyles, defaultSeasonalConfig} from './seasonal-decorations';

const SEASONAL_DECORATIONS_KEY = 'seasonal_decorations';

export async function getSeasonalDecorationsConfig(): Promise<SeasonalDecorationsConfig> {
	try {
		const setting = await db.query.siteSettings.findFirst({
			where: eq(siteSettings.key, SEASONAL_DECORATIONS_KEY),
		});

		if (setting?.value) {
			return setting.value as SeasonalDecorationsConfig;
		}
	} catch {
		// Table might not exist yet, return default
	}

	return defaultSeasonalConfig;
}

/**
 * Server component that provides seasonal decorations context and renders global decorations.
 * - Wraps children with SeasonalDecorationsProvider for context
 * - Renders global decorations (Snowfall, styles)
 * - Individual decorations (ChristmasLights, Icicles) are rendered by their respective components
 */
export async function SeasonalDecorationsServer({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const config = await getSeasonalDecorationsConfig();

	return (
		<SeasonalDecorationsProvider config={config}>
			<SeasonalStyles />
			<Snowfall />
			{children}
		</SeasonalDecorationsProvider>
	);
}
