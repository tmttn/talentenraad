import type {Config} from 'tailwindcss';
import daisyui from 'daisyui';
import typography from '@tailwindcss/typography';

const config: Config = {
	content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['system-ui'],
			},
			colors: {
				'primary-text': 'var(--color-primary-text)',
			},
			spacing: {
				// Section spacing
				'section-sm': 'var(--spacing-section-sm)',
				'section-md': 'var(--spacing-section-md)',
				'section-lg': 'var(--spacing-section-lg)',
				// Component spacing
				'component-xs': 'var(--spacing-component-xs)',
				'component-sm': 'var(--spacing-component-sm)',
				'component-md': 'var(--spacing-component-md)',
				'component-lg': 'var(--spacing-component-lg)',
				// Gap spacing
				'gap-xs': 'var(--spacing-gap-xs)',
				'gap-sm': 'var(--spacing-gap-sm)',
				'gap-md': 'var(--spacing-gap-md)',
				'gap-lg': 'var(--spacing-gap-lg)',
				'gap-xl': 'var(--spacing-gap-xl)',
			},
			boxShadow: {
				subtle: 'var(--shadow-subtle)',
				base: 'var(--shadow-base)',
				elevated: 'var(--shadow-elevated)',
				floating: 'var(--shadow-floating)',
				high: 'var(--shadow-high)',
				overlay: 'var(--shadow-overlay)',
				'input-focus': 'var(--shadow-input-focus)',
			},
			borderRadius: {
				button: 'var(--radius-button)',
				card: 'var(--radius-card)',
				input: 'var(--radius-input)',
				badge: 'var(--radius-badge)',
				modal: 'var(--radius-modal)',
				tooltip: 'var(--radius-tooltip)',
				dropdown: 'var(--radius-dropdown)',
			},
			transitionDuration: {
				instant: 'var(--duration-instant)',
				fast: 'var(--duration-fast)',
				base: 'var(--duration-base)',
				slow: 'var(--duration-slow)',
				slower: 'var(--duration-slower)',
			},
			transitionTimingFunction: {
				smooth: 'var(--easing-smooth)',
			},
		},
	},
	plugins: [
		daisyui,
		typography,
	],
};
export default config;
