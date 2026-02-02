import { useMemo } from "react";

/**
 * Track a table's scroll row index in `sessionStorage`, scoped to pathname + `tableId`.
 * Key: `scrollPosition_${window.location.pathname}_${tableId}`. Browser-only.
 * If `enabled` is false, reads return `undefined` (writes still allowed).
 *
 * @param tableId - Stable table identifier for the route.
 * @param enabled - Disable reads; defaults to true.
 */
export function useScrollStorage(tableId: string, enabled: boolean = true) {
  const storageKey = `scrollPosition_${window.location.pathname}_${tableId}`;

  return useMemo(
    () => ({
      getScrollIndex: () => {
        if (!enabled) return undefined;
        const value = sessionStorage.getItem(storageKey);
        return value === null ? undefined : parseInt(value, 10);
      },
      setScrollIndex: (index: number) => {
        sessionStorage.setItem(storageKey, index.toString());
      },
    }),
    [storageKey, enabled],
  );
}
