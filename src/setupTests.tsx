import { configure } from "mobx";
import "src/tests/framerMotion";
import "src/tests/matchers";
import { resetViewport } from "src/tests/viewport";
import { vi } from "vitest";

// jsdom has no `window.matchMedia`, so install the stub `useBreakpoint` relies on before any test
// module is collected (hooks below only cover the window around each test, not import time).
resetViewport();

beforeEach(() => {
  vi.useFakeTimers();
  sessionStorage.clear();
  localStorage.clear();
  // Reset to a desktop viewport so a viewport set in one test can't leak into the next.
  resetViewport();
  vi.restoreAllMocks();
});
afterEach(() => vi.useRealTimers());

// formState doesn't use actions
configure({ enforceActions: "never" });
