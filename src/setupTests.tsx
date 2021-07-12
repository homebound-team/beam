import { matchers } from "@emotion/jest";
import { configureGlobalWrappers } from "@homebound/rtl-utils";
import "@testing-library/jest-dom";
import { configure } from "mobx";
import { withBeamRTL } from "src/utils/rtl";

beforeEach(() => jest.useFakeTimers("modern"));
afterEach(() => jest.useRealTimers());

// formState doesn't use actions
configure({ enforceActions: "never" });

configureGlobalWrappers([withBeamRTL]);

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
