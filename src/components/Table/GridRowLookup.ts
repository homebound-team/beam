import { MutableRefObject } from "react";
import { VirtuosoHandle } from "react-virtuoso";
import { dropChromeRows, isChromeRow } from "src/components/Table/nestedCards";
import { DiscriminateUnion, GridColumn, GridDataRow, Kinded, RowTuple } from "src/components/Table/types";

/**
 * Allows a caller to ask for the currently shown rows, given the current sorting/filtering.
 *
 * We will probably end up generalizing this into a GridTableApi that exposes more
 * actions i.e. scrolling to a row and selection state.
 */
export interface GridRowLookup<R extends Kinded> {
  /** Returns both the immediate next/prev rows, as well as `[kind].next/prev` values, ignoring headers. */
  lookup(
    row: GridDataRow<R>,
    additionalFilter?: (row: GridDataRow<R>) => boolean,
  ): NextPrev<R> &
    {
      [P in R["kind"]]: NextPrev<DiscriminateUnion<R, "kind", P>>;
    };

  /** Returns the list of currently filtered/sorted rows, without headers. */
  currentList(): readonly GridDataRow<R>[];

  /** Scroll's to the row with the given kind + id. Requires using `as=virtual`. */
  scrollTo(kind: R["kind"], id: string): void;
}

interface NextPrev<R extends Kinded> {
  next: GridDataRow<R> | undefined;
  prev: GridDataRow<R> | undefined;
}

export function createRowLookup<R extends Kinded>(
  columns: GridColumn<R>[],
  filteredRows: RowTuple<R>[],
  virtuosoRef: MutableRefObject<VirtuosoHandle | null>,
): GridRowLookup<R> {
  return {
    scrollTo(kind, id) {
      if (virtuosoRef.current === null) {
        // In theory we could support as=div and as=table by finding the DOM
        // element and calling .scrollIntoView, just not doing that yet.
        throw new Error("scrollTo is only supported for as=virtual");
      }
      const index = filteredRows.findIndex(([r]) => !isChromeRow(r) && r.kind === kind && r.id === id);
      virtuosoRef.current.scrollToIndex({ index, behavior: "smooth" });
    },
    currentList() {
      return dropChromeRows(filteredRows).map((r) => r[0]);
    },
    lookup(row, additionalFilter = () => true) {
      const rows = dropChromeRows(filteredRows)
        .map((r) => r[0])
        .filter(additionalFilter);
      // Ensure we have `result.kind = {}` for each kind
      const result: any = Object.fromEntries(getKinds(columns).map((kind) => [kind, {}]));
      // This is an admittedly cute/fancy scan, instead of just `rows.findIndex`, but
      // we do it this way so that we can do kind-aware prev/next detection.
      let key: "prev" | "next" = "prev";
      for (let i = 0; i < rows.length; i++) {
        const each = rows[i];
        // Flip from prev to next when we find it
        if (each.kind === row.kind && each.id === row.id) {
          key = "next";
        } else {
          if (key === "prev") {
            // prev always overwrites what was there before
            result[key] = each;
            result[each.kind][key] = each;
          } else {
            // next only writes first seen
            result[key] ??= each;
            result[each.kind][key] ??= each;
          }
        }
      }
      return result;
    },
  };
}

function getKinds<R extends Kinded>(columns: GridColumn<R>[]): R[] {
  // Use the 1st column to get the runtime list of kinds
  const nonKindKeys = ["w", "sort", "sortValue", "align"];
  return Object.keys(columns[0] || {}).filter((key) => !nonKindKeys.includes(key)) as any;
}
