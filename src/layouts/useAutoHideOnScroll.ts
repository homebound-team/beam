import { type RefObject, useEffect, useRef, useState } from "react";

/**
 * Auto-hide chrome positioning: `static` (in flow), `hidden` (fixed above viewport), `revealed` (fixed at top).
 * Pair with a CSS `top` transition for the slide animation.
 */
export type AutoHideState = "static" | "hidden" | "revealed";

export type AutoHideResult = {
  state: AutoHideState;
  /** True when chrome is fully visible at the viewport top (for downstream offset decisions). */
  atTop: boolean;
};

/** Scroll distance before committing to fixed positioning. Exported for tests. */
export const THRESHOLD = 80;

export function useAutoHideOnScroll(
  spacerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  /** Viewport-y when `revealed`; defaults to `0`. Read each scroll (tracks dynamic parent chrome). */
  getTopOffset?: () => number,
): AutoHideResult {
  const [state, setState] = useState<AutoHideState>("static");
  const stateRef = useRef<AutoHideState>("static");
  const [atTop, setAtTop] = useState(true);
  const atTopRef = useRef(true);
  // Ref avoids re-subscribing the scroll listener when callers pass an unmemoized callback.
  const getTopOffsetRef = useRef(getTopOffset);
  getTopOffsetRef.current = getTopOffset;
  // +Infinity so the first scroll reads as "up" (deep-link / scroll restore can land in `revealed`).
  const lastScrollY = useRef(Number.POSITIVE_INFINITY);

  useEffect(() => {
    if (!enabled) {
      stateRef.current = "static";
      atTopRef.current = true;
      lastScrollY.current = Number.POSITIVE_INFINITY;
      setState("static");
      setAtTop(true);
      return;
    }

    const commit = (nextState: AutoHideState, nextAtTop: boolean) => {
      if (nextState !== stateRef.current) {
        stateRef.current = nextState;
        setState(nextState);
      }
      if (nextAtTop !== atTopRef.current) {
        atTopRef.current = nextAtTop;
        setAtTop(nextAtTop);
      }
    };

    const updateAutoHideState = () => {
      const el = spacerRef.current;
      if (!el) return;

      // Top of page (or iOS rubber-band overscroll) — stay in flow.
      if (window.scrollY <= 0) {
        lastScrollY.current = 0;
        commit("static", true);
        return;
      }

      const rect = el.getBoundingClientRect();
      const currentY = window.scrollY;
      const dy = currentY - lastScrollY.current;
      lastScrollY.current = currentY;

      const topOffset = getTopOffsetRef.current?.() ?? 0;
      const nextAtTop = rect.top >= topOffset;

      const doc = document.documentElement;
      const atBottom = currentY >= doc.scrollHeight - doc.clientHeight;

      let next: AutoHideState = stateRef.current;
      if (nextAtTop) {
        next = "static";
      } else if (rect.bottom < -THRESHOLD) {
        // Only flip on vertical movement — horizontal scroll fires with dy === 0.
        if (dy < 0 && !atBottom) next = "revealed";
        else if (dy > 0) next = "hidden";
      }

      commit(next, nextAtTop);
    };

    updateAutoHideState();
    window.addEventListener("scroll", updateAutoHideState, { passive: true });
    return () => window.removeEventListener("scroll", updateAutoHideState);
  }, [enabled, spacerRef]);

  return { state, atTop };
}
