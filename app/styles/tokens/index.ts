/**
 * Design Tokens - Main Export
 *
 * This barrel file exports all design tokens for easy importing.
 *
 * Usage:
 * import { spacing, shadows, brandColors } from '@/app/styles/tokens'
 * import { semanticSpacing, semanticShadows } from '@/app/styles/tokens'
 */

/* eslint-disable import-x/extensions */

// Colors
export {
	brandColors,
	semanticColors,
	stateColors,
	categoryColors,
	gradients,
	componentStyles,
	type BrandColors,
	type SemanticColors,
	type StateColors,
	type CategoryColors,
	type Gradients,
	type ComponentStyles,
	type CardVariant,
	type ButtonVariant,
	type CategoryType,
} from './colors';

// Spacing
export {
	spacing,
	semanticSpacing,
	containerSizes,
	type Spacing,
	type SemanticSpacing,
	type ContainerSize,
} from './spacing';

// Shadows
export {
	shadows,
	semanticShadows,
	type Shadows,
	type SemanticShadows,
	type ShadowLevel,
} from './shadows';

// Border Radius
export {
	radius,
	semanticRadius,
	type Radius,
	type SemanticRadius,
	type RadiusSize,
} from './radius';

// Transitions
export {
	durations,
	easings,
	transitionPresets,
	semanticTransitions,
	transitionProperties,
	type Durations,
	type Easings,
	type TransitionPresets,
	type SemanticTransitions,
} from './transitions';

// Re-export component tokens when they exist
export * from './components/index';
