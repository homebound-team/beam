/**
 * Helpers for semantic color tokens: derive expected `--b-*` custom property names from JSON leaf keys.
 * Used by `scripts/validate-tokens.ts` to ensure `cssVar` matches the leaf key (codegen contract).
 */

/** Expected `--b-*` custom property for a PascalCase semantic leaf key. */
export function semanticLeafKeyToExpectedCssVar(leafKey: string): string {
  const kebab = pascalCaseToKebab(leafKey);
  return `--b-${kebab}`;
}

function pascalCaseToKebab(s: string): string {
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}
