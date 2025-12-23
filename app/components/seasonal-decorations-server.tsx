import {eq} from 'drizzle-orm';
import {db, siteSettings} from '@lib/db';
import {SeasonalDecorationsProvider, type SeasonalDecorationsConfig} from './seasonal-decorations-context';
import {Snowfall, SeasonalStyles, defaultSeasonalConfig} from './seasonal-decorations';

const SEASONAL_DECORATIONS_KEY = 'seasonal_decorations';

// Check if we're in build/static generation phase (no DB access)
// eslint-disable-next-line n/prefer-global/process
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

export async function getSeasonalDecorationsConfig(): Promise<SeasonalDecorationsConfig> {
	// Skip database calls during build - return defaults
	if (isBuildPhase) {
		return defaultSeasonalConfig;
	}

	try {
		// Check if db.query.siteSettings exists before querying
		if (!db.query?.siteSettings) {
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
	} catch {
		// Silently fail during runtime - will use defaults
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
