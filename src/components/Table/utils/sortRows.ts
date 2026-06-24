import { ReactNode } from "react";
import { GridCellContent } from "src/components/Table/components/cell";
import type { GridDataRow } from "src/components/Table/components/Row";
import { FixedSort, GridColumnWithId, Kinded } from "src/components/Table/types";
import { SortOn, SortState } from "src/components/Table/utils/TableState";
import { applyRowFn } from "src/components/Table/utils/utils";
import { Temporal } from "temporal-polyfill";

// Returns a shallow copy of the `rows` parameter sorted based on `sortState`
// We really only use this for tests; in production the RowState.visibleSortedChildren uses the sortFn
export function sortRows<R extends Kinded>(
  columns: GridColumnWithId<R>[],
  rows: GridDataRow<R>[],
  sortState: SortState,
  caseSensitive: boolean,
): GridDataRow<R>[] {
  const fn = sortFn(columns, sortState, caseSensitive);
  // Sort this level first
  const sorted = [...rows].sort(fn);
  // Recursively sort child rows
  sorted.forEach((row, i) => {
    if (row.children) {
      sorted[i].children = sortRows(columns, row.children, sortState, caseSensitive);
    }
  });
  return sorted;
}

/** Creates a comparator for two GridDataRows based on the current sortState. */
export function sortFn<R extends Kinded>(
  columns: GridColumnWithId<R>[],
  sortState: SortState,
  caseSensitive: boolean,
): (a: GridDataRow<R>, b: GridDataRow<R>) => number {
  // When client-side sort, the sort value is the column index
  const { current, persistent } = sortState ?? {};
  const { columnId, direction } = current ?? {};
  const { columnId: persistentSortColumnId, direction: persistentSortDirection } = persistent ?? {};

  const column = columns.find((c) => c.id! === columnId);
  const invert = direction === "DESC";
  const primaryInvert = persistentSortDirection === "DESC";
  const primaryColumn = persistentSortColumnId && columns.find((c) => c.id! === persistentSortColumnId);

  return (a, b) => {
    if (a.fixedSort || b.fixedSort) {
      // If both rows are fixed-sorted, we don't sort within them, because the page is taking
      // explicit ownership over the order of the rows (and we also don't support "levels", i.e.
      // for change events putting "just added" rows `fixedSort: last` and the "add new" row first).
      const aFixedSort = getFixedSort(a.fixedSort);
      const bFixedSort = getFixedSort(b.fixedSort);
      const ap = aFixedSort === "first" ? -1 : aFixedSort === "last" ? 1 : 0;
      const bp = bFixedSort === "first" ? -1 : bFixedSort === "last" ? 1 : 0;
      return ap === bp ? 0 : ap < bp ? -1 : 1;
    } else if (primaryColumn) {
      // When primary key exist sort that priority first
      const primaryCompare = compare(primaryColumn, a, b, primaryInvert, caseSensitive);
      // if both rows are not primary sort equivalent
      if (primaryCompare !== 0) return primaryCompare;
      // Fall through to the secondary sort
    }
    return column ? compare(column, a, b, invert, caseSensitive) : 0;
  };
}

function getFixedSort(fixedSort: string | FixedSort | undefined) {
  return typeof fixedSort === "string" ? fixedSort : fixedSort?.at;
}

function compare<R extends Kinded>(
  column: GridColumnWithId<R>,
  a: GridDataRow<R>,
  b: GridDataRow<R>,
  invert: boolean,
  caseSensitive: boolean,
) {
  const v1 = sortValue(applyRowFn(column, a, {} as any, 0, false), caseSensitive);
  const v2 = sortValue(applyRowFn(column, b, {} as any, 0, false), caseSensitive);
  const v1e = v1 === null || v1 === undefined;
  const v2e = v2 === null || v2 === undefined;
  if ((v1e && v2e) || v1 === v2) {
    return 0;
  } else if (v1e || v1 < v2) {
    return invert ? 1 : -1;
  } else if (v2e || v1 > v2) {
    return invert ? -1 : 1;
  } else {
    return 0;
  }
}

/** Look at a row and get its sort value. */
function sortValue(value: ReactNode | GridCellContent, caseSensitive: boolean): any {
  // Check sortValue and then fallback on value
  let maybeFn: any = value;
  if (value && typeof value === "object") {
    // Look for GridCellContent.sortValue, then GridCellContent.value
    if ("sortValue" in value) {
      maybeFn = value.sortValue;
    } else if ("value" in value) {
      maybeFn = value.value;
    } else if ("content" in value) {
      maybeFn = value.content;
    }
  }
  // Watch for functions that need to read from a potentially-changing proxy
  if (maybeFn instanceof Function) {
    maybeFn = maybeFn();
  }

  return normalizeSortValue(maybeFn, caseSensitive);
}

export function ensureClientSideSortValueIsSortable(
  sortOn: SortOn,
  isHeader: boolean,
  column: GridColumnWithId<any>,
  idx: number,
  maybeContent: ReactNode | GridCellContent,
): void {
  if (process.env.NODE_ENV !== "production" && !isHeader && sortOn === "client" && column.clientSideSort !== false) {
    const value = sortValue(maybeContent, false);
    if (!canClientSideSort(value)) {
      const columnIdentifier = !column.id.startsWith("beamColumn_") ? column.id : (column.name ?? idx);
      throw new Error(
        `Column ${columnIdentifier} passed an unsortable value, use GridCellContent or clientSideSort=false`,
      );
    }
  }
}

function canClientSideSort(value: any): boolean {
  const t = typeof value;
  return (
    value === null ||
    t === "undefined" ||
    t === "number" ||
    t === "string" ||
    t === "bigint" ||
    t === "boolean" ||
    value instanceof Date ||
    isPlainDate(value) ||
    isZonedDateTime(value)
  );
}

function normalizeSortValue(value: any, caseSensitive: boolean): any {
  if (isPlainDate(value)) {
    return value.toString();
  } else if (isZonedDateTime(value)) {
    return value.epochNanoseconds;
  } else if (typeof value === "string" && !caseSensitive) {
    return value.toLowerCase();
  } else {
    return value;
  }
}

function isPlainDate(value: unknown): value is Temporal.PlainDate {
  return value instanceof Temporal.PlainDate;
}

function isZonedDateTime(value: unknown): value is Temporal.ZonedDateTime {
  return value instanceof Temporal.ZonedDateTime;
}
