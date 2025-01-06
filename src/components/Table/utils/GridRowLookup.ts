import { MutableRefObject } from "react";
import { ListRange, VirtuosoHandle } from "react-virtuoso";
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

  /**
   * Scroll's to the row with the given kind + id. Requires using `as=virtual`.
   * Will skip re-scrolling to a row if it's already visible.
   */
  scrollTo(kind: R["kind"], id: string): void;
}

interface NextPrev<R extends Kinded> {
  next: GridDataRow<R> | undefined;
  prev: GridDataRow<R> | undefined;
}

export function createRowLookup<R extends Kinded>(
  api: GridTableApiImpl<R>,
  virtuosoRef: MutableRefObject<VirtuosoHandle | null>,
  virtuosoRangeRef: MutableRefObject<ListRange | null>,
): GridRowLookup<R> {
  return {
    scrollTo(kind, id) {
      if (virtuosoRef.current === null) {
        // In theory we could support as=div and as=table by finding the DOM
        // element and calling .scrollIntoView, just not doing that yet.
        throw new Error("scrollTo is only supported for as=virtual");
      }

      const index = api.tableState.visibleRows.findIndex((r) => r && r.kind === kind && r.row.id === id);

      if (shouldSkipScrollTo(index, virtuosoRangeRef)) return;

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
