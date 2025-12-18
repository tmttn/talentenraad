/**
 * Spacing Design Tokens
 *
 * Provides consistent spacing values throughout the application.
 * Use semantic spacing for design intent, raw spacing for custom needs.
 */

// ============================================
// RAW SPACING SCALE
// ============================================

export const spacing = {
	px: '1px',
	s0: '0',
	s0pt5: '0.125rem', // 2px
	s1: '0.25rem', // 4px
	s1pt5: '0.375rem', // 6px
	s2: '0.5rem', // 8px
	s2pt5: '0.625rem', // 10px
	s3: '0.75rem', // 12px
	s3pt5: '0.875rem', // 14px
	s4: '1rem', // 16px
	s5: '1.25rem', // 20px
	s6: '1.5rem', // 24px
	s7: '1.75rem', // 28px
	s8: '2rem', // 32px
	s9: '2.25rem', // 36px
	s10: '2.5rem', // 40px
	s11: '2.75rem', // 44px
	s12: '3rem', // 48px
	s14: '3.5rem', // 56px
	s16: '4rem', // 64px
	s20: '5rem', // 80px
	s24: '6rem', // 96px
	s28: '7rem', // 112px
	s32: '8rem', // 128px
	s36: '9rem', // 144px
	s40: '10rem', // 160px
	s44: '11rem', // 176px
	s48: '12rem', // 192px
	s52: '13rem', // 208px
	s56: '14rem', // 224px
	s60: '15rem', // 240px
	s64: '16rem', // 256px
	s72: '18rem', // 288px
	s80: '20rem', // 320px
	s96: '24rem', // 384px
} as const;

// ============================================
// SEMANTIC SPACING - Design Intent
// ============================================

export const semanticSpacing = {
	/** Page section vertical padding */
	section: {
		sm: spacing.s12, // 48px - compact sections
		md: spacing.s20, // 80px - standard sections
		lg: spacing.s28, // 112px - spacious sections
	},
	/** Component internal padding */
	component: {
		xs: spacing.s2, // 8px - very compact
		sm: spacing.s4, // 16px - compact
		md: spacing.s6, // 24px - standard
		lg: spacing.s8, // 32px - spacious
	},
	/** Gap between items */
	gap: {
		xs: spacing.s2, // 8px
		sm: spacing.s4, // 16px
		md: spacing.s6, // 24px
		lg: spacing.s8, // 32px
		xl: spacing.s12, // 48px
	},
	/** Inline spacing (between inline elements) */
	inline: {
		xs: spacing.s1, // 4px
		sm: spacing.s2, // 8px
		md: spacing.s3, // 12px
		lg: spacing.s4, // 16px
	},
	/** Stack spacing (between stacked elements) */
	stack: {
		xs: spacing.s1, // 4px
		sm: spacing.s2, // 8px
		md: spacing.s4, // 16px
		lg: spacing.s6, // 24px
		xl: spacing.s8, // 32px
	},
} as const;

// ============================================
// CONTAINER MAX WIDTHS
// ============================================

export const containerSizes = {
	sm: '40rem', // 640px - max-w-2xl equivalent
	md: '48rem', // 768px - max-w-3xl equivalent
	lg: '64rem', // 1024px - max-w-5xl equivalent
	xl: '80rem', // 1280px - max-w-6xl equivalent
	xxl: '96rem', // 1536px - max-w-7xl equivalent
	full: '100%',
} as const;

// ============================================
// TYPE EXPORTS
// ============================================

export type Spacing = typeof spacing;
export type SemanticSpacing = typeof semanticSpacing;
export type ContainerSize = keyof typeof containerSizes;
