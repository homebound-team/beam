import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths() as any],
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["src/setupTests.tsx"],
    css: true,
    // TreeFilter tests take ~800ms locally and ~2.5s in CI; the default 5s wasn't enough
    testTimeout: 15_000,
  },
});
