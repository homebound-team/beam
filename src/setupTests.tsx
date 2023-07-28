import { matchers } from "@emotion/jest";
import "@testing-library/jest-dom";
import "jest-chain";
import { configure } from "mobx";

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

// formState doesn't use actions
configure({ enforceActions: "never" });

// Use deterministic ids. Note that `@react-aria/utils` / `useId` goes through this useSSRSafeId.
jest.mock("@react-aria/ssr", () => {
  let id = 0;
  const react = jest.requireActual("react");
  return {
    ...(jest.requireActual("@react-aria/ssr") as any),
    useSSRSafeId: (defaultId?: string) => {
      return react.useMemo(() => defaultId || `react-aria-${++id}`, [defaultId]);
    },
  };
});

// Add toHaveStyleRule
expect.extend(matchers);

expect.extend({
  toNotBeInTheDom(rtlElement) {
    try {
      rtlElement();
      return { pass: false, message: () => "Should not have been in the dom" };
    } catch (e) {
      return { pass: true, message: () => "" };
    }
  },
});

// Suppress warnings about prop changes causing observables in other components to re-render.
const error = console.error.bind(console);
console.error = function () {
  if (
    arguments.length > 0 &&
    typeof arguments[0] === "string" &&
    arguments[0].startsWith("Warning: Cannot update a component")
  ) {
    return;
  }
  error(...arguments);
};
