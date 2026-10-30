import {defineConfig, globalIgnores} from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// Bewust lean: alleen regels die bugs vangen (React hooks, Next.js, TypeScript).
// Stijl en types bewaken we met tsc, tests en build, niet met lint.
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'coverage/**',
    'generated/**',
    'content-export/**',
    'public/**',
    'next-env.d.ts',
  ]),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', {argsIgnorePattern: '^_', varsIgnorePattern: '^_'}],
      '@typescript-eslint/no-explicit-any': 'warn',
      // React Compiler-regels: bestaande code leest localStorage na mount; zichtbaar houden, niet blokkeren.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/purity': 'warn',
    },
  },
  {
    // CommonJS-config en test-bestanden gebruiken require().
    files: ['**/*.js', '**/*.cjs', '__tests__/**', 'vitest.*'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]);
