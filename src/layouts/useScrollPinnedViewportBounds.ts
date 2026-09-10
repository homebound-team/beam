import { type RefObject, useCallback, useLayoutEffect, useRef, useState } from "react";

export type ScrollPinnedViewportBounds = {
  topPx: number;
  heightPx: number;
};

/** Viewport top/height for fixed overlays that follow an in-flow anchor, then pin below sticky chrome on scroll. */
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
