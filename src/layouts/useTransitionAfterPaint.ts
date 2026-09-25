import { type RefObject, useLayoutEffect } from "react";

/**
 * Sets `transition` after the first paint. Mount-time layout corrections (measured chrome height)
 * land before paint; a transition already on the element animates them.
 */
export function useTransitionAfterPaint(ref: RefObject<HTMLElement | null>, transition: string) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.style.transition = transition;
    });
    return () => cancelAnimationFrame(id);
  }, [ref, transition]);
}
