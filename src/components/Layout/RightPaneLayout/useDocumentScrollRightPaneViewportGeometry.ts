import { RefObject, useCallback, useLayoutEffect, useState } from "react";
import { stickyTableHeaderOffsetPx } from "src/layouts/layoutVars";

export type DocumentScrollRightPaneViewportGeometry = {
  topPx: number;
  heightPx: number;
};

/** Viewport-relative top/height from an anchor, pinned below sticky table chrome when scrolled. */
export function useDocumentScrollRightPaneViewportGeometry(
  anchorRef: RefObject<HTMLElement | null>,
  enabled: boolean,
): DocumentScrollRightPaneViewportGeometry | undefined {
  const [geometry, setGeometry] = useState<DocumentScrollRightPaneViewportGeometry | undefined>();

  const syncGeometry = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const stickyTopPx = stickyTableHeaderOffsetPx(el);
    const isPinned = rect.top <= stickyTopPx + 1;
    const topPx = isPinned ? stickyTopPx : Math.round(rect.top);
    const heightPx = Math.max(0, Math.round(window.innerHeight - topPx));
    setGeometry((prev) => (prev?.topPx === topPx && prev?.heightPx === heightPx ? prev : { topPx, heightPx }));
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!enabled) {
      setGeometry(undefined);
      return;
    }

    syncGeometry();
    window.addEventListener("scroll", syncGeometry, { passive: true });
    window.addEventListener("resize", syncGeometry);
    return () => {
      window.removeEventListener("scroll", syncGeometry);
      window.removeEventListener("resize", syncGeometry);
    };
  }, [enabled, syncGeometry]);

  return geometry;
}
