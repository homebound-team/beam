module.exports = {
  extends: ["@homebound/eslint-config/react", "plugin:storybook/recommended"],
  rules: {
    // Under `verbatimModuleSyntax`, `import { type A } from "x"` still emits `import "x"`, which breaks
    // consumers when "x" is a types-only package such as @react-types/shared. All-type imports must
    // use `import type { A } from "x"`, which is erased entirely.
    "@typescript-eslint/no-import-type-side-effects": "error",
  },
};
