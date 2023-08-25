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
 *
 * Note that we use a value type of `any` so that the `[stable]` key does not
 * cause type mismatches on args that have index signatures.
 */
export type Stable<T> = T & { [stable]: any };

/** Limits the dependencies of `useStable` to be themselves only stable values. */
export type StableDep = Stable<unknown> | string | number | boolean | null | undefined;

/**
 * Allows creating "stable values", which is really just a dressed up `useMemo`.
 *
 * The only difference between `useStable` and `useMemo` is that `useStable` restricts its
 * dependencies to themselves be stable values. This is similar to the eslint rule that
 * catches a locally-declared `const array = [1, 2, 3]` can't be used as a dependency,
 * because it will change on every render, but moves the check into the TypeScript type
 * system where we can more robustly enforce it.
 */
export function useStable<T>(fn: () => T, deps: ReadonlyArray<StableDep> | undefined): Stable<T> {
  // We don't need the `fn` factory to be a dep so disable eslint warning
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(fn, deps) as Stable<T>;
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

/**
 * Downgrades the given `Props` by removing the `Stable` wrapper from each key to ease migration.
 *
 * I.e. a component can have its primary props type have the correct `Stable` marked types,
 * but then provide a separate "unsafe" fallback/transition component:
 *
 * ```ts
 * export const MyComponentUnsafe: (props: UnstableProps<MyComponentProps>) => ReactElement = MyComponent as any;
 * ```
 */
export type UnstableProps<Props> = {
  [K in keyof Props]: Props[K] extends Stable<infer T> ? T : Props[K];
};
