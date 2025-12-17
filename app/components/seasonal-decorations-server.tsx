import {eq} from 'drizzle-orm';
import {db, siteSettings, type SeasonalDecorationsConfig} from '@/lib/db';
import {SeasonalDecorations, defaultSeasonalConfig} from './seasonal-decorations';

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

export async function SeasonalDecorationsServer() {
	const config = await getSeasonalDecorationsConfig();

	return <SeasonalDecorations config={config} />;
}
