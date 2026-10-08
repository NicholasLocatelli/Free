import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/test-helpers.ts", "src/index.ts", "src/types.ts"],
      // Gate from docs/testing/test-strategy.md: the domain is the source of truth.
      thresholds: { lines: 95, statements: 95, functions: 95, branches: 90 },
    },
  },
});
