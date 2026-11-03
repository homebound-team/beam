import { useResizeObserver } from "@react-aria/utils";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

/**
 * Tracks whether a two-slot toolbar should use its compact format: when the gap between its left and
 * right slots would be under `toolbarMinSlotGapPx`.
 *
 * The compact controls are narrower, so measuring the gap while compact would flip straight back.
 * Instead, while full size we remember how much of the row the slots need, and only leave compact
 * once the row is wide enough to fit them again.
 *
 * Known gap: if the full slots shrink while compact (e.g. the selection pill clears), we stay compact
 * until the row next resizes.
 *
 * @param enabled When `false`, measurement is skipped and `compact` is forced to `false`.
 */
export function useToolbarCompact(enabled: boolean) {
  const rowRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);
  // Row width minus the gap, measured while full size
  const fullSlotsWidth = useRef(0);

  const measure = useCallback(() => {
    const row = rowRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    // A row that hasn't been laid out (e.g. jsdom) reports 0 widths, so there's nothing to compare against
    if (!enabled || !row || !left || !right || row.clientWidth === 0) {
      setCompact(false);
      return;
    }
    if (!compact) {
      const gap = right.getBoundingClientRect().left - left.getBoundingClientRect().right;
      fullSlotsWidth.current = row.clientWidth - gap;
    }
    setCompact(row.clientWidth - fullSlotsWidth.current < toolbarMinSlotGapPx);
  }, [enabled, compact]);

  // Measure pre-paint on mount and after every flip, so leaving compact re-validates against the fresh full slots
  useLayoutEffect(measure, [measure]);
  // The row resizing changes the room available; the slots resizing (while full) changes the room needed
  useResizeObserver({ ref: rowRef, onResize: measure });
  useResizeObserver({ ref: leftRef, onResize: measure });
  useResizeObserver({ ref: rightRef, onResize: measure });

  return { rowRef, leftRef, rightRef, compact };
}

/** Below this gap between the left and right slots, the toolbar switches to its compact (mobile) format. */
export const toolbarMinSlotGapPx = 40;
