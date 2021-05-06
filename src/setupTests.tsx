import { matchers } from "@emotion/jest";
import "@testing-library/jest-dom";

beforeEach(() => jest.useFakeTimers("modern"));
afterEach(() => jest.useRealTimers());

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
