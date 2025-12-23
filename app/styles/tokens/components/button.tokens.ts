/**
 * Button Component Tokens
 *
 * Design tokens specific to button components.
 * Uses alias pattern to reference semantic tokens.
 */

import {semanticSpacing} from '../spacing';
import {semanticShadows} from '../shadows';
import {semanticRadius} from '../radius';
import {semanticTransitions} from '../transitions';

export const buttonTokens = {
  /** Button padding by size */
  padding: {
    sm: {
      x: semanticSpacing.inline.md,
      y: semanticSpacing.inline.xs,
    },
    md: {
      x: semanticSpacing.inline.lg,
      y: semanticSpacing.inline.sm,
    },
    lg: {
      x: semanticSpacing.component.sm,
      y: semanticSpacing.inline.md,
    },
  },
  /** Button border radius */
  radius: semanticRadius.button,
  /** Button shadows */
  shadow: semanticShadows.button,
  /** Button transition */
  transition: semanticTransitions.button,
  /** Icon spacing within button */
  iconGap: semanticSpacing.inline.sm,
} as const;

export type ButtonTokens = typeof buttonTokens;
