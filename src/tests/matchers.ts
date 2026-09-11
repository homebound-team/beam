import { toHaveStyle } from "@homebound/truss/vitest";
import "@testing-library/jest-dom/vitest";
import { expect } from "vitest";

// Re-export matchers type to use in module augmentation below
type JestDomMatchers<E, R> = import("@testing-library/jest-dom/matchers").TestingLibraryMatchers<E, R>;

// Augment @vitest/expect directly since vitest re-exports Assertion from there,
// and @testing-library/jest-dom's built-in augmentation targets `vitest` which doesn't merge.
// The type parameters must match vitest's own `Assertion<R, T>`, where R is the matcher return type.
declare module "@vitest/expect" {
  // eslint-disable-next-line
  interface Assertion<R extends void | Promise<void> = void, T = unknown> extends JestDomMatchers<any, R> {}
  // eslint-disable-next-line
  interface AsymmetricMatchersContaining extends JestDomMatchers<any, any> {}
}

expect.extend({ toHaveStyle });
