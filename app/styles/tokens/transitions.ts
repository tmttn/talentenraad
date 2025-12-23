/**
 * Transition Design Tokens
 *
 * Provides consistent animation timing values.
 * Use presets for common transition patterns.
 */

// ============================================
// DURATION SCALE
// ============================================

export const durations = {
  instant: '0ms',
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slower: '500ms',
  slowest: '700ms',
} as const;

// ============================================
// EASING FUNCTIONS
// ============================================

export const easings = {
  /** Default easing for most transitions */
  default: 'ease',
  /** Linear, no acceleration */
  linear: 'linear',
  /** Accelerate from zero velocity */
  in: 'ease-in',
  /** Decelerate to zero velocity */
  out: 'ease-out',
  /** Accelerate then decelerate */
  inOut: 'ease-in-out',
  /** Custom smooth easing */
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /** Bouncy entrance */
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

// ============================================
// TRANSITION PRESETS
// ============================================

export const transitionPresets = {
  /** Fast transitions for micro-interactions */
  fast: `${durations.fast} ${easings.default}`,
  /** Base transitions for most UI elements */
  base: `${durations.base} ${easings.default}`,
  /** Slow transitions for larger movements */
  slow: `${durations.slow} ${easings.default}`,
  /** Smooth transitions with custom easing */
  smooth: `${durations.base} ${easings.smooth}`,
  /** Bouncy transitions for playful elements */
  bounce: `${durations.slow} ${easings.bounce}`,
} as const;

// ============================================
// SEMANTIC TRANSITIONS - Component-specific
// ============================================

export const semanticTransitions = {
  /** Button hover/active transitions */
  button: transitionPresets.fast,
  /** Card hover transitions */
  card: transitionPresets.base,
  /** Modal open/close transitions */
  modal: transitionPresets.slow,
  /** Dropdown open/close transitions */
  dropdown: transitionPresets.fast,
  /** Tab switching transitions */
  tab: transitionPresets.fast,
  /** Accordion expand/collapse */
  accordion: transitionPresets.base,
  /** Color/background transitions */
  color: transitionPresets.fast,
  /** Transform transitions */
  transform: transitionPresets.base,
  /** Opacity transitions */
  opacity: transitionPresets.fast,
} as const;

// ============================================
// CSS TRANSITION PROPERTIES
// ============================================

export const transitionProperties = {
  all: 'all',
  colors: 'color, background-color, border-color, text-decoration-color, fill, stroke',
  opacity: 'opacity',
  shadow: 'box-shadow',
  transform: 'transform',
  dimensions: 'width, height',
} as const;

// ============================================
// TYPE EXPORTS
// ============================================

export type Durations = typeof durations;
export type Easings = typeof easings;
export type TransitionPresets = typeof transitionPresets;
export type SemanticTransitions = typeof semanticTransitions;
