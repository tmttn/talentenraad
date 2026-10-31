import {content} from '@lib/content';
import {SeasonalDecorationsProvider, type SeasonalDecorationsConfig} from './seasonal-decorations-context';
import {Snowfall, SeasonalStyles, defaultSeasonalConfig} from './seasonal-decorations';

export async function getSeasonalDecorationsConfig(): Promise<SeasonalDecorationsConfig> {
  try {
    const site = await content.getSite();
    return site.decoraties;
  } catch {
    // Fall back to defaults if content/site.yaml cannot be read
    return defaultSeasonalConfig;
  }
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
