import { configure } from "mobx";
import "src/tests/framerMotion";
import "src/tests/getComputedStyle";
import "src/tests/matchers";
import { vi } from "vitest";

// Polyfill CSS.escape for jsdom — react-aria uses CSS.escape(key) in querySelector
// for data-key attribute selectors, and jsdom doesn't provide it natively.
if (typeof globalThis.CSS === "undefined") {
  (globalThis as any).CSS = { escape: (s: string) => s.replace(/([^\w-])/g, "\\$1") };
} else if (typeof globalThis.CSS.escape !== "function") {
  globalThis.CSS.escape = (s: string) => s.replace(/([^\w-])/g, "\\$1");
}

beforeEach(() => {
  vi.useFakeTimers();
  sessionStorage.clear();
});
afterEach(() => vi.useRealTimers());

// formState doesn't use actions
configure({ enforceActions: "never" });

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
