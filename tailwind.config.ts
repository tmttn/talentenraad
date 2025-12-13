import type {Config} from 'tailwindcss';
import daisyui from 'daisyui';

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
};
export default config;
