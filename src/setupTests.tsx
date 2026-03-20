import * as matchers from "@testing-library/jest-dom/matchers";
import "@testing-library/jest-dom/vitest";
import { configure } from "mobx";
import { expect, vi } from "vitest";

function kebabToCamel(styleName: string) {
  return styleName.replace(/-([a-z])/g, function (_, letter: string) {
    return letter.toUpperCase();
  });
}

function toCssVarName(styleName: string) {
  if (styleName.startsWith("--")) return styleName;
  return `--x-${kebabToCamel(styleName)}`;
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

// Polyfill CSS.escape for jsdom — react-aria uses CSS.escape(key) in querySelector
// for data-key attribute selectors, and jsdom doesn't provide it natively.
if (typeof globalThis.CSS === "undefined") {
  (globalThis as any).CSS = { escape: (s: string) => s.replace(/([^\w-])/g, "\\$1") };
} else if (typeof globalThis.CSS.escape !== "function") {
  globalThis.CSS.escape = (s: string) => s.replace(/([^\w-])/g, "\\$1");
}

// Patch getComputedStyle to handle nwsapi CSS selector parsing errors.
// React 18's useId() generates IDs with colons (e.g. `:r1:`), and react-aria embeds
// these in element IDs. When jsdom's getComputedStyle iterates CSS stylesheets via nwsapi,
// it throws SyntaxError on colons parsed as pseudo-classes. Catching the error is safe —
// jsdom only resolves the `visibility` property so tests are unaffected by the fallback.
const _origGetComputedStyle = window.getComputedStyle.bind(window);
window.getComputedStyle = ((elt: Element, pseudoElt?: string | null): CSSStyleDeclaration => {
  try {
    return _origGetComputedStyle(elt, pseudoElt);
  } catch {
    // nwsapi SyntaxError on colon-containing IDs — return empty computed style
    return _origGetComputedStyle(document.createElement("div"), pseudoElt);
  }
}) as typeof window.getComputedStyle;

beforeEach(() => {
  vi.useFakeTimers();
  sessionStorage.clear();
});
afterEach(() => vi.useRealTimers());

// formState doesn't use actions
configure({ enforceActions: "never" });

// Make framer-motion animations happen immediately for easier testing
// https://github.com/framer/motion/issues/285#issuecomment-1252290924
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...actual,
    AnimatePresence: (props: any) => <div {...props} />,
  };
});

// Adding a media matcher to avoid errors in tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
