/**
 * Design Tokens
 *
 * This file provides TypeScript exports for design tokens.
 * Use these when you need token values in JavaScript (e.g., for inline styles or gradients).
 *
 * For Tailwind classes, use the token-based utilities directly:
 * - bg-brand-primary-500, text-brand-secondary-400, etc. (brand tokens)
 * - bg-primary, text-secondary, etc. (semantic tokens)
 */

// ============================================
// BRAND TOKENS - Semantic color shades
// ============================================

export const brandColors = {
	primary: {
		shade50: '#fdf2f8',
		shade100: '#fce7f3',
		shade500: '#ea247b',
		shade600: '#d91a6d',
		shade700: '#c4105f',
	},
	secondary: {
		shade400: '#afbd43',
		shade500: '#9aab2f',
	},
	accent: {
		shade400: '#fcb142',
		shade500: '#e9a33a',
	},
} as const;

// ============================================
// SEMANTIC TOKENS - Purpose-based mapping
// ============================================

export const semanticColors = {
	primary: brandColors.primary.shade500,
	primaryHover: brandColors.primary.shade700,
	secondary: brandColors.secondary.shade400,
	secondaryHover: brandColors.secondary.shade500,
	accent: brandColors.accent.shade400,
	accentHover: brandColors.accent.shade500,
	focus: brandColors.primary.shade500,
} as const;

// ============================================
// STATE TOKENS - Feedback colors
// ============================================

export const stateColors = {
	success: {
		shade50: '#f0fdf4',
		shade100: '#dcfce7',
		shade200: '#bbf7d0',
		shade600: '#16a34a',
		shade800: '#166534',
	},
	info: {
		shade100: '#dbeafe',
		shade400: '#60a5fa',
		shade500: '#3b82f6',
		shade600: '#2563eb',
		shade800: '#1e40af',
	},
	warning: {
		shade400: '#fbbf24',
		shade500: '#f59e0b',
	},
} as const;

// ============================================
// CATEGORY TOKENS - Content type badges
// ============================================

export const categoryColors = {
	event: {
		bg: '#fce7f3',
		text: '#9d174d',
	},
	calendar: {
		bg: '#dbeafe',
		text: '#1e40af',
	},
	activity: {
		bg: '#dcfce7',
		text: '#166534',
	},
	news: {
		bg: '#f3e8ff',
		text: '#6b21a8',
	},
} as const;

// ============================================
// GRADIENT PRESETS
// ============================================

export const gradients = {
	primary: `linear-gradient(135deg, ${brandColors.primary.shade500} 0%, ${brandColors.primary.shade700} 100%)`,
	hero: `linear-gradient(to bottom right, ${brandColors.primary.shade500}, ${brandColors.primary.shade700})`,
	rainbow: `linear-gradient(to bottom right, ${brandColors.primary.shade500}, ${brandColors.accent.shade400}, ${brandColors.secondary.shade400})`,
	brandPrimary: `linear-gradient(to bottom right, ${brandColors.primary.shade500}, ${brandColors.primary.shade600})`,
	brandSecondary: `linear-gradient(to bottom right, ${brandColors.secondary.shade400}, ${brandColors.secondary.shade500})`,
	brandAccent: `linear-gradient(to bottom right, ${brandColors.accent.shade400}, ${brandColors.accent.shade500})`,
} as const;

// ============================================
// COMPONENT STYLE PRESETS
// ============================================

export const componentStyles = {
	card: {
		default: {
			bg: 'bg-white',
			iconBg: 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white',
			title: 'text-gray-800',
			description: 'text-gray-600',
			link: 'text-primary',
		},
		primary: {
			bg: 'bg-gradient-to-br from-brand-primary-500 to-brand-primary-600',
			iconBg: 'bg-white/20 text-white',
			title: 'text-white',
			description: 'text-white/90',
			link: 'text-white hover:text-white/80',
		},
		secondary: {
			bg: 'bg-gradient-to-br from-brand-secondary-400 to-brand-secondary-500',
			iconBg: 'bg-white/20 text-white',
			title: 'text-white',
			description: 'text-white/90',
			link: 'text-white hover:text-white/80',
		},
		accent: {
			bg: 'bg-gradient-to-br from-brand-accent-400 to-brand-accent-500',
			iconBg: 'bg-white/20 text-white',
			title: 'text-white',
			description: 'text-white/90',
			link: 'text-white hover:text-white/80',
		},
		gradient: {
			bg: 'bg-gradient-to-br from-brand-primary-500 via-brand-accent-400 to-brand-secondary-400',
			iconBg: 'bg-white/20 text-white',
			title: 'text-white',
			description: 'text-white/90',
			link: 'text-white hover:text-white/80',
		},
	},
	button: {
		primary: 'bg-primary hover:bg-primary-hover text-white',
		secondary: 'bg-secondary hover:bg-secondary-hover text-white',
		accent: 'bg-accent hover:bg-accent-hover text-white',
		outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
	},
	link: {
		primary: 'text-primary hover:text-primary-hover',
		secondary: 'text-secondary hover:text-secondary-hover',
	},
} as const;

// ============================================
// TYPE EXPORTS
// ============================================

export type BrandColors = typeof brandColors;
export type SemanticColors = typeof semanticColors;
export type StateColors = typeof stateColors;
export type CategoryColors = typeof categoryColors;
export type Gradients = typeof gradients;
export type ComponentStyles = typeof componentStyles;
export type CardVariant = keyof typeof componentStyles.card;
export type ButtonVariant = keyof typeof componentStyles.button;
export type CategoryType = keyof typeof categoryColors;
