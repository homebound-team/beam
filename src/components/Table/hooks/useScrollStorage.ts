import { useMemo } from "react";
import { usePageSessionStorage } from "src/hooks";

/**
 * Track a table's scroll row index in `sessionStorage`, scoped to pathname + search + `tableId`.
 * The storage key is derived by `usePageSessionStorage("scrollPosition", tableId, { includeSearch: true })`.
 * If `enabled` is false, reads return `undefined` (writes still allowed).
 *
 * Including search params ensures that different filter states have separate scroll positions,
 * preventing invalid scroll restoration when filters change the data set size.
 *
 * @param tableId - Stable table identifier for the route.
 * @param enabled - Disable reads; defaults to true.
 */
export function useScrollStorage(tableId: string, enabled: boolean = true) {
  const storage = usePageSessionStorage("scrollPosition", tableId, { includeSearch: true });

  return useMemo(
    () => ({
      getScrollIndex: () => {
        if (!enabled) return undefined;
        const value = storage.getItem();
        return value === null ? undefined : parseInt(value, 10);
      },
      setScrollIndex: (index: number) => {
        storage.setItem(index.toString());
      },
    }),
    [enabled, storage],
  );
}
