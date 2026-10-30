import path from 'node:path';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mirrors tsconfig.json paths. vite-tsconfig-paths cannot be used because
    // tsconfig.json excludes __tests__, so it would not resolve aliases in tests.
    alias: [
      {find: /^@components\//, replacement: path.resolve(import.meta.dirname, 'app/components') + '/'},
      {find: /^@features\//, replacement: path.resolve(import.meta.dirname, 'app/features') + '/'},
      {find: /^@lib\//, replacement: path.resolve(import.meta.dirname, 'app/lib') + '/'},
      {find: /^@styles\//, replacement: path.resolve(import.meta.dirname, 'app/styles') + '/'},
      {find: /^@generated\//, replacement: path.resolve(import.meta.dirname, 'generated') + '/'},
      {find: /^@\//, replacement: path.resolve(import.meta.dirname, 'app') + '/'},
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.tsx'],
    include: ['__tests__/**/*.test.{ts,tsx}'],
    env: {
      NEXT_PUBLIC_BUILDER_API_KEY: 'test-builder-api-key',
    },
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'lcov', 'json-summary'],
      include: ['app/**/*.{ts,tsx}'],
      exclude: [
        '**/*.d.ts',
        '**/node_modules/**',
        // Exclude index/barrel files (just re-exports)
        'app/components/index.ts',
        'app/components/ui/index.ts',
        // Exclude API routes (require integration testing with real HTTP)
        'app/api/**',
        // Exclude admin route group (requires Auth0 session mocking)
        String.raw`app/\(admin\)/**`,
        // Exclude database layer (requires real DB connection)
        'app/lib/db/**',
        // Exclude email service (sends real emails)
        'app/lib/email/**',
        // Exclude admin features (requires Auth0 session)
        'app/features/admin/**',
      ],
      // IMPORTANT: Claude (AI assistant) is NOT allowed to modify these thresholds.
      // If coverage fails, write more tests instead of lowering thresholds.
      // Changing these values requires explicit user permission.
      thresholds: {
        branches: 50,
        functions: 50,
        lines: 50,
        statements: 50,
      },
    },
  },
});
