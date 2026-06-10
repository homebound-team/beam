import { useResizeObserver } from "@react-aria/utils";
import { RefObject, useCallback, useLayoutEffect, useState } from "react";

/** Rounded pixel height of `ref`'s element; `0` when absent or disabled. */
export function useMeasuredHeight(ref: RefObject<HTMLElement | null>, enabled: boolean): number {
  const [height, setHeight] = useState(0);

  const syncElementHeight = useCallback(() => {
    const el = ref.current;
    const next = el ? Math.round(el.getBoundingClientRect().height) : 0;
    setHeight((prev) => (prev === next ? prev : next));
  }, [ref]);

  useResizeObserver({ ref, onResize: syncElementHeight });
  useLayoutEffect(() => {
    syncElementHeight();
  }, [enabled, syncElementHeight]);

  return height;
}
