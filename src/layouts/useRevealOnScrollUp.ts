import { type RefObject, useLayoutEffect, useRef } from "react";

/**
 * `resting` sits on its reserve element. `following` moves with the reserve element while any of it is still on screen.
 * `hidden` is off screen after the reserve element has left, and `revealed` is pinned again after an upward scroll.
 */
export type RevealState = "resting" | "hidden" | "revealed" | "following";

/** Where the fixed element is for one scroll. `visibleHeight` is the part still below its pin line. */
export type RevealFrame = {
  state: RevealState;
  visibleHeight: number;
  /** Top of the reserve element in the viewport. The fixed element (e.g. the navbar or page header) uses this as `top` while `following`. */
  reserveTop: number;
};

type UseRevealOnScrollUpOptions = {
  /** Runs on each scroll, in that same frame. Callers write `top` and the height variable here. */
  onScroll?: (frame: RevealFrame) => void;
};

type RevealScrollListener = {
  el: HTMLElement;
  onScroll: () => void;
};

export function useRevealOnScrollUp(
  reserveElRef: RefObject<HTMLElement | null>,
  /** Viewport y where the reserve element rests. Defaults to `0`. Read each scroll. */
  getPinLine?: () => number,
  options?: UseRevealOnScrollUpOptions,
): void {
  const initial = getInitialRevealState();
  const stateRef = useRef<RevealState>(initial);
  // Ref avoids re-subscribing the scroll listener when callers pass an unmemoized callback.
  const getPinLineRef = useRef(getPinLine);
  getPinLineRef.current = getPinLine;
  const onScrollRef = useRef(options?.onScroll);
  onScrollRef.current = options?.onScroll;
  // +Infinity so the first scroll reads as "up" (deep-link / scroll restore can land in `revealed`).
  const lastScrollY = useRef(Number.POSITIVE_INFINITY);
  const lastScrollHeight = useRef(0);

  // After commit, so the reserve element can be measured and the first `top` is written before paint.
  // The ref is stable, so this runs once; later scrolls come from the listener.
  useLayoutEffect(() => {
    function publish(rect: DOMRect, topOffset: number, next: RevealState) {
      stateRef.current = next;
      const nextFrame: RevealFrame = {
        state: next,
        visibleHeight: visibleHeightFor(next, rect, topOffset),
        reserveTop: Math.round(rect.top),
      };
      onScrollRef.current?.(nextFrame);
    }

    function updateRevealState() {
      const el = reserveElRef.current;
      if (!el) return;

      const doc = document.documentElement;
      const currentScrollHeight = doc.scrollHeight;
      const scrollHeightChanged = lastScrollHeight.current !== 0 && currentScrollHeight !== lastScrollHeight.current;
      lastScrollHeight.current = currentScrollHeight;

      // Top of page (or iOS rubber-band overscroll) — stay at the resting top.
      if (window.scrollY <= 0) {
        lastScrollY.current = 0;
        publish(el.getBoundingClientRect(), getPinLineRef.current?.() ?? 0, "resting");
        return;
      }

      const currentY = window.scrollY;
      // A programmatic scroll is in flight — keep the chrome still, but track the baseline for when it releases.
      if (cancelActiveHold) {
        lastScrollY.current = currentY;
        return;
      }

      const rect = el.getBoundingClientRect();
      const topOffset = getPinLineRef.current?.() ?? 0;

      // Document height changed — resync scrollY baseline; apply geometry only (never reveal).
      if (scrollHeightChanged) {
        lastScrollY.current = currentY;
        publish(rect, topOffset, nextRevealStateOnLayoutChange(rect, topOffset, stateRef.current));
        return;
      }

      const dy = currentY - lastScrollY.current;
      lastScrollY.current = currentY;
      const atBottom = currentY >= doc.scrollHeight - doc.clientHeight;
      publish(rect, topOffset, nextRevealState(rect, topOffset, dy, atBottom, stateRef.current));
    }

    /** A programmatic scroll finished — resync from geometry only, so the chrome never reveals over its target. */
    function onHoldRelease() {
      const el = reserveElRef.current;
      if (!el) return;
      lastScrollY.current = window.scrollY;
      lastScrollHeight.current = document.documentElement.scrollHeight;
      const topOffset = getPinLineRef.current?.() ?? 0;
      const rect = el.getBoundingClientRect();
      const next = window.scrollY <= 0 ? "resting" : nextRevealStateOnLayoutChange(rect, topOffset, stateRef.current);
      publish(rect, topOffset, next);
    }

    const el = reserveElRef.current;
    if (!el) return;
    const unsubscribe = subscribeRevealScroll(el, updateRevealState);
    // Mount takes the same top-to-bottom pass as a scroll.
    onRevealScroll();
    holdReleaseListeners.add(onHoldRelease);
    return () => {
      unsubscribe();
      holdReleaseListeners.delete(onHoldRelease);
    };
  }, [reserveElRef]);
}

/**
 * Runs a programmatic window scroll while the navbar and page header hold their current reveal state.
 *
 * Otherwise a smooth scroll back up reveals the chrome mid-scroll, which pushes pinned content (e.g. table actions)
 * down over the target that `scroll-margin-top` had already measured. Releases on `scrollend`, once scrolling goes
 * quiet, or as soon as the user scrolls themselves.
 */
export function holdRevealWhile(scroll: () => void): void {
  cancelActiveHold?.();
  let quietTimer: ReturnType<typeof setTimeout>;
  function restartQuietTimer() {
    clearTimeout(quietTimer);
    quietTimer = setTimeout(release, HOLD_QUIET_MS);
  }
  function cancel() {
    clearTimeout(quietTimer);
    window.removeEventListener("scroll", restartQuietTimer);
    for (const event of userScrollEvents) window.removeEventListener(event, release);
    window.removeEventListener("scrollend", release);
    cancelActiveHold = undefined;
  }
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

function getInitialRevealState(): RevealState {
  if (typeof window === "undefined" || window.scrollY <= 0) {
    return "resting";
  }
  // Mid-page reload — assume hidden until reserve element geometry syncs in layout effect.
  return "hidden";
}

/** Height still below the pin line. Full height while resting or revealed; none once hidden. */
function visibleHeightFor(state: RevealState, rect: DOMRect, topOffset: number): number {
  if (state === "hidden") return 0;
  const height = Math.max(0, Math.round(rect.height));
  if (state !== "following") return height;
  return Math.max(0, Math.min(height, Math.round(rect.bottom - topOffset)));
}

/**
 * Follows the reserve element until it leaves, then hides on the way down and pins on the way up.
 * A revealed header stays pinned until it is at rest or the user scrolls it off again.
 */
function nextRevealState(
  rect: DOMRect,
  topOffset: number,
  dy: number,
  atBottom: boolean,
  prev: RevealState,
): RevealState {
  const atRest = rect.top >= topOffset - 0.5;
  const reserveOut = rect.bottom <= topOffset + 0.5;
  if (atRest) return "resting";
  // Stay pinned on the way back up. Scroll down once it has left hides it again.
  if (prev === "revealed") return reserveOut && dy > 0 ? "hidden" : "revealed";
  if (!reserveOut) return "following";
  // Only flip on vertical movement — horizontal scroll fires with dy === 0.
  if (dy < 0 && !atBottom) return "revealed";
  if (dy > 0) return "hidden";
  return prev === "following" ? "hidden" : prev;
}

/** Document height changed — derive state from the reserve element; never reveal chrome that was hidden. */
function nextRevealStateOnLayoutChange(rect: DOMRect, topOffset: number, prev: RevealState): RevealState {
  const atRest = rect.top >= topOffset - 0.5;
  const reserveOut = rect.bottom <= topOffset + 0.5;
  if (window.scrollY <= 0 || atRest) return "resting";
  if (prev === "hidden" || prev === "revealed") return prev;
  return reserveOut ? "hidden" : "following";
}

/**
 * Re-runs each subscribed navbar and page header, top to bottom.
 *
 * `useScrollWithPage` calls this when a measured height changes a pin line without a scroll.
 */
export function syncRevealScroll(): void {
  onRevealScroll();
}

function onRevealScroll() {
  // Read every top before any callback writes, so ordering costs one layout rather than one per fixed element.
  const ordered = [...revealScrollListeners]
    .map((listener) => ({ listener, top: listener.el.getBoundingClientRect().top }))
    .sort((a, b) => a.top - b.top);
  for (const { listener } of ordered) listener.onScroll();
}

function subscribeRevealScroll(el: HTMLElement, onScroll: () => void): () => void {
  const listener = { el, onScroll };
  revealScrollListeners.add(listener);
  if (revealScrollListeners.size === 1) {
    window.addEventListener("scroll", onRevealScroll, { passive: true });
  }
  return function unsubscribe() {
    revealScrollListeners.delete(listener);
    if (revealScrollListeners.size === 0) window.removeEventListener("scroll", onRevealScroll);
  };
}

/** How long the window must go without scrolling before a hold releases, for browsers without `scrollend`. */
export const HOLD_QUIET_MS = 150;

/** Cancels the active hold's listeners and timer, if a programmatic scroll is in flight. */
let cancelActiveHold: (() => void) | undefined;
const holdReleaseListeners = new Set<() => void>();
// Not `keydown`, since typing in a table's search box is what triggers some of these scrolls.
const userScrollEvents = ["wheel", "touchstart"] as const;

/** One window listener. Fixed elements run top to bottom, so each reads the fixed element above it from this scroll. */
const revealScrollListeners = new Set<RevealScrollListener>();
