import { type RefObject, useCallback, useLayoutEffect, useRef, useState } from "react";

export type ScrollPinnedViewportBounds = {
  topPx: number;
  heightPx: number;
};

/**
 * Viewport top/height for a fixed overlay that follows an in-flow anchor, then pins below sticky chrome.
 *
 * i.e. the overlay pane tracks the layout root (`anchorRef`) as the page scrolls; once that box hits
 * `getPinTopPx` (navbar + page header + table actions), `top` stays there and height is the rest of the viewport.
 *
 * ```
 * [banner / nav / header]  ← pin top
 * [ layout root         ]  ← in-flow anchor (table / form body)
 * [  ...scroll...       ]
 *                    [pane]  ← fixed; top = max(anchor.top, pin)
 * ```
 */
export function useScrollPinnedViewportBounds(
  anchorRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  getPinTopPx: (el: Element) => number,
): ScrollPinnedViewportBounds | undefined {
  const [bounds, setBounds] = useState<ScrollPinnedViewportBounds | undefined>();
  const getPinTopPxRef = useRef(getPinTopPx);

  const syncBounds = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const pinTopPx = getPinTopPxRef.current(el);
    const isPinned = rect.top <= pinTopPx + 1;
    const topPx = isPinned ? pinTopPx : Math.round(rect.top);
    const heightPx = Math.max(0, Math.round(window.innerHeight - topPx));
    setBounds((prev) => (prev?.topPx === topPx && prev?.heightPx === heightPx ? prev : { topPx, heightPx }));
  }, [anchorRef]);

  useLayoutEffect(() => {
    getPinTopPxRef.current = getPinTopPx;
  }, [getPinTopPx]);

  useLayoutEffect(() => {
    if (!enabled) {
      setBounds(undefined);
      return;
    }

    syncBounds();
    window.addEventListener("scroll", syncBounds, { passive: true });
    window.addEventListener("resize", syncBounds);
    return () => {
      window.removeEventListener("scroll", syncBounds);
      window.removeEventListener("resize", syncBounds);
    };
  }, [enabled, syncBounds]);

  return bounds;
}
