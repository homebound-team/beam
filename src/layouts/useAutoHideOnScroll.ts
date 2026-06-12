import { type RefObject, useLayoutEffect, useRef, useState } from "react";

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

function getInitialAutoHideState(): { state: AutoHideState; atTop: boolean } {
  if (typeof window === "undefined" || window.scrollY <= 0) {
    return { state: "static", atTop: true };
  }
  // Mid-page reload — assume hidden until spacer geometry syncs in layout effect.
  return { state: "hidden", atTop: false };
}

export function useAutoHideOnScroll(
  spacerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  /** Viewport-y when `revealed`; defaults to `0`. Read each scroll (tracks dynamic parent chrome). */
  getTopOffset?: () => number,
): AutoHideResult {
  const initial = getInitialAutoHideState();
  const [state, setState] = useState<AutoHideState>(initial.state);
  const stateRef = useRef<AutoHideState>(initial.state);
  const [atTop, setAtTop] = useState(initial.atTop);
  const atTopRef = useRef(initial.atTop);
  // Ref avoids re-subscribing the scroll listener when callers pass an unmemoized callback.
  const getTopOffsetRef = useRef(getTopOffset);
  getTopOffsetRef.current = getTopOffset;
  // +Infinity so the first scroll reads as "up" (deep-link / scroll restore can land in `revealed`).
  const lastScrollY = useRef(Number.POSITIVE_INFINITY);
  const lastScrollHeight = useRef(0);

  useLayoutEffect(() => {
    if (!enabled) {
      stateRef.current = "static";
      atTopRef.current = true;
      lastScrollY.current = Number.POSITIVE_INFINITY;
      lastScrollHeight.current = 0;
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

    /** Document height changed — derive state from spacer position only; never reveal chrome. */
    const autoHideStateOnLayoutChange = (
      rect: DOMRect,
      topOffset: number,
    ): { next: AutoHideState; nextAtTop: boolean } => {
      const nextAtTop = rect.top >= topOffset;
      let next = stateRef.current;

      if (nextAtTop) {
        next = "static";
      } else if (rect.bottom < -THRESHOLD && next !== "revealed") {
        // Layout-driven scroll (e.g. when table rows are expanded, or rows filtered) — never reveal; pin hidden when past threshold.
        next = "hidden";
      }

      return { next, nextAtTop };
    };

    const updateAutoHideState = () => {
      const el = spacerRef.current;
      if (!el) return;

      const doc = document.documentElement;
      const currentScrollHeight = doc.scrollHeight;
      const scrollHeightChanged = lastScrollHeight.current !== 0 && currentScrollHeight !== lastScrollHeight.current;
      lastScrollHeight.current = currentScrollHeight;

      // Top of page (or iOS rubber-band overscroll) — stay in flow.
      if (window.scrollY <= 0) {
        lastScrollY.current = 0;
        commit("static", true);
        return;
      }

      const currentY = window.scrollY;
      const rect = el.getBoundingClientRect();
      const topOffset = getTopOffsetRef.current?.() ?? 0;

      // Document height changed — resync scrollY baseline; apply geometry only (never reveal).
      if (scrollHeightChanged) {
        lastScrollY.current = currentY;
        const { next, nextAtTop } = autoHideStateOnLayoutChange(rect, topOffset);
        commit(next, nextAtTop);
        return;
      }

      const dy = currentY - lastScrollY.current;
      lastScrollY.current = currentY;

      const atBottom = currentY >= doc.scrollHeight - doc.clientHeight;
      const nextAtTop = rect.top >= topOffset;

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
