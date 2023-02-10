import equal from "fast-deep-equal";
import { autorun, IReactionDisposer } from "mobx";
import { useEffect, useMemo, useRef, useState } from "react";

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

/** Evaluates a computed function `fn` to a regular value and triggers a re-render whenever it changes. */
export function useComputed<T>(fn: () => T, deps: readonly any[]): T {
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
      // Always eval fn() (even on 1st render) to register our observable.
      const newValue = fn();
      const { value: oldValue, hasRan: oldHasRun } = current;
      current.value = newValue;
      current.hasRan = true;
      // Only trigger a re-render if this is not the 1st autorun. Note
      // that if deps has changed, we're inherently in a re-render so also
      // don't need to trigger an additional re-render.
      if (oldHasRun && !equal(newValue, oldValue)) {
        setTick((tick) => tick + 1);
      }
    });
    return current.runner;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Tell unsubscribe the autorun when we're unmounted
  useEffect(() => {
    return ref.current.runner;
  }, []);

  // Occasionally autorun will not have run yet, in which case we have to just
  // accept running the eval fn twice (here to get the value for the 1st render,
  // and again for mobx to watch what observables we touch).
  if (!ref.current.hasRan) {
    ref.current.value = fn();
  }

  // We can use `!` here b/c we know that `autorun` set current
  return ref.current.value!;
}
