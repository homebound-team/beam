import { useMemo } from "react";

const stable = Symbol("stable");

/**
 * A marker type to indicate a value *must* be stable.
 *
 * This is typically used for a large/complicated component like GridTable that knows it's
 * going to render ~many children, and so internally uses `useMemo`s to optimize performance,
 * and needs to indicate to callers which props should be stable.
 *
 * ```ts
 * export interface GridTableProps {
 *   // The use of Stable tells callers they must pass a stable array.
 *   columns: Stable<Column[]>;
 * }
 * ```
 */
export type Stable<T> = T & { [stable]: true };

export type StableDep = Stable<unknown> | string | number | boolean | null | undefined;

declare module "react" {
  function useMemo<T>(factory: () => T, deps: ReadonlyArray<unknown> | undefined): Stable<T>;
}

/**
 * Marks a value as stable even though it's not.
 *
 * This should only be used for unit tests, or for pages/components that the programmer
 * "just knows" are extremely-small/read-only, such that passing in a prop that breaks
 * memoization is okay.
 */
export function pretendStable<T>(value: T): Stable<T> {
  return value as Stable<T>;
}

/** Allows creating "stable values", which is really just a dressed up `useMemo`. */
export function useStable<T>(fn: () => T, deps: ReadonlyArray<StableDep> | undefined): Stable<T> {
  // We don't need the `fn` factory to be a dep
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(fn, deps) as Stable<T>;
}
