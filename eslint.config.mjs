import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importX from 'eslint-plugin-import-x';
import n from 'eslint-plugin-n';
import globals from 'globals';

export default tseslint.config(
	{
		ignores: [
			'__tests__/**',
			'jest.config.ts',
			'jest.setup.tsx',
			'commitlint.config.js',
			'scripts/**',
			'.next/**',
			'.vercel/**',
			'node_modules/**',
			'coverage/**',
			'*.config.*',
			'*.d.ts',
		],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
		plugins: {
			react,
			'react-hooks': reactHooks,
			'jsx-a11y': jsxA11y,
			'import-x': importX,
			n,
		},
		linterOptions: {
			reportUnusedDisableDirectives: 'off',
		},
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
		rules: {
			...react.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,
			'react/react-in-jsx-scope': 'off',
			'react/prop-types': 'off',
			'@typescript-eslint/no-unused-vars': 'warn',
			'@typescript-eslint/no-explicit-any': 'warn',
			// Disable XO-specific rules
			'import-x/extensions': 'off',
			'n/prefer-global/process': 'off',
		},
	},
);
