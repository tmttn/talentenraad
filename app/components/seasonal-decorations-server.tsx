import {eq} from 'drizzle-orm';
import {db, siteSettings} from '@/lib/db';
import {SeasonalDecorationsProvider, type SeasonalDecorationsConfig} from './seasonal-decorations-context';
import {Snowfall, SeasonalStyles, defaultSeasonalConfig} from './seasonal-decorations';

const SEASONAL_DECORATIONS_KEY = 'seasonal_decorations';

export async function getSeasonalDecorationsConfig(): Promise<SeasonalDecorationsConfig> {
	try {
		// Check if db.query.siteSettings exists before querying
		if (!db.query?.siteSettings) {
			console.warn('siteSettings query not available, using default config');
			return defaultSeasonalConfig;
		}

		const setting = await db.query.siteSettings.findFirst({
			where: eq(siteSettings.key, SEASONAL_DECORATIONS_KEY),
		});

		if (setting?.value) {
			// Validate the structure before returning
			const value = setting.value as SeasonalDecorationsConfig;
			if (typeof value.enabled === 'boolean' && value.decorations) {
				return value;
			}
		}
	} catch (error) {
		// Log the error in development for debugging
		console.error('Error fetching seasonal decorations config:', error);
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
