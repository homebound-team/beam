import { cleanup } from "@testing-library/react";
import { configure } from "mobx";
import { resetWindowScroll } from "src/tests/documentScroll";
import "src/tests/elementInternals";
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
  resetWindowScroll();
  vi.restoreAllMocks();
});
afterEach(() => vi.useRealTimers());
// Testing Library only registers its own `afterEach(cleanup)` when it is first imported. Without test
// isolation that import happens once per worker, so register cleanup here, which runs for every file.
afterEach(cleanup);

// formState doesn't use actions
configure({ enforceActions: "never" });
