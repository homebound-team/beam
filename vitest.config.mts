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
    // use-query-params v2 ships CJS without an `exports` map, so Node's ESM
    // loader can't resolve named imports. Inlining these lets Vite handle the
    // CJS-to-ESM conversion at transform time.
    server: {
      deps: {
        inline: ["use-query-params", "serialize-query-params", "@homebound/rtl-react-router-utils"],
      },
    },
  },
});
