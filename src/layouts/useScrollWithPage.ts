import { type RefObject, useLayoutEffect, useRef } from "react";
import { beamStickyTopTransitionVar } from "src/layouts/layoutVars";
import { type RevealFrame, syncRevealScroll, useRevealOnScrollUp } from "src/layouts/useRevealOnScrollUp";

/** `top`, the height still on screen, and the hide/reveal slide for one fixed navbar or page header. */
type ScrollWithPage = {
  top: string;
  visibleHeight: number;
  transition: string;
};

type UseScrollWithPageOptions = {
  /** Element that publishes `heightVar` as a CSS variable. */
  heightElRef: RefObject<HTMLElement | null>;
  /** The `position: fixed` navbar or page header. */
  fixedElRef: RefObject<HTMLElement | null>;
  /** In-flow element that reserves the fixed element's space. The fixed element follows it until it leaves the viewport. */
  reserveElRef: RefObject<HTMLElement | null>;
  /** Measured height of the fixed element. */
  height: number;
  /** CSS `top` while the element is at rest or pinned back in. */
  restingTop: string;
  /** CSS variable for the height still on screen. */
  heightVar: string;
  /** Viewport y where the reserve element sits when the page is scrolled to the top. Read each scroll. */
  getReserveRestTop: () => number;
  /** Called with the height still on screen each scroll. */
  onVisibleHeight?: (visibleHeight: number) => void;
};

/** Keeps a fixed navbar or page header on its reserve element until that element leaves the viewport. */
export function useScrollWithPage(options: UseScrollWithPageOptions): void {
  const { heightElRef, fixedElRef, reserveElRef, height, restingTop, heightVar, getReserveRestTop, onVisibleHeight } =
    options;
  const heightRef = useRef(height);
  heightRef.current = height;
  const restingTopRef = useRef(restingTop);
  restingTopRef.current = restingTop;
  const getReserveRestTopRef = useRef(getReserveRestTop);
  getReserveRestTopRef.current = getReserveRestTop;
  const onVisibleHeightRef = useRef(onVisibleHeight);
  onVisibleHeightRef.current = onVisibleHeight;
  const isFollowing = useRef(false);
  const frameRef = useRef<RevealFrame>({ state: "resting", visibleHeight: 0, reserveTop: 0 });
  const hasFrame = useRef(false);

  // The first frame has no slide, so the measured top does not animate into place.
  const paintedRef = useRef(false);
  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => {
      paintedRef.current = true;
    });
    return () => cancelAnimationFrame(id);
  }, []);

  function write(frame: RevealFrame) {
    const scroll = styleForFrame(frame, heightRef.current, restingTopRef.current);
    onVisibleHeightRef.current?.(scroll.visibleHeight);
    writeScrollWithPage(heightElRef.current, fixedElRef.current, scroll, heightVar, paintedRef.current);
  }

  useRevealOnScrollUp(reserveElRef, () => getReserveRestTopRef.current(), {
    onScroll: (next) => {
      frameRef.current = next;
      hasFrame.current = true;
      // Before the height changes, so a hide or reveal eases and a per-frame follow does not.
      updateFollowingCount(isFollowing, next.state === "following");
      write(next);
    },
  });

  // Measurement changes `height` without a scroll. The fixed element below reads that height, so re-run the pass.
  useLayoutEffect(() => {
    if (!hasFrame.current) return;
    const scroll = styleForFrame(frameRef.current, height, restingTop);
    onVisibleHeightRef.current?.(scroll.visibleHeight);
    writeScrollWithPage(heightElRef.current, fixedElRef.current, scroll, heightVar, paintedRef.current);
    syncRevealScroll();
  }, [height, restingTop, heightVar, heightElRef, fixedElRef]);
  useLayoutEffect(() => () => onVisibleHeightRef.current?.(0), []);
  useLayoutEffect(() => () => updateFollowingCount(isFollowing, false), []);
}

/**
 * Returns the fixed element's `top`, visible height, and slide for one scroll frame.
 *
 * Following tracks the reserve element with no slide. Resting has no slide either, because its top can be the navbar height variable, which changes every frame.
 *
 * Hidden and revealed slide.
 */
function styleForFrame(frame: RevealFrame, height: number, restingTop: string): ScrollWithPage {
  if (frame.state === "hidden") {
    return { top: `calc(${restingTop} - ${height}px)`, visibleHeight: 0, transition: hideRevealSlide };
  }
  if (frame.state === "revealed") {
    return { top: restingTop, visibleHeight: height, transition: hideRevealSlide };
  }
  if (frame.state === "following") {
    return { top: `${frame.reserveTop}px`, visibleHeight: frame.visibleHeight, transition: "" };
  }
  return { top: restingTop, visibleHeight: height, transition: "" };
}

/** Counts this element as following or not. Sticky `top` eases only while the count is zero. */
function updateFollowingCount(isFollowing: RefObject<boolean>, following: boolean): void {
  if (isFollowing.current === following) return;
  isFollowing.current = following;
  followingCount += following ? 1 : -1;
  if (typeof document === "undefined") return;
  if (followingCount > 0) document.documentElement.style.setProperty(beamStickyTopTransitionVar, "none");
  else document.documentElement.style.removeProperty(beamStickyTopTransitionVar);
}

/** Writes `top` and the height still on screen on the elements. */
function writeScrollWithPage(
  heightEl: HTMLElement | null,
  fixedEl: HTMLElement | null,
  scroll: ScrollWithPage,
  heightVar: string,
  animate: boolean,
): void {
  if (!heightEl || !fixedEl) return;
  if (scroll.visibleHeight > 0) heightEl.style.setProperty(heightVar, `${scroll.visibleHeight}px`);
  else heightEl.style.removeProperty(heightVar);
  if (animate) fixedEl.style.transition = scroll.transition;
  fixedEl.style.top = scroll.top;
}

// Same value as `Css.transitionAll`. Only the hide and the pin-back use it.
const hideRevealSlide = "all 200ms cubic-bezier(0.4, 0, 0.2, 1)";

/** How many navbars or page headers are still moving with the scroll. */
let followingCount = 0;
