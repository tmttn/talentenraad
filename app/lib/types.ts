/**
 * Shared types that can be used by both client and server components
 */

/**
 * Configuration for seasonal decorations (Christmas, Easter, Halloween)
 */
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

/**
 * Default configuration for seasonal decorations (all disabled)
 */
export const defaultSeasonalConfig: SeasonalDecorationsConfig = {
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
