import { toHaveStyle } from "@homebound/truss/vitest";
import "@testing-library/jest-dom/vitest";
import { expect } from "vitest";

// Re-export matchers type to use in module augmentation below
type JestDomMatchers<E, R> = import("@testing-library/jest-dom/matchers").TestingLibraryMatchers<E, R>;

// Augment @vitest/expect directly since vitest 4.x re-exports Assertion from there,
// and @testing-library/jest-dom's built-in augmentation targets `vitest` which doesn't merge.
declare module "@vitest/expect" {
  // eslint-disable-next-line
  interface Assertion<T = any> extends JestDomMatchers<any, T> {}
  // eslint-disable-next-line
  interface AsymmetricMatchersContaining extends JestDomMatchers<any, any> {}
}

expect.extend({ toHaveStyle });
