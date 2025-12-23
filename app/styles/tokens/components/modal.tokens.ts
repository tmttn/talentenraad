/**
 * Modal Component Tokens
 *
 * Design tokens specific to modal/dialog components.
 * Uses alias pattern to reference semantic tokens.
 */

import {semanticSpacing, containerSizes} from '../spacing';
import {semanticShadows} from '../shadows';
import {semanticRadius} from '../radius';
import {semanticTransitions} from '../transitions';

export const modalTokens = {
  /** Modal padding */
  padding: {
    sm: semanticSpacing.component.md,
    md: semanticSpacing.component.lg,
    lg: semanticSpacing.section.sm,
  },
  /** Modal border radius */
  radius: semanticRadius.modal,
  /** Modal shadow */
  shadow: semanticShadows.modal,
  /** Modal transition */
  transition: semanticTransitions.modal,
  /** Modal max-width by size */
  maxWidth: {
    sm: containerSizes.sm,
    md: containerSizes.md,
    lg: containerSizes.lg,
  },
  /** Header to content gap */
  headerGap: semanticSpacing.stack.md,
  /** Content to footer gap */
  footerGap: semanticSpacing.stack.lg,
  /** Overlay background opacity */
  overlayOpacity: '0.5',
} as const;

export type ModalTokens = typeof modalTokens;
