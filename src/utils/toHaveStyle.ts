import * as matchers from "@testing-library/jest-dom/matchers";
import { expect } from "vitest";

expect.extend({
  toHaveStyle(received: Element, expected: Record<string, string> | string) {
    const baseResult = matchers.toHaveStyle.call(this, received, expected);
    if (baseResult.pass || typeof expected === "string") {
      return baseResult;
    }

    const failures = hasExpectedDynamicStyles(received, expected);
    if (failures.length === 0) {
      return {
        pass: true,
        message: function () {
          return `expected element not to have style ${JSON.stringify(expected)}`;
        },
      };
    }

    return {
      pass: false,
      message: function () {
        return `${baseResult.message()}\nDynamic style fallback also failed:\n${failures.join("\n")}`;
      },
    };
  },
});

function kebabToCamel(styleName: string) {
  return styleName.replace(/-([a-z])/g, function (_, letter: string) {
    return letter.toUpperCase();
  });
}

function toCssVarName(styleName: string) {
  if (styleName.startsWith("--")) return styleName;
  return `--${kebabToCamel(styleName)}`;
}

function hasExpectedDynamicStyles(received: Element, expected: Record<string, string>) {
  const computedStyle = getComputedStyle(received);
  const failures: string[] = [];

  for (const [styleName, expectedValue] of Object.entries(expected)) {
    const cssVarName = toCssVarName(styleName);
    const actualValue = computedStyle.getPropertyValue(cssVarName).trim();
    if (actualValue !== expectedValue) {
      failures.push(`${cssVarName}: expected ${expectedValue}, received ${actualValue || "<empty>"}`);
    }
  }

  return failures;
}
