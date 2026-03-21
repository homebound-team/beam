import { trussPlugin } from "@homebound/truss/plugin";
import stylexPlugin from "@stylexjs/unplugin/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    trussPlugin({ mapping: "./src/Css.json" }),
    stylexPlugin({ runtimeInjection: true, enableDevClassNames: false, debug: false, useCSSLayers: true }),
  ],
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["src/setupTests.tsx"],
    css: true,
    // TreeFilter tests take ~800ms locally and ~2.5s in CI; the default 5s wasn't enough
    testTimeout: 15_000,
    // Force-exit after 1s instead of waiting 10s, see https://github.com/facebook/stylex/issues/1533
    teardownTimeout: 1000,
    server: {
      deps: {
        // use-query-params v2 ships CJS without an `exports` map, so Node's ESM
        // loader can't resolve named imports. Inlining these lets Vite handle the
        // CJS-to-ESM conversion at transform time.
        inline: ["use-query-params", "serialize-query-params", "@homebound/rtl-react-router-utils"],
      },
    },
  },
});
