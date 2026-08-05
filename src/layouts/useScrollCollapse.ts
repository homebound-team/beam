import { useLayoutEffect, useRef, useState } from "react";

/**
 * Whether the document has scrolled past `restingOffset`, for chrome that collapses on scroll-down and
 * re-expands on scroll-up (even before reaching the top) — e.g. `WorkflowLayout`'s stepper tabs.
 *
 * Unlike `useAutoHideOnScroll`, this tracks plain `window.scrollY` rather than a spacer's rect, since
 * callers here rest at a fixed, computable offset rather than needing a measured DOM anchor.
 */
export function useScrollCollapse(enabled: boolean, restingOffset: number): boolean {
  const [collapsed, setCollapsed] = useState(() => typeof window !== "undefined" && window.scrollY > 0);
  const collapsedRef = useRef(collapsed);
  collapsedRef.current = collapsed;
  // Ref-mirrored so the scroll listener doesn't resubscribe every time this changes.
  const restingOffsetRef = useRef(restingOffset);
  restingOffsetRef.current = restingOffset;
  // +Infinity so a deep-link/scroll-restore landing mid-page reads as "scrolled up" (expands) rather
  // than assumes collapsed.
  const lastScrollYRef = useRef(Number.POSITIVE_INFINITY);
  const lastScrollHeightRef = useRef(0);

  // `restingOffset` changing shifts the sticky chrome's own height, which changes document scrollHeight —
  // resync here so the next scroll tick doesn't mistake that self-inflicted shift for unrelated content
  // resize and immediately re-collapse right after expanding.
  useLayoutEffect(() => {
    lastScrollHeightRef.current = document.documentElement.scrollHeight;
  }, [restingOffset]);

  useLayoutEffect(() => {
    if (!enabled) return;

    const commit = (next: boolean) => {
      if (next !== collapsedRef.current) {
        collapsedRef.current = next;
        setCollapsed(next);
      }
    };

    const updateCollapsed = () => {
      const doc = document.documentElement;
      const currentY = window.scrollY;

      // Top of page (or iOS rubber-band overscroll) — always expanded.
      if (currentY <= 0) {
        lastScrollYRef.current = 0;
        lastScrollHeightRef.current = doc.scrollHeight;
        commit(false);
        return;
      }

      const currentScrollHeight = doc.scrollHeight;
      const scrollHeightChanged =
        lastScrollHeightRef.current !== 0 && currentScrollHeight !== lastScrollHeightRef.current;
      const dy = currentY - lastScrollYRef.current;
      lastScrollYRef.current = currentY;
      lastScrollHeightRef.current = currentScrollHeight;

      if (currentY <= restingOffsetRef.current) return; // Not past the resting position yet.

      if (scrollHeightChanged) {
        // Content resize (e.g. filtered/expanded rows), not a real scroll — collapse only, never reveal.
        commit(true);
        return;
      }

      const atBottom = currentY >= doc.scrollHeight - doc.clientHeight;
      // dy is 0 on horizontal-only scroll, which leaves state unchanged below.
      if (dy > 0) commit(true);
      else if (dy < 0 && !atBottom) commit(false);
    };

    updateCollapsed();
    window.addEventListener("scroll", updateCollapsed, { passive: true });
    return () => window.removeEventListener("scroll", updateCollapsed);
  }, [enabled]);

  return collapsed;
}
