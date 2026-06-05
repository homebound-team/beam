import { useResizeObserver } from "@react-aria/utils";
import { RefObject, useCallback, useLayoutEffect, useState } from "react";

/**
 * Rounded pixel height of `ref`'s element, kept current via a `ResizeObserver`; `0` when the element is
 * absent. `enabled` re-runs the initial pre-paint measure when the chrome appears/disappears. The setter
 * bails on an unchanged height so a no-op observer fire doesn't re-render.
 */
export function useMeasuredHeight(ref: RefObject<HTMLElement | null>, enabled: boolean): number {
  const [height, setHeight] = useState(0);

  const sync = useCallback(() => {
    const el = ref.current;
    const next = el ? Math.round(el.getBoundingClientRect().height) : 0;
    setHeight((prev) => (prev === next ? prev : next));
  }, [ref]);

  useResizeObserver({ ref, onResize: sync });
  useLayoutEffect(() => {
    sync();
  }, [enabled, sync]);

  return height;
}
