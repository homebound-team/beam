import { trussPlugin } from "@homebound/truss/plugin";
import { fileURLToPath } from "node:url";
import { defaultExclude, defineConfig } from "vitest/config";

// Test files that `vi.mock` a shared module and therefore need their own module graph
const mockingTestFiles = ["src/inputs/MultiSelectField.filterHeight.test.tsx"];

export default defineConfig({
  plugins: [trussPlugin({ mapping: "./src/Css.json" })],
  resolve: {
    alias: [
      // Vite 8.2 stopped resolving `paths` from a tsconfig that `extends` a package, so alias `src/*` directly
      { find: /^src(\/|$)/, replacement: fileURLToPath(new URL("./src", import.meta.url)) + "$1" },
      // Swap framer-motion for a stub whose AnimatePresence renders immediately; the stub reaches the real
      // package through "framer-motion-actual", which bypasses the package's exports map by file path.
      {
        find: /^framer-motion$/,
        replacement: fileURLToPath(new URL("./src/tests/framerMotionStub.tsx", import.meta.url)),
      },
      {
        find: /^framer-motion-actual$/,
        replacement: fileURLToPath(new URL("./node_modules/framer-motion/dist/es/index.mjs", import.meta.url)),
      },
    ],
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/setupTests.tsx"],
    css: true,
    // TreeFilter tests take ~800ms locally and ~2.5s in CI; the default 5s wasn't enough
    testTimeout: 15_000,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          // Tests share one module graph per worker instead of re-importing ~380 modules per file. That is
          // safe because no product module imports a barrel (see oxlint.config.ts), and Testing Library's
          // cleanup is registered per file in setupTests. Files that `vi.mock` a module run isolated below,
          // since a per-file mock would otherwise leak into modules that other files already evaluated.
          isolate: false,
          include: ["src/**/*.test.{ts,tsx}"],
          exclude: [...defaultExclude, ...mockingTestFiles],
        },
      },
      { extends: true, test: { name: "mocked", isolate: true, include: mockingTestFiles } },
    ],
    // Node 26 defines its own `localStorage`, which is undefined without `--localstorage-file`, and
    // vitest keeps globals Node already defines. Turn Node's off so jsdom's Web Storage is used.
    execArgv: ["--no-experimental-webstorage"],
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
