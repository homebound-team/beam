import { ReactNode } from "react";
import {
  applyRowFn,
  GridCellContent,
  GridColumn,
  GridDataRow,
  GridSortConfig,
  Kinded,
} from "src/components/Table/GridTable";
import { SortState } from "src/components/Table/useSortState";

// Returns a shallow copy of the `rows` parameter sorted based on `sortState`
export function sortRows<R extends Kinded>(
  columns: GridColumn<R>[],
  rows: GridDataRow<R>[],
  sortState: SortState<number>,
): GridDataRow<R>[] {
  const sorted = sortBatch(columns, rows, sortState);
  // Recursively sort child rows
  for (const row of sorted) {
    if (row.children) {
      // Replace the existing `children` prop with a sorted shallow copy
      Object.assign(row, { children: sortRows(columns, row.children, sortState) });
    }
  }
  return sorted;
}

function sortBatch<R extends Kinded>(
  columns: GridColumn<R>[],
  batch: GridDataRow<R>[],
  sortState: SortState<number>,
): GridDataRow<R>[] {
  // When client-side sort, the sort value is the column index
  const [value, direction] = sortState;
  const column = columns[value];
  const invert = direction === "DESC";

  // Make a shallow copy for sorting to avoid mutating the original list
  return [...batch].sort((a, b) => {
    const v1 = sortValue(applyRowFn(column, a));
    const v2 = sortValue(applyRowFn(column, b));
    const v1e = v1 === null || v1 === undefined;
    const v2e = v2 === null || v2 === undefined;
    if (a.pin || b.pin) {
      const ap = a.pin === "first" ? -1 : a.pin === "last" ? 1 : 0;
      const bp = b.pin === "first" ? -1 : a.pin === "last" ? 1 : 0;
      return ap === bp ? 0 : ap < bp ? -1 : 1;
    } else if ((v1e && v2e) || v1 === v2) {
      return 0;
    } else if (v1e || v1 < v2) {
      return invert ? 1 : -1;
    } else if (v2e || v1 > v2) {
      return invert ? -1 : 1;
    }
    return 0;
  });
}

/** Look at a row and get its sort value. */
function sortValue(value: ReactNode | GridCellContent): any {
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
    return maybeFn();
  }
  return maybeFn;
}

export function ensureClientSideSortValueIsSortable(
  sorting: GridSortConfig<any> | undefined,
  isHeader: boolean,
  column: GridColumn<any>,
  idx: number,
  maybeContent: ReactNode | GridCellContent,
): void {
  if (
    process.env.NODE_ENV !== "production" &&
    !isHeader &&
    sorting?.on === "client" &&
    column.clientSideSort !== false
  ) {
    const value = sortValue(maybeContent);
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
