import base from "@homebound/eslint-config";
import react from "@homebound/eslint-config/react";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [base, react],
  ignorePatterns: [".yarn/**/*", "dist/**/*", "storybook-static/**/*", "truss/**/*"],
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
