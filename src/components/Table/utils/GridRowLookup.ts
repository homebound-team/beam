import { MutableRefObject } from "react";
import { VirtuosoHandle } from "react-virtuoso";
import { GridDataRow } from "src/components/Table/components/Row";
import { GridTableApiImpl } from "src/components/Table/GridTableApi";
import { DiscriminateUnion, GridColumnWithId, Kinded, nonKindGridColumnKeys } from "src/components/Table/types";

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
  ): NextPrev<R> & {
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
  api: GridTableApiImpl<R>,
  virtuosoRef: MutableRefObject<VirtuosoHandle | null>,
): GridRowLookup<R> {
  return {
    scrollTo(kind, id) {
      if (virtuosoRef.current === null) {
        // In theory we could support as=div and as=table by finding the DOM
        // element and calling .scrollIntoView, just not doing that yet.
        throw new Error("scrollTo is only supported for as=virtual");
      }
      const index = api.tableState.visibleRows.findIndex((r) => r && r.kind === kind && r.row.id === id);
      virtuosoRef.current.scrollToIndex({ index, behavior: "smooth" });
    },
    currentList() {
      return api.tableState.visibleRows.map((rs) => rs.row);
    },
    lookup(row, additionalFilter = () => true) {
      const rows = this.currentList().filter(additionalFilter);
      const columns = api.tableState.visibleColumns;
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

export function getKinds<R extends Kinded>(columns: GridColumnWithId<R>[]): R[] {
  return Object.keys(columns.find((c) => !c.isAction) || {}).filter(
    (key) => !nonKindGridColumnKeys.includes(key),
  ) as any;
}
