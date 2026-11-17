import type { MutableRefObject } from "react";
import type { ListRange } from "react-virtuoso";
import type { GridDataRow } from "src/components/Table/components/Row";
import type { GridTableApi, GridTableApiImpl } from "src/components/Table/GridTableApi";
import { type GridColumnWithId, type Kinded, nonKindGridColumnKeys } from "src/components/Table/types";
import { isContentColumn } from "src/components/Table/utils/columns";

/**
 * Allows a caller to ask for the currently shown rows, given the current sorting/filtering.
 *
 * @deprecated Use the `GridTableApi` methods each of these delegates to.
 */
export type GridRowLookup<R extends Kinded> = {
  /** @deprecated Use `api.getAdjacentRows`. */
  lookup: GridTableApi<R>["getAdjacentRows"];

  /** @deprecated Use `api.getVisibleRows`. */
  currentList(): readonly GridDataRow<R>[];

  /** @deprecated Use `api.scrollToRow`. */
  scrollTo(kind: R["kind"], id: string): void;
};

/** @deprecated Use `GridTableApi` directly. */
export function createRowLookup<R extends Kinded>(api: GridTableApiImpl<R>): GridRowLookup<R> {
  return {
    lookup: api.getAdjacentRows,
    currentList: () => api.getVisibleRows(),
    scrollTo: (kind, id) => api.scrollToRow(kind, id),
  };
}

export function getKinds<R extends Kinded>(columns: GridColumnWithId<R>[]): R[] {
  return Object.keys(columns.find((c) => isContentColumn(c)) || {}).filter(
    (key) => !nonKindGridColumnKeys.includes(key),
  ) as any;
}

/** Optionally takes into consideration if a row is already in view before attempting to scroll to it. */
export function shouldSkipScrollTo(index: number, virtuosoRangeRef: MutableRefObject<ListRange | null>) {
  if (!virtuosoRangeRef.current) return false;

  const isAlreadyInView =
    // Add 1 on each end to account for "overscan" where the next out of view row is usually already rendered. This isn't a perfect solution,
    // but our current "overscan" is only set to 50px, so it should be close enough and the library recommended alternative of adding an
    // intersection observer to each row seems like a not worth it performance hit (https://github.com/petyosi/react-virtuoso/issues/118)
    index >= virtuosoRangeRef.current.startIndex - 1 && index <= virtuosoRangeRef.current.endIndex + 1;

  return isAlreadyInView;
}
