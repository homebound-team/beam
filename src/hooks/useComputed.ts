import { autorun, IReactionDisposer } from "mobx";
import { useMemo, useRef, useState } from "react";

/** Evaluates a computed function `fn` to a regular value and triggers a re-render whenever it changes. */
export function useComputed<T>(fn: () => T, deps: readonly any[]): T {
  // We always return the useRef value, and use this just to trigger re-renders
  const [, setValue] = useState(0);
  const autoRunner = useRef<IReactionDisposer>();
  const autoRanValue = useRef<T>();
  useMemo(() => {
    let tick = 0;
    // If deps has changed, unhook the previous observer
    if (autoRunner.current) {
      autoRunner.current();
    }
    autoRunner.current = autorun(() => {
      // Always eval fn() (even on 1st render) to register our observable.
      const newValue = fn();
      // We could eventually use a deep equals to handle objects
      if (newValue === autoRanValue.current) {
        return;
      }
      autoRanValue.current = newValue;
      // Only trigger a re-render if this is not the 1st autorun. Note
      // that if deps has changed, we're inherently in a re-render so also
      // don't need to trigger an additional re-render.
      if (tick > 0) {
        setValue(tick);
      }
      tick++;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  // We can use `!` here b/c we know that `autorun` set current
  return autoRanValue.current!;
}
