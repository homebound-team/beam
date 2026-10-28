import { type RefObject, useCallback, useLayoutEffect, useRef, useState } from "react";

export type ScrollPinnedViewportBounds = {
  topPx: number;
  /** True once pinned, i.e. `topPx` tracks the sticky chrome instead of the scrolling anchor. */
  isPinned: boolean;
};

/**
 * Viewport top for a fixed overlay that follows an in-flow anchor, then pins below sticky chrome.
 *
 * i.e. the overlay pane tracks the layout root (`anchorRef`) as the page scrolls; once that box hits
 * `getPinTopPx` (navbar + page header + table actions), `top` stays there.
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
    setBounds((prev) => (prev?.topPx === topPx && prev?.isPinned === isPinned ? prev : { topPx, isPinned }));
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
    // Chrome writes the pin offset's vars onto the anchor's ancestors when it re-renders, which lands after the scroll
    // that hid or revealed it, so also re-sync on those style changes
    const styleObserver = new MutationObserver(syncBounds);
    for (let node = anchorRef.current; node; node = node.parentElement) {
      styleObserver.observe(node, { attributes: true, attributeFilter: ["style"] });
    }
    return () => {
      window.removeEventListener("scroll", syncBounds);
      window.removeEventListener("resize", syncBounds);
      styleObserver.disconnect();
    };
  }, [enabled, syncBounds, anchorRef]);

  return bounds;
}
