import { configure } from "mobx";
import "src/tests/framerMotion";
import "src/tests/matchers";
import "src/tests/matchMediaMock";
import { vi } from "vitest";

beforeEach(() => {
  vi.useFakeTimers();
  sessionStorage.clear();
});
afterEach(() => vi.useRealTimers());

// formState doesn't use actions
configure({ enforceActions: "never" });

