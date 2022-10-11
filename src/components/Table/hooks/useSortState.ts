import { useCallback, useMemo, useState } from "react";
import { GridSortConfig } from "src/components/Table/GridTable";
import { Direction, GridColumn, Kinded } from "src/components/Table/types";
import { ASC, DESC } from "src/components/Table/utils";

/**
 * Our internal sorting state.
 *
 * `S` is, for whatever current column we're sorting by, either it's:
 *
 * a) `serverSideSortKey` if we're server-side sorting, or
 * b) it's index in the `columns` array, if client-side sorting
 */
export type SortState<S> = readonly [S, Direction, S | undefined, Direction | undefined];

export type SortOn = "client" | "server" | undefined;

/** Small custom hook that wraps the "setSortColumn inverts the current sort" logic. */
export function useSortState<R extends Kinded, S>(
  columns: GridColumn<R, S>[],
  sorting?: GridSortConfig<S>,
): [SortState<S> | undefined, (value: S) => void, SortOn, boolean] {
  // If we're server-side sorting, use the caller's `sorting.value` prop to initialize our internal
  // `useState`. After this, we ignore `sorting.value` because we assume it should match what our
  // `setSortState` just changed anyway (in response to the user sorting a column).
  const initialSortState: SortState<S> | undefined = useMemo(
    () => {
      if (sorting?.on === "client") {
        const { initial, primary } = sorting;
        const primaryKey =
          primary && (typeof primary[0] === "number" ? primary[0] : columns.indexOf(primary[0] as any));
        if (initial === undefined && "initial" in sorting) {
          // if explicitly set to `undefined`, then do not sort
          return undefined;
        } else if (initial) {
          const key = typeof initial[0] === "number" ? initial[0] : columns.indexOf(initial[0] as any);

          return [key as any as S, initial[1], primaryKey as any as S, primary?.[1]];
        } else {
          // If no explicit sorting, assume 1st column ascending
          const firstSortableColumn = columns.findIndex((c) => c.clientSideSort !== false);
          return [firstSortableColumn as any as S, ASC, primaryKey as any as S, primary?.[1]];
        }
      } else {
        return sorting?.value ? [sorting?.value[0], sorting?.value[1], undefined, undefined] : undefined;
      }
    },
    // We want to allow the user to not memoize `GridTableProps.sorting` b/c for the
    // initialSortState calc, it's just a bunch of surely hard-coded primitives like
    // sort on client/server, which column is initial.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columns],
  );
  const [sortState, setSortState] = useState<SortState<S> | undefined>(initialSortState);

  // Make a custom setSortKey that is useState-like but contains the ASC->DESC->RESET logic.
  const onSort = sorting?.on === "server" ? sorting.onSort : undefined;
  const setSortKey = useCallback(
    (clickedKey: S) => {
      const newState = deriveSortState(sortState, clickedKey, initialSortState);
      setSortState(newState);
      if (onSort) {
        const [newKey, newDirection] = newState ?? [undefined, undefined];
        onSort(newKey, newDirection);
      }
    },
    // Note that sorting.onSort is not listed here, so we bind to whatever the 1st sorting.onSort was
    [initialSortState, sortState, onSort],
  );

  // If sorting is done on the client, the by default the sort will NOT be case sensitive
  const caseSensitive = sorting?.on === "client" ? !!sorting.caseSensitive : false;

  return [sortState, setSortKey, sorting?.on, caseSensitive];
}

// Exported for testing purposes
export function deriveSortState<S>(
  currentSortState: SortState<S> | undefined,
  clickedKey: S,
  initialSortState: SortState<S> | undefined,
): SortState<S> | undefined {
  const [currentKey, currentDirection] = currentSortState || [];

  // If the current sort state is not defined, or clicking a new column, then sort ASC on the clicked key
  if (!currentSortState || clickedKey !== currentKey) {
    return [clickedKey, ASC, initialSortState?.[2], initialSortState?.[3]];
  }

  // If there is an `initialSortState` and we're clicking on that same key, then flip the sort.
  // Handles cases where the initial sort is DESC so that we can allow for DESC to ASC sorting.
  if (initialSortState && initialSortState[0] === clickedKey) {
    return [clickedKey, currentDirection === ASC ? DESC : ASC, initialSortState?.[2], initialSortState?.[3]];
  }

  // Otherwise when clicking the current column, toggle through sort states
  if (currentDirection === ASC) {
    // if ASC -> go to desc
    return [clickedKey, DESC, initialSortState?.[2], initialSortState?.[3]];
  }

  // Else, direction is already DESC, so revert to original sort value.
  return initialSortState;
}
