import base from "@homebound/eslint-config";
import react from "@homebound/eslint-config/react";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [base, react],
  ignorePatterns: [".yarn/**/*", "dist/**/*", "storybook-static/**/*", "truss/**/*"],
  overrides: [
    {
      // src/index.ts is the public API and the only barrel; product code imports the module that declares
      // a symbol. A module that imports a barrel which re-exports it makes the barrel's `export *` run
      // while that module is still evaluating, so vitest's module runner snapshots the barrel without its
      // exports, and without test isolation later test files then import `undefined`.
      //
      // `paths` matches the import specifier exactly, so this only forbids `from "src"`. It does not stop
      // someone from adding a new folder `index.ts` and importing that; today such imports simply fail to
      // resolve because no other index.ts exists under src/.
      files: ["src/**/*.ts", "src/**/*.tsx"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [
              { name: "src", message: "Import from the module that declares the symbol, not from src/index.ts." },
            ],
          },
        ],
      },
    },
    {
      // Tests and stories are entry points, so importing the public barrel there is fine
      files: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/**/*.stories.tsx", "src/**/*.d.ts"],
      rules: { "no-restricted-imports": "off" },
    },
  ],
  rules: {
    // Under `verbatimModuleSyntax`, `import { type A } from "x"` still emits `import "x"`, which breaks
    // consumers when "x" is a types-only package such as @react-types/shared. All-type imports must
    // use `import type { A } from "x"`, which is erased entirely.
    "@typescript-eslint/no-import-type-side-effects": "error",
    // Beam ships its test-id helpers (useTestIds, defaultTestId, withTestMock) and its RTL utilities
    // as product code, and this rule matches any import path containing "test", so it is all noise here.
    "@homebound/prevent-test-file-imports-in-app-code": "off",
  },
});
