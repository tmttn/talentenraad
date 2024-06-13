import type {Config} from 'tailwindcss';
import daisyui from 'daisyui';
import light from 'daisyui/src/theming/themes';

const config: Config = {
	content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['system-ui'],
			},
		},
	},
	plugins: [
		daisyui,
	],
	daisyui: {
		themes: [
			{
				light: {
					light,
					primary: '#ea247b',
					secondary: '#afbd43',
					accent: '#f1b357',
					neutral: '#57534e',
					'base-100': '#F7F5DD',
					info: '#0ea5e9',
					success: '#4ade80',
					warning: '#fdba74',
					error: '#f87171',
				},
			},
		],
	},
};
export default config;
