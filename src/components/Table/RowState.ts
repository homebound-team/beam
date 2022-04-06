import { comparer, makeAutoObservable, ObservableMap, ObservableSet, reaction } from "mobx";
import React, { MutableRefObject } from "react";
import { GridDataRow } from "src/components/Table/GridTable";
import { visit } from "src/components/Table/visitor";

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
  // Set of just row ids. Keeps track of which rows are visible. Used to filter out non-visible rows from `selectedIds`
  private visibleRows = new ObservableSet<string>();

  // Keeps track of the 'active' row, formatted `${row.kind}_${row.id}`
  activeRowId: string | undefined;

  /**
   * Creates the `RowState` for a given `GridTable`.
   */
  constructor(
    private rows: MutableRefObject<GridDataRow<any>[]>,
    private persistCollapse: string | undefined,
    activeRowId: string | undefined,
  ) {
    this.collapsedRows = new ObservableSet(persistCollapse ? readLocalCollapseState(persistCollapse) : []);
    this.activeRowId = activeRowId;
    // Make ourselves an observable so that mobx will do caching of .collapseIds so
    // that it'll be a stable identity for GridTable to useMemo against.
    makeAutoObservable(this, { rows: false } as any); // as any b/c rows is private, so the mapped type doesn't see it

    // Whenever our `visibleRows` change (i.e. via filtering) then we need to re-derive header and parent rows' selected state.
    reaction(
      () => [...this.visibleRows.values()].sort(),
      () => {
        const map = new Map<string, SelectedState>();
        map.set(
          "header",
          deriveParentSelected(this.rows.current.flatMap((row) => this.setNestedSelectedStates(row, map))),
        );
        // Merge the changes back into the selected rows state
        this.selectedRows.merge(map);
      },
      { equals: comparer.shallow },
    );
  }

  setVisibleRows(rowIds: string[]): void {
    // ObservableSet doesn't seem to do a `diff` inside `replace` before firing
    // observers/reactions that watch it, which can lead to render loops with the
    // application page is observing `GridTableApi.getSelectedRows`, and merely
    // the act of rendering GridTable (w/o row changes) causes it's `useComputed`
    // to be triggered.
    if (!comparer.shallow(rowIds, [...this.visibleRows.values()])) {
      this.visibleRows.replace(rowIds);
    }
  }

  get selectedIds(): string[] {
    // Return only ids that are fully checked, i.e. not partial
    const ids = [...this.selectedRows.entries()]
      .filter(([id, v]) => this.visibleRows.has(id) && v === "checked")
      .map(([k]) => k);
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
        visit(this.rows.current, (row) => this.visibleRows.has(row.id) && map.set(row.id, "checked"));
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
      visit([curr.row], (row) => this.visibleRows.has(row.id) && map.set(row.id, selected ? "checked" : "unchecked"));

      // Now walk up the parents and see if they are now-all-checked/now-all-unchecked/some-of-each
      for (const parent of [...curr.parents].reverse()) {
        if (parent.children) {
          map.set(parent.id, deriveParentSelected(this.getVisibleChildrenStates(parent.children, map)));
        }
      }

      // And do the header + top-level "children" as a final one-off
      map.set("header", deriveParentSelected(this.getVisibleChildrenStates(this.rows.current, map)));

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

  private getVisibleChildrenStates(children: GridDataRow<any>[], map: Map<string, SelectedState>): SelectedState[] {
    return children
      .filter((row) => row.id !== "header" && this.visibleRows.has(row.id))
      .map((row) => map.get(row.id) || this.getSelected(row.id));
  }

  // Recursively traverse through rows to determine selected state of parent rows based on children
  private setNestedSelectedStates(row: GridDataRow<any>, map: Map<string, SelectedState>): SelectedState[] {
    if (this.visibleRows.has(row.id)) {
      if (!row.children) {
        return [this.getSelected(row.id)];
      }

      const childrenSelectedStates = row.children.flatMap((rc) => this.setNestedSelectedStates(rc, map));
      const parentState = deriveParentSelected(childrenSelectedStates);
      map.set(row.id, parentState);
      return [parentState];
    }
    return [];
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
  return children.length === 0 ? "unchecked" : allChecked ? "checked" : allUnchecked ? "unchecked" : "partial";
}
