import { useCallback, useMemo, useState } from "react";
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
  const initialSortValue: SortState<S> | undefined = useMemo(() => {
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
  }, [sorting, columns]);
  const [sortState, setSortState] = useState<SortState<S> | undefined>(initialSortValue);

  // Make a custom setSortKey that is useState-like but contains the ASC->DESC->RESET logic.
  const setSortKey = useCallback(
    (clickedKey: S) => {
      const [currentKey, currentDirection] = sortState || [];

      // If sorting on a new key -> ASC this key.
      if (clickedKey !== currentKey) {
        setSortState([clickedKey, ASC]);

        if (sorting?.on === "server") {
          sorting.onSort(clickedKey, ASC);
        }
        return;
      }

      // Otherwise when clicking the current column, toggle through sort states
      if (currentDirection === ASC) {
        // if ASC -> go to desc
        setSortState([clickedKey, DESC]);

        if (sorting?.on === "server") {
          sorting.onSort(clickedKey, DESC);
        }
        return;
      }

      if (currentDirection === DESC) {
        // If DESC, then reset to initial sort
        setSortState(initialSortValue);
        if (sorting?.on === "server") {
          const [initialKey, initialDirection] = initialSortValue ? initialSortValue : [undefined, undefined];
          sorting.onSort(initialKey, initialDirection);
        }
      }
    },
    // Note that sorting.onSort is not listed here, so we bind to whatever the 1st sorting.onSort was
    [sortState, setSortState],
  );

  return [sortState, setSortKey];
}
