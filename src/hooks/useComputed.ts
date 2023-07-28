import equal from "fast-deep-equal";
import { autorun, IReactionDisposer } from "mobx";
import { useMemo, useRef } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";

interface Current<T> {
  notify: (() => void) | undefined;
  // Track the mobx autorunner
  dispose: IReactionDisposer | undefined;
  // Track the current value, as we only re-calc on changes
  value: T | undefined;
  // Track whether our autorun has actually run; sometimes it won't, i.e. if mobx
  // is already in a "run reactions" loop, we'll see useMemo complete before
  // we've had a chance to calc the value.
  hasRan: boolean;
  version: number;
  subscribe: (notify: () => void) => () => void;
  getVersion: () => number;
}

/** Evaluates a computed function `fn` to a regular value and triggers a re-render whenever it changes. */
export function useComputed<T>(fn: (prev: T | undefined) => T, deps: readonly any[]): T {
  const ref = useRef<Current<T>>();
  if (!ref.current) {
    ref.current = {
      notify: undefined,
      dispose: undefined,
      value: undefined,
      hasRan: false,
      version: 0,
      getVersion() {
        return this.version;
      },
      subscribe(notify: () => void) {
        this.notify = notify;
        return () => this.dispose?.();
      },
    };
    ref.current.getVersion = ref.current.getVersion.bind(ref.current);
    ref.current.subscribe = ref.current.subscribe.bind(ref.current);
  }

  // We use a `useMemo` b/c we want this to synchronously calc, so that even
  // the very 1st render can use the result of our computed, i.e. instead of
  // with `useEffect`, which would only get calc'd after the 1st render has
  // already been done.
  useMemo(() => {
    const current = ref.current!;
    // If deps has changed, we're already re-running, so don't trigger a 2nd one
    current.hasRan = false;
    current.dispose?.();
    current.dispose = autorun(() => {
      const { value: oldValue, hasRan: oldHasRun } = current;
      // Always eval fn() (even on 1st render) to register our observable.
      const newValue = fn(oldValue);
      current.value = newValue;
      current.hasRan = true;
      // Only trigger a re-render if this is not the 1st autorun. Note
      // that if deps has changed, we're inherently in a re-render so also
      // don't need to trigger an additional re-render.
      if (oldHasRun && !equal(newValue, oldValue)) {
        current.version++;
        current.notify?.();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const { current } = ref;
  useSyncExternalStore(current.subscribe, current.getVersion, current.getVersion);

  // Occasionally autorun will not have run yet, in which case we have to just
  // accept running the eval fn twice (here to get the value for the 1st render,
  // and again for mobx to watch what observables we touch).
  if (!ref.current.hasRan) {
    ref.current.value = fn(undefined);
  }

  // We can use `!` here b/c we know that `autorun` set current
  return ref.current.value!;
}
