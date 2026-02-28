import { jest } from "@jest/globals";
import "@testing-library/jest-dom";
import "jest-chain";
import { configure } from "mobx";

// Polyfill CSS.escape for jsdom — react-aria v3.33+ uses CSS.escape(key) in querySelector
// for data-key attribute selectors, and jsdom doesn't provide it natively.
if (typeof globalThis.CSS === "undefined") {
  (globalThis as any).CSS = { escape: (s: string) => s.replace(/([^\w-])/g, "\\$1") };
} else if (typeof globalThis.CSS.escape !== "function") {
  globalThis.CSS.escape = (s: string) => s.replace(/([^\w-])/g, "\\$1");
}

// Patch getComputedStyle to handle nwsapi CSS selector parsing errors.
// React 18's useId() generates IDs with colons (e.g. `:r1:`), and react-aria v3.33+ embeds
// these in element IDs (e.g. `react-aria-:r1:-option-1`). When jsdom's getComputedStyle
// iterates CSS stylesheets via nwsapi, compiled selector resolvers call querySelector on
// child elements, hitting the non-VERBOSITY nwsapi instance which throws SyntaxError on
// colons parsed as pseudo-classes. Catching the error and returning the original result is
// safe — jsdom only resolves the `visibility` property (default "visible") so tests are
// unaffected by falling back to the base computed style.
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
  jest.useFakeTimers();
  sessionStorage.clear();
});
afterEach(() => jest.useRealTimers());

// formState doesn't use actions
configure({ enforceActions: "never" });

// Make framer-motion animations happen immediately for easier testing
// https://github.com/framer/motion/issues/285#issuecomment-1252290924
jest.unstable_mockModule("framer-motion", () => {
  const actual = jest.requireActual("framer-motion") as any;
  return {
    __esModule: true,
    ...actual,
    AnimatePresence: (props: any) => <div {...props} />,
  };
});

// Adding a media matcher to avoid errors in tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
