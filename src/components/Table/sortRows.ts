import { ReactNode } from "react";
import { applyRowFn, GridCellContent, GridColumn, GridDataRow, Kinded } from "src/components/Table/GridTable";
import { SortOn, SortState } from "src/components/Table/useSortState";

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
  const [value, direction, persistent] = sortState;
  
  const column = columns[value];
  const invert = direction === "DESC";

  let persistentColumn: GridColumn<R, {}>;
  if (persistent) {
    persistentColumn = columns[persistent]
  }

  // Make a shallow copy for sorting to avoid mutating the original list
  return [...batch].sort((a, b) => {
    const v1 = sortValue(applyRowFn(column, a, {} as any, 0), caseSensitive);
    const v2 = sortValue(applyRowFn(column, b, {} as any, 0), caseSensitive);
    const v1e = v1 === null || v1 === undefined;
    const v2e = v2 === null || v2 === undefined;

    let p1 = false;
    let p2 = false;
    if (persistentColumn) {
      const pColumn = persistentColumn
      p1 = sortValue(applyRowFn(persistentColumn, a, {} as any, 0), caseSensitive);
      p2 = sortValue(applyRowFn(persistentColumn, b, {} as any, 0), caseSensitive); //persistent column is changing to read header column here and I don't know why
      // some how I"m get 'value' instead of true or false here
      //p1e = !(p1 === null || p1 === undefined);
      //p2e = !(p2 === null || p2 === undefined);
    }
    if ((a.pin || b.pin) && !(a.pin === b.pin)) {
      const ap = a.pin === "first" ? -1 : a.pin === "last" ? 1 : 0;
      const bp = b.pin === "first" ? -1 : b.pin === "last" ? 1 : 0;
      return ap === bp ? 0 : ap < bp ? -1 : 1;
    } else if (p1 && p2){
      if ((v1e && v2e) || v1 === v2) {
        return 0;
      } else if (v1e || v1 < v2) {
        return invert ? 1 : -1;
      } else if (v2e || v1 > v2) {
        return invert ? -1 : 1;
      }
    } else if (p1) {
      return 1; 
    } else if (p2) {
      return -1;
    }
    else if ((v1e && v2e) || v1 === v2) {
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
function sortValue(value: ReactNode | GridCellContent, caseSensitive: boolean): any {
  // Check for persistence
  
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
