/**
 * Input Component Tokens
 *
 * Design tokens specific to form input components.
 * Uses alias pattern to reference semantic tokens.
 */

import {semanticSpacing} from '../spacing';
import {semanticShadows} from '../shadows';
import {semanticRadius} from '../radius';
import {semanticTransitions} from '../transitions';

export const inputTokens = {
	/** Input padding by size */
	padding: {
		sm: {
			x: semanticSpacing.inline.sm,
			y: semanticSpacing.inline.xs,
		},
		md: {
			x: semanticSpacing.inline.md,
			y: semanticSpacing.inline.sm,
		},
		lg: {
			x: semanticSpacing.inline.lg,
			y: semanticSpacing.inline.md,
		},
	},
	/** Input border radius */
	radius: semanticRadius.input,
	/** Input focus shadow */
	focusShadow: semanticShadows.inputFocus,
	/** Input transition */
	transition: semanticTransitions.color,
	/** Icon spacing within input */
	iconGap: semanticSpacing.inline.sm,
	/** Label to input gap */
	labelGap: semanticSpacing.stack.xs,
	/** Input to error message gap */
	errorGap: semanticSpacing.stack.xs,
	/** Input to hint text gap */
	hintGap: semanticSpacing.stack.xs,
} as const;

export type InputTokens = typeof inputTokens;
