import { autorun, IReactionDisposer } from "mobx";
import { useEffect, useMemo, useRef, useState } from "react";
import { shallowEqual } from "src/utils/shallowEqual";

interface Current<T> {
  // Track the mobx autorunner
  runner: IReactionDisposer | undefined;
  // Track the current value, as we only re-calc on changes
  value: T | undefined;
  // Track whether our autorun has actually run; sometimes it won't, i.e. if mobx
  // is already in a "run reactions" loop, we'll see useMemo complete before
  // we've had a chance to calc the value.
  hasRan: boolean;
}

/**
 * Evaluates a computed function `fn` to a regular value and triggers a re-render whenever it changes.
 *
 * Some examples:
 *
 * ```ts
 * // Good, watching a single value
 * const firstName = useComputed(() => author.firstName, [author]);
 *
 * // Good, watching multiple values in a single `useComputed`
 * const { firstName, lastName } = useComputed(() => {
 *   // Make sure to read the values
 *   const { firstName, lastName } = author;
 *   return { firstName, lastName };
 * }, [author]);
 *
 * // Good, watching a form-state field
 * const firstName = useComputed(() => {
 *   return formState.firstName.value;
 * }, [formState]);
 *
 * // Good, watching an observable `formState` + a POJO/immutable `items` which is not an observable
 * const item = useComputed(() => {
 *   return items.find((i) => i.id === formState.itemId.value);
 * }, [formState, items]);
 *
 * // Bad, fn and deps are "watching the same thing".
 * const firstName = useComputed(() => {
 *   return formState.firstName.value;
 * }, [formState.firstName.value]);
 * ```
 *
 * Note that the difference between the `fn` and the `deps` is:
 *
 * - `fn` is "which values we are watching in the observable" (i.e. store or `formState`), and
 * - `deps` is "which observable we're watching" (i.e. store or `formState`)
 *
 * So the `deps` array shouldn't overlap with any of the "watched values" of the `fn` lambda,
 * other than the root observer itself (which admittedly should rarely change, i.e. our stores
 * are generally global-ish/very stable, but can change if the user switches pages i.e. "from
 * editing author:1 t editing author:2").
 */
export function useComputed<T>(fn: (prev: T | undefined) => T, deps: readonly any[]): T {
  // We always return the useRef value, and use this just to trigger re-renders
  const [, setTick] = useState(0);

  const ref = useRef<Current<T>>({
    runner: undefined,
    value: undefined,
    hasRan: false,
  });

  // We use a `useMemo` b/c we want this to synchronously calc, so that even
  // the very 1st render can use the result of our computed, i.e. instead of
  // with `useEffect`, which would only get calc'd after the 1st render has
  // already been done.
  useMemo(() => {
    const { current } = ref;
    // If deps has changed, unhook the previous observer
    if (current.runner) {
      current.runner();
    }
    // If deps has changed, we're already re-running, so don't trigger a 2nd one
    current.hasRan = false;
    current.runner = autorun(() => {
      const { value: oldValue, hasRan } = current;
      // Always eval fn() (even on 1st render) to register our observable.
      const newValue = fn(oldValue);
      // If we've already run and the value hasn't changed, don't trigger a re-render
      //
      // Also, we avoid a deep equality, b/c if a `useComputed` is returning something complicated/cyclic,
      // like ReactElement, deep equality will crawl into the guts of React/ReactFiber and cycle/infinite loop.
      if (hasRan && shallowEqual(newValue, oldValue)) return;
      // Only change the identity of `current.value` after we've checked that it's not shallow equal
      current.value = newValue;
      current.hasRan = true;
      // Only trigger a re-render if this is not the 1st autorun. Note
      // that if deps has changed, we're inherently in a re-render so also
      // don't need to trigger an additional re-render.
      if (hasRan) {
        // This can cause 'Cannot update a component while rendering a different component'
        // if one component (the mutator) is updating observable from directly
        // within it's render method. Usually this is rare and can be avoided by
        // only updating observables from within useEffect.
        setTick((tick) => tick + 1);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // unsubscribe the autorun when we're unmounted
  useEffect(() => {
    return ref.current.runner;
  }, []);

  // Occasionally autorun will not have run yet, in which case we have to just
  // accept running the eval fn twice (here to get the value for the 1st render,
  // and again for mobx to watch what observables we touch).
  if (!ref.current.hasRan) {
    ref.current.value = fn(undefined);
  }

  // We can use `!` here b/c we know that `autorun` set current
  return ref.current.value!;
}
