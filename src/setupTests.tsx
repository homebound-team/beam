import { jest } from "@jest/globals";
import "@testing-library/jest-dom";
import "jest-chain";
import { configure } from "mobx";

beforeEach(() => {
  jest.useFakeTimers();
  sessionStorage.clear();
});
afterEach(() => jest.useRealTimers());

// formState doesn't use actions
configure({ enforceActions: "never" });

// Use deterministic ids. Note that `@react-aria/utils` / `useId` goes through this useSSRSafeId.
jest.unstable_mockModule("@react-aria/ssr", () => {
  let id = 0;
  const react = jest.requireActual("react") as any;
  return {
    ...(jest.requireActual("@react-aria/ssr") as any),
    useSSRSafeId: (defaultId?: string) => {
      return react.useMemo(() => defaultId || `react-aria-${++id}`, [defaultId]);
    },
  };
});

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
