import { useCallback, useState } from "react";
import { ASC, DESC, Direction, GridColumn, GridSortConfig, Kinded } from "src/components/Table/GridTable";

/**
 * Our internal sorting state.
 *
 * `S` is, for whatever current column we're sorting by, either it's:
 *
 * a) `serverSideSortKey` if we're server-side sorting, or
 * b) it's index in the `columns` array, if client-side sorting
 */
export type SortState<S> = readonly [S, Direction];

/** Small custom hook that wraps the "setSortColumn inverts the current sort" logic. */
export function useSortState<R extends Kinded, S>(
  columns: GridColumn<R, S>[],
  sorting?: GridSortConfig<S>,
): [SortState<S> | undefined, (value: S) => void] {
  // If we're server-side sorting, use the caller's `sorting.value` prop to initialize our internal
  // `useState`. After this, we ignore `sorting.value` because we assume it should match what our
  // `setSortState` just changed anyway (in response to the user sorting a column).
  const [sortState, setSortState] = useState<SortState<S> | undefined>(() => {
    if (sorting?.on === "client") {
      const { initial } = sorting;
      if (initial) {
        const key = typeof initial[0] === "number" ? initial[0] : columns.indexOf(initial[0] as any);
        return [key as any as S, initial[1]];
      } else {
        // If no explicit sorting, assume 1st column ascending
        const firstSortableColumn = columns.findIndex((c) => c.clientSideSort !== false);
        return [firstSortableColumn as any as S, "ASC"];
      }
    } else {
      return sorting?.value;
    }
  });

  // Make a custom setSortKey that is useState-like but contains the invert-if-same-column-clicked-twice logic.
  const setSortKey = useCallback(
    (clickedKey: S) => {
      const [currentKey, currentDirection] = sortState || [];
      const [newKey, newDirection] =
        // If clickedKey === currentKey, then toggle direction
        clickedKey === currentKey
          ? [currentKey, currentDirection === ASC ? DESC : currentDirection === DESC ? undefined : ASC]
          : // Otherwise, use the new key, and default to ascending
            [clickedKey, ASC];
      setSortState([newKey, newDirection]);
      if (sorting?.on === "server") {
        sorting.onSort(newKey, newDirection);
      }
    },
    // Note that sorting.onSort is not listed here, so we bind to whatever the 1st sorting.onSort was
    [sortState, setSortState],
  );

  return [sortState, setSortKey];
}
