/**
 * Border Radius Design Tokens
 *
 * Provides consistent border radius values.
 * Use semantic radius for component-specific needs.
 */

// ============================================
// RADIUS SCALE
// ============================================

export const radius = {
  none: '0',
  sm: '0.125rem', // 2px
  base: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  xxl: '1rem', // 16px
  xxxl: '1.5rem', // 24px
  full: '9999px',
} as const;

// ============================================
// SEMANTIC RADIUS - Component-specific
// ============================================

export const semanticRadius = {
  /** Button border radius */
  button: radius.lg,
  /** Card border radius */
  card: radius.xl,
  /** Input/form field border radius */
  input: radius.md,
  /** Badge/pill border radius */
  badge: radius.full,
  /** Modal/dialog border radius */
  modal: radius.xxl,
  /** Tooltip border radius */
  tooltip: radius.md,
  /** Avatar border radius */
  avatar: radius.full,
  /** Dropdown menu border radius */
  dropdown: radius.lg,
  /** Tab border radius */
  tab: radius.md,
} as const;

// ============================================
// TYPE EXPORTS
// ============================================

export type Radius = typeof radius;
export type SemanticRadius = typeof semanticRadius;
export type RadiusSize = keyof typeof radius;
