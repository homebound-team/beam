import { useCallback, useRef } from "react";

/**
 * A hook to add `data-render=${count}` to an element.
 *
 * This will output even in production mode, which in theory is not necessary
 * and we could/should avoid, but it should also be np.
 *
 * The intent is to leave it "always on" for dev & tests, so that engineers
 * and test suites can very easily grab "what was the render count of that?"
 * w/o bringing in one-off modes/tools.
 *
 * (One-off modes/tools are more appropriate for truly adhoc performance
 * but the intent is to use this in GridTable where "what's the render count?"
 * will be a common question.)
 */
export function useRenderCount(): { getCount: (id: string) => object } {
  const ref = useRef<Map<string, number>>(new Map());
  const getCount = useCallback((id: string) => {
    const count = ref.current.get(id) || 1;
    ref.current.set(id, count + 1);
    return { "data-render": count };
  }, []);
  return { getCount };
}
