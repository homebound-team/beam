import { useResizeObserver } from "@react-aria/utils";
import { RefObject, useCallback, useLayoutEffect, useState } from "react";

/** Rounded pixel height of `ref`'s element; `0` when absent or disabled. */
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
