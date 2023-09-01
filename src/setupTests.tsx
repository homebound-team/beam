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

// Make framer-motion animations happen immediately for easier testing
// https://github.com/framer/motion/issues/285#issuecomment-1252290924
jest.mock("framer-motion", () => {
  const actual = jest.requireActual("framer-motion");
  return {
    __esModule: true,
    ...actual,
    AnimatePresence: (props: any) => <div {...props} />,
  };
});

// Add toHaveStyleRule
expect.extend(matchers);
