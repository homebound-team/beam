import { ObservableSet } from "mobx";
import React, { MutableRefObject } from "react";
import { GridDataRow } from "src/components/Table/GridTable";

// Will be used in the next PR...
// A parent row can be partially selected when some children are selected/some aren't.
// export type SelectedState = "checked" | "unchecked" | "partial";

/**
 * Stores the collapsed & selected state of rows.
 *
 * I.e. this implements "collapse parent" --> "hides children", and
 * "select parent" --> "select parent + children".
 *
 * There should be a single, stable `RowStateStore` instance per `GridTable`, so
 * that children don't have to re-render even as we incrementally add/remove rows
 * to the table (i.e. the top-level rows identity changes, but each row within it
 * may not).
 *
 * We use mobx ObservableSets/ObservableMaps to drive granular re-rendering of rows/cells
 * that need to change their toggle/select on/off in response to parent/child
 * changes.
 */
export class RowState {
  // A set of just row ids, i.e. not row.kind+row.id
  readonly collapsedRows: ObservableSet<string>;
  // Coming in future PR
  // readonly selectedRows = new ObservableMap<string, "checked" | "unchecked" | "partial">();

  /**
   * Creates the `RowState` for a given `GridTable`.
   */
  constructor(private rows: MutableRefObject<GridDataRow<any>[]>, private persistCollapse: string | undefined) {
    this.collapsedRows = new ObservableSet(persistCollapse ? readLocalCollapseState(persistCollapse) : []);
  }

  // Should be called in an Observer/useComputed to trigger re-renders
  isCollapsed(id: string): boolean {
    return this.collapsedRows.has(id) || this.collapsedRows.has("header");
  }

  toggleCollapsed(id: string): void {
    const collapsedIds = [...this.collapsedRows.values()];

    // We have different behavior when going from expand/collapse all.
    if (id === "header") {
      const isAllCollapsed = collapsedIds[0] === "header";
      if (isAllCollapsed) {
        // Expand all means keep `collapsedIds` empty
        collapsedIds.splice(0, collapsedIds.length);
      } else {
        // Otherwise push `header` on the list as a hint that we're in the collapsed-all state
        collapsedIds.push("header");
        // Find all non-leaf rows so that toggling "all collapsed" -> "all not collapsed" opens
        // the parent rows of any level.
        const parentIds = new Set<string>();
        const todo = [...this.rows.current];
        while (todo.length > 0) {
          const r = todo.pop()!;
          if (r.children) {
            parentIds.add(r.id);
            todo.push(...r.children);
          }
        }
        // And then mark all parent rows as collapsed.
        collapsedIds.push(...parentIds);
      }
    } else {
      // This is the regular/non-header behavior to just add/remove the individual row id
      const i = collapsedIds.indexOf(id);
      if (i === -1) {
        collapsedIds.push(id);
      } else {
        collapsedIds.splice(i, 1);
      }
    }

    this.collapsedRows.replace(collapsedIds);
    if (this.persistCollapse) {
      localStorage.setItem(this.persistCollapse, JSON.stringify(collapsedIds));
    }
  }
}

/** Provides a context for rows to access their table's `RowState`. */
export const RowStateContext = React.createContext<{ rowState: RowState }>({
  get rowState(): RowState {
    throw new Error("No RowStateContext provider");
  },
});

// Get the rows that are already in the toggled state, so we can keep them toggled
function readLocalCollapseState(persistCollapse: string): string[] {
  const collapsedGridRowIds = localStorage.getItem(persistCollapse);
  return collapsedGridRowIds ? JSON.parse(collapsedGridRowIds) : [];
}
