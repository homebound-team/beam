import { type RefObject, useEffect, useRef, useState } from "react";

/**
 * Auto-hide positioning state for scroll-away chrome:
 * - `static`: in normal flow, scrolling with the page.
 * - `hidden`: `position: fixed` at `top: -<height>` (just above the viewport) — scrolled past the
 *   threshold, still going down.
 * - `revealed`: `position: fixed` at `top: 0`, pinned to the viewport — reversed to scroll up past it.
 *
 * Pair with a CSS `top` transition to animate the `hidden` ↔ `revealed` slide.
 */
export type AutoHideState = "static" | "hidden" | "revealed";

export type AutoHideResult = {
  state: AutoHideState;
  /**
   * True when the chrome is fully visible at the top of the viewport (top of page, or scrolled back up to
   * it). Unlike `state === "static"` — which has hysteresis and holds through the buffer zone — this flips
   * off as soon as the chrome leaves the top, so use it to decide whether downstream chrome should offset.
   */
  atTop: boolean;
};

/** Distance (px) the placeholder must scroll past the viewport top before we commit to fixed. */
const THRESHOLD = 80;

export function useAutoHideOnScroll(
  spacerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  /**
   * Viewport-y the inner pins to when `revealed`. We return to `static` when the placeholder's `rect.top`
   * reaches this value (not `0`), so its in-flow and fixed positions match and there's no jump. Read on
   * every scroll, so it can track dynamic chrome (e.g. an auto-hiding parent nav). Defaults to `0`.
   */
  getTopOffset?: () => number,
): AutoHideResult {
  const [state, setState] = useState<AutoHideState>("static");
  const stateRef = useRef<AutoHideState>("static");
  const [atTop, setAtTop] = useState(true);
  const atTopRef = useRef(true);
  // Hold the latest `getTopOffset` in a ref so the scroll handler reads the current value without
  // the effect needing to re-subscribe (and without depending on a callback that's a fresh function
  // each render when callers don't memoize it).
  const getTopOffsetRef = useRef(getTopOffset);
  getTopOffsetRef.current = getTopOffset;
  // Start at +Infinity so the first scroll evaluation registers as "up" (dy < 0), which lets a
  // deep-link / scroll-restored load land in `revealed` if the user is already past the threshold.
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

    const update = () => {
      const el = spacerRef.current;
      if (!el) return;

      // At/above the top of the page we're definitively `static`. Also covers iOS rubber-band top-
      // overscroll (negative `scrollY`): the in-flow inner bounces with the page instead of staying pinned.
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

      // Don't let an upward bounce from bottom-overscroll (scroll position settling back to the page
      // bottom) read as an intentional scroll-up and reveal the chrome.
      const doc = document.documentElement;
      const atBottom = currentY >= doc.scrollHeight - doc.clientHeight;

      let next: AutoHideState = stateRef.current;
      if (nextAtTop) {
        // Placeholder is back at (or below) its anchor — leave the inner in flow.
        next = "static";
      } else if (rect.bottom < -THRESHOLD) {
        // Far enough past the placeholder to commit to fixed positioning. Only flip between
        // hidden/revealed when the user actually moved vertically — pure horizontal scroll fires
        // the same scroll event with `dy === 0`, and we don't want that to reveal the chrome.
        if (dy < 0 && !atBottom) next = "revealed";
        else if (dy > 0) next = "hidden";
        // dy === 0 (or an at-bottom bounce): keep the current state.
      }
      // In the buffer (placeholder partially scrolled but bottom within THRESHOLD of viewport top)
      // keep the current state to avoid flicker.

      commit(next, nextAtTop);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [enabled, spacerRef]);

  return { state, atTop };
}
