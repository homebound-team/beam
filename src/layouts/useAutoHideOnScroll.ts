import { type RefObject, useLayoutEffect, useRef, useState } from "react";

/**
 * Auto-hide chrome positioning: `resting` (resting top while its spacer is in view), `hidden` (above
 * the viewport), or `revealed` (resting top after upward scroll). Pair with a CSS `top` transition.
 */
export type AutoHideState = "resting" | "hidden" | "revealed";

export type AutoHideResult = {
  state: AutoHideState;
};

/** Scroll distance before hiding chrome. Exported for tests. */
export const THRESHOLD = 80;

/** How long the window must go without scrolling before a hold releases, for browsers without `scrollend`. */
export const HOLD_QUIET_MS = 150;

/** Cancels the active hold's listeners and timer, if a programmatic scroll is in flight. */
let cancelActiveHold: (() => void) | undefined;
const holdReleaseListeners = new Set<() => void>();
// Not `keydown`, since typing in a table's search box is what triggers some of these scrolls.
const userScrollEvents = ["wheel", "touchstart"] as const;

/**
 * Runs a programmatic window scroll while auto-hide chrome (navbar, page header) holds its current state.
 *
 * Otherwise a smooth scroll back up reveals the chrome mid-scroll, which pushes pinned content (e.g. table actions)
 * down over the target that `scroll-margin-top` had already measured. Releases on `scrollend`, once scrolling goes
 * quiet, or as soon as the user scrolls themselves.
 */
export function holdAutoHideWhile(scroll: () => void): void {
  cancelActiveHold?.();
  let quietTimer: ReturnType<typeof setTimeout>;
  const restartQuietTimer = () => {
    clearTimeout(quietTimer);
    quietTimer = setTimeout(release, HOLD_QUIET_MS);
  };
  const cancel = () => {
    clearTimeout(quietTimer);
    window.removeEventListener("scroll", restartQuietTimer);
    for (const event of userScrollEvents) window.removeEventListener(event, release);
    window.removeEventListener("scrollend", release);
    cancelActiveHold = undefined;
  };
  function release() {
    cancel();
    holdReleaseListeners.forEach((listener) => listener());
  }
  window.addEventListener("scroll", restartQuietTimer, { passive: true });
  for (const event of userScrollEvents) window.addEventListener(event, release, { passive: true });
  window.addEventListener("scrollend", release);
  cancelActiveHold = cancel;
  restartQuietTimer();
  scroll();
}

function getInitialAutoHideState(): AutoHideState {
  if (typeof window === "undefined" || window.scrollY <= 0) {
    return "resting";
  }
  // Mid-page reload — assume hidden until spacer geometry syncs in layout effect.
  return "hidden";
}

export function useAutoHideOnScroll(
  spacerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  /** Viewport-y when `revealed`; defaults to `0`. Read each scroll (tracks dynamic parent chrome). */
  getTopOffset?: () => number,
): AutoHideResult {
  const initial = getInitialAutoHideState();
  const [state, setState] = useState<AutoHideState>(initial);
  const stateRef = useRef<AutoHideState>(initial);
  // Ref avoids re-subscribing the scroll listener when callers pass an unmemoized callback.
  const getTopOffsetRef = useRef(getTopOffset);
  getTopOffsetRef.current = getTopOffset;
  // +Infinity so the first scroll reads as "up" (deep-link / scroll restore can land in `revealed`).
  const lastScrollY = useRef(Number.POSITIVE_INFINITY);
  const lastScrollHeight = useRef(0);

  useLayoutEffect(() => {
    if (!enabled) {
      stateRef.current = "resting";
      lastScrollY.current = Number.POSITIVE_INFINITY;
      lastScrollHeight.current = 0;
      setState("resting");
      return;
    }

    const commit = (nextState: AutoHideState) => {
      if (nextState !== stateRef.current) {
        stateRef.current = nextState;
        setState(nextState);
      }
    };

    /** Document height changed — derive state from spacer position only; never reveal chrome. */
    const autoHideStateOnLayoutChange = (rect: DOMRect, topOffset: number): AutoHideState => {
      const nextAtTop = rect.top >= topOffset;
      let next = stateRef.current;

      if (nextAtTop) {
        next = "resting";
      } else if (rect.bottom < -THRESHOLD && next !== "revealed") {
        // Layout-driven scroll (e.g. when table rows are expanded, or rows filtered) — never reveal; pin hidden when past threshold.
        next = "hidden";
      }

      return next;
    };

    const updateAutoHideState = () => {
      const el = spacerRef.current;
      if (!el) return;

      const doc = document.documentElement;
      const currentScrollHeight = doc.scrollHeight;
      const scrollHeightChanged = lastScrollHeight.current !== 0 && currentScrollHeight !== lastScrollHeight.current;
      lastScrollHeight.current = currentScrollHeight;

      // Top of page (or iOS rubber-band overscroll) — stay at the resting top.
      if (window.scrollY <= 0) {
        lastScrollY.current = 0;
        commit("resting");
        return;
      }

      const currentY = window.scrollY;
      // A programmatic scroll is in flight — keep the chrome still, but track the baseline for when it releases.
      if (cancelActiveHold) {
        lastScrollY.current = currentY;
        return;
      }

      const rect = el.getBoundingClientRect();
      const topOffset = getTopOffsetRef.current?.() ?? 0;

      // Document height changed — resync scrollY baseline; apply geometry only (never reveal).
      if (scrollHeightChanged) {
        lastScrollY.current = currentY;
        commit(autoHideStateOnLayoutChange(rect, topOffset));
        return;
      }

      const dy = currentY - lastScrollY.current;
      lastScrollY.current = currentY;

      const atBottom = currentY >= doc.scrollHeight - doc.clientHeight;
      const nextAtTop = rect.top >= topOffset;

      let next: AutoHideState = stateRef.current;
      if (nextAtTop) {
        next = "resting";
      } else if (rect.bottom < -THRESHOLD) {
        // Only flip on vertical movement — horizontal scroll fires with dy === 0.
        if (dy < 0 && !atBottom) next = "revealed";
        else if (dy > 0) next = "hidden";
      }

      commit(next);
    };

    /** A programmatic scroll finished — resync from geometry only, so the chrome never reveals over its target. */
    const onHoldRelease = () => {
      const el = spacerRef.current;
      if (!el) return;
      lastScrollY.current = window.scrollY;
      lastScrollHeight.current = document.documentElement.scrollHeight;
      if (window.scrollY <= 0) return commit("resting");
      commit(autoHideStateOnLayoutChange(el.getBoundingClientRect(), getTopOffsetRef.current?.() ?? 0));
    };

    updateAutoHideState();
    window.addEventListener("scroll", updateAutoHideState, { passive: true });
    holdReleaseListeners.add(onHoldRelease);
    return () => {
      window.removeEventListener("scroll", updateAutoHideState);
      holdReleaseListeners.delete(onHoldRelease);
    };
  }, [enabled, spacerRef]);

  return { state };
}
