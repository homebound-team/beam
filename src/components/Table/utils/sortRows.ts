import { ReactNode } from "react";
import { GridCellContent } from "src/components/Table/components/cell";
import { GridDataRow } from "src/components/Table/components/Row";
import { SortOn, SortState } from "src/components/Table/hooks/useSortState";
import { GridColumn, Kinded, Pin } from "src/components/Table/types";
import { applyRowFn } from "src/components/Table/utils/utils";

// Returns a shallow copy of the `rows` parameter sorted based on `sortState`
export function sortRows<R extends Kinded>(
  columns: GridColumn<R>[],
  rows: GridDataRow<R>[],
  sortState: SortState<number>,
  caseSensitive: boolean,
): GridDataRow<R>[] {
  const sorted = sortBatch(columns, rows, sortState, caseSensitive);
  // Recursively sort child rows
  sorted.forEach((row, i) => {
    if (row.children) {
      sorted[i].children = sortRows(columns, row.children, sortState, caseSensitive);
    }
  });

  return sorted;
}

function sortBatch<R extends Kinded>(
  columns: GridColumn<R>[],
  batch: GridDataRow<R>[],
  sortState: SortState<number>,
  caseSensitive: boolean,
): GridDataRow<R>[] {
  // When client-side sort, the sort value is the column index
  const [value, direction, primaryKey, primaryDirection] = sortState;

  const column = columns[value];
  const invert = direction === "DESC";
  const primaryInvert = primaryDirection === "DESC";
  const primaryColumn = primaryKey && columns[primaryKey];

  // Make a shallow copy for sorting to avoid mutating the original list
  return [...batch].sort((a, b) => {
    if (a.pin || b.pin) {
      // If both rows are pinned, we don't sort within them, because by pinning the page is taking
      // explicit ownership over the order of the rows (and we also don't support "levels of pins",
      // i.e. for change events putting "just added" rows `pin: last` and the "add new" row `pin: lastest`).
      const aPin = getPin(a.pin);
      const bPin = getPin(b.pin);
      const ap = aPin === "first" ? -1 : aPin === "last" ? 1 : 0;
      const bp = bPin === "first" ? -1 : bPin === "last" ? 1 : 0;
      return ap === bp ? 0 : ap < bp ? -1 : 1;
    } else if (primaryColumn) {
      // When primary key exist sort that priority first
      const primaryCompare = compare(primaryColumn, a, b, primaryInvert, caseSensitive);
      // if both rows are not primary sort equivalent
      if (primaryCompare !== 0) {
        return primaryCompare;
      }
    }
    return compare(column, a, b, invert, caseSensitive);
  });
}

function getPin(pin: string | Pin | undefined) {
  return typeof pin === "string" ? pin : pin?.at;
}

function compare<R extends Kinded>(
  column: GridColumn<R>,
  a: GridDataRow<R>,
  b: GridDataRow<R>,
  invert: boolean,
  caseSensitive: boolean,
) {
  const v1 = sortValue(applyRowFn(column, a, {} as any, 0), caseSensitive);
  const v2 = sortValue(applyRowFn(column, b, {} as any, 0), caseSensitive);
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
  let maybeFn = value;
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

  // If it is a string, then always lower case it for comparisons
  return typeof maybeFn === "string" && !caseSensitive ? maybeFn.toLowerCase() : maybeFn;
}

export function ensureClientSideSortValueIsSortable(
  sortOn: SortOn,
  isHeader: boolean,
  column: GridColumn<any>,
  idx: number,
  maybeContent: ReactNode | GridCellContent,
): void {
  if (process.env.NODE_ENV !== "production" && !isHeader && sortOn === "client" && column.clientSideSort !== false) {
    const value = sortValue(maybeContent, false);
    if (!canClientSideSort(value)) {
      throw new Error(`Column ${idx} passed an unsortable value, use GridCellContent or clientSideSort=false`);
    }
  }
}

function canClientSideSort(value: any): boolean {
  const t = typeof value;
  return (
    value === null || t === "undefined" || t === "number" || t === "string" || t === "boolean" || value instanceof Date
  );
}