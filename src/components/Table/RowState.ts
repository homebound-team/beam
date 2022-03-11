import { makeAutoObservable, ObservableMap, ObservableSet } from "mobx";
import React, { MutableRefObject } from "react";
import { GridDataRow } from "src/components/Table/GridTable";

// A parent row can be partially selected when some children are selected/some aren't.
export type SelectedState = "checked" | "unchecked" | "partial";

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
  private readonly collapsedRows: ObservableSet<string>;
  private readonly selectedRows = new ObservableMap<string, SelectedState>();

  /**
   * Creates the `RowState` for a given `GridTable`.
   */
  constructor(private rows: MutableRefObject<GridDataRow<any>[]>, private persistCollapse: string | undefined) {
    this.collapsedRows = new ObservableSet(persistCollapse ? readLocalCollapseState(persistCollapse) : []);
    // Make ourselves an observable so that mobx will do caching of .collapseIds so
    // that it'll be a stable identity for GridTable to useMemo against.
    makeAutoObservable(this);
  }

  get selectedIds(): string[] {
    // Return only ids that are fully checked, i.e. not partial
    const ids = [...this.selectedRows.entries()].filter(([, v]) => v === "checked").map(([k]) => k);
    // Hide our header marker
    const headerIndex = ids.indexOf("header");
    if (headerIndex > -1) {
      ids.splice(headerIndex, 1);
    }
    return ids;
  }

  // Should be called in an Observer/useComputed to trigger re-renders
  getSelected(id: string): SelectedState {
    // We may not have every row in here, i.e. on 1st page load or after clicking here, so assume unchecked
    return this.selectedRows.get(id) || "unchecked";
  }

  selectRow(id: string, selected: boolean): void {
    if (id === "header") {
      // Select/unselect all has special behavior
      if (selected) {
        // Just mash the header + all rows + children as selected
        const map = new Map<string, SelectedState>();
        map.set("header", "checked");
        const todo = [...this.rows.current];
        while (todo.length > 0) {
          const r = todo.pop()!;
          map.set(r.id, "checked");
          if (r.children) {
            todo.push(...r.children);
          }
        }
        this.selectedRows.replace(map);
      } else {
        // Similarly "unmash" all rows + children.
        this.selectedRows.clear();
      }
    } else {
      // This is the regular/non-header behavior to just add/remove the individual row id,
      // plus percolate the change down-to-child + up-to-parents.

      // Find the clicked on row
      const curr = findRow(this.rows.current, id);
      if (!curr) {
        return;
      }

      // Everything here & down is deterministically on/off
      const map = new Map<string, SelectedState>();
      const todo = [curr.row];
      while (todo.length > 0) {
        const row = todo.pop()!;
        map.set(row.id, selected ? "checked" : "unchecked");
        if (row.children) {
          todo.push(...row.children);
        }
      }

      // Now walk up the parents and see if they are now-all-checked/now-all-unchecked/some-of-each
      for (const parent of [...curr.parents].reverse()) {
        if (parent.children) {
          const children = parent.children.map((row) => map.get(row.id) || this.getSelected(row.id));
          map.set(parent.id, deriveParentSelected(children));
        }
      }

      // And do the header + top-level "children" as a final one-off
      const children = this.rows.current
        .filter((row) => row.id !== "header")
        .map((row) => map.get(row.id) || this.getSelected(row.id));
      map.set("header", deriveParentSelected(children));

      this.selectedRows.merge(map);
    }
  }

  get collapsedIds(): string[] {
    return [...this.collapsedRows.values()];
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

type FoundRow = { row: GridDataRow<any>; parents: GridDataRow<any>[] };

/** Finds a row by id, and returns it + any parents. */
function findRow(rows: GridDataRow<any>[], id: string): FoundRow | undefined {
  // This is technically an array of "maybe FoundRow"
  const todo: FoundRow[] = rows.map((row) => ({ row, parents: [] }));
  while (todo.length > 0) {
    const curr = todo.pop()!;
    if (curr.row.id === id) {
      return curr;
    } else if (curr.row.children) {
      // Search our children and pass along us as the parent
      todo.push(...curr.row.children.map((child) => ({ row: child, parents: [...curr.parents, curr.row] })));
    }
  }
  return undefined;
}

function deriveParentSelected(children: SelectedState[]): SelectedState {
  const allChecked = children.every((child) => child === "checked");
  const allUnchecked = children.every((child) => child === "unchecked");
  return allChecked ? "checked" : allUnchecked ? "unchecked" : "partial";
}
