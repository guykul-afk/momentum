import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.spec.ts', 'src/**/*.test.ts'],
    exclude: ['e2e/**', 'functions/**', 'node_modules/**'],
  },
});
