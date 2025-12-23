/**
 * Shadow Design Tokens
 *
 * Provides consistent shadow/elevation values.
 * Use semantic names to indicate purpose/elevation level.
 */

// ============================================
// SHADOW SCALE
// ============================================

export const shadows = {
  /** No shadow */
  none: 'none',
  /** Subtle shadow for slight elevation */
  subtle: '0 1px 2px rgba(0, 0, 0, 0.05)',
  /** Base shadow for cards and containers */
  base: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  /** Elevated shadow for hover states and raised elements */
  elevated: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  /** Floating shadow for dropdowns and popovers */
  floating: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  /** High shadow for modals and dialogs */
  high: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  /** Overlay shadow for maximum elevation */
  overlay: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
} as const;

// ============================================
// SEMANTIC SHADOWS - Component-specific
// ============================================

export const semanticShadows = {
  /** Card shadow states */
  card: {
    default: shadows.base,
    hover: shadows.elevated,
    active: shadows.floating,
  },
  /** Button shadow states */
  button: {
    default: shadows.subtle,
    hover: shadows.base,
    active: shadows.none,
  },
  /** Dropdown/popover shadows */
  dropdown: shadows.floating,
  /** Modal/dialog shadows */
  modal: shadows.overlay,
  /** Toast notification shadows */
  toast: shadows.elevated,
  /** Input focus shadow (ring effect) */
  inputFocus: '0 0 0 3px rgba(212, 23, 105, 0.15)',
} as const;

// ============================================
// TYPE EXPORTS
// ============================================

export type Shadows = typeof shadows;
export type SemanticShadows = typeof semanticShadows;
export type ShadowLevel = keyof typeof shadows;
