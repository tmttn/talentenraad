/**
 * Card Component Tokens
 *
 * Design tokens specific to card components.
 * Uses alias pattern to reference semantic tokens.
 */

import {semanticSpacing} from '../spacing';
import {semanticShadows} from '../shadows';
import {semanticRadius} from '../radius';
import {semanticTransitions} from '../transitions';

export const cardTokens = {
	/** Card padding by size */
	padding: {
		sm: semanticSpacing.component.sm,
		md: semanticSpacing.component.md,
		lg: semanticSpacing.component.lg,
	},
	/** Card border radius */
	radius: semanticRadius.card,
	/** Card shadows */
	shadow: semanticShadows.card,
	/** Card transition */
	transition: semanticTransitions.card,
	/** Gap between card elements */
	contentGap: semanticSpacing.stack.md,
	/** Header to content gap */
	headerGap: semanticSpacing.stack.sm,
} as const;

export type CardTokens = typeof cardTokens;
