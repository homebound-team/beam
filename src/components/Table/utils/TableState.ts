import { camelCase } from "change-case";
import { comparer, makeAutoObservable, observable, ObservableSet, reaction } from "mobx";
import React from "react";
import { GridDataRow } from "src/components/Table/components/Row";
import { RowStates } from "src/components/Table/components/RowStates";
import { GridSortConfig } from "src/components/Table/GridTable";
import { Direction, GridColumnWithId } from "src/components/Table/types";
import { ASC, DESC, HEADER, KEPT_GROUP, reservedRowKinds } from "src/components/Table/utils/utils";
import { visit } from "src/components/Table/utils/visitor";
import { isFunction } from "src/utils";
import { assignDefaultColumnIds } from "./columns";

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
export class TableState {
  // A set of just row ids, i.e. not row.kind+row.id
  private readonly collapsedRows = new ObservableSet<string>([]);
  private persistCollapse: string | undefined;
  // The current list of rows, basically a useRef.current. Only shallow reactive.
  public rows: GridDataRow<any>[] = [];
  private readonly rowStates = new RowStates();
  // Keeps track of the 'active' row, formatted `${row.kind}_${row.id}`
  activeRowId: string | undefined = undefined;
  // Keeps track of the 'active' cell, formatted `${row.kind}_${row.id}_${column.name}`
  activeCellId: string | undefined = undefined;

  // Tracks the current `sortConfig`
  public sortConfig: GridSortConfig | undefined;
  // Tracks the active sort column(s), so GridTable or SortHeaders can reactively
  // re-render (for GridTable, only if client-side sorting)
  public sort: SortState = {};
  // Keep track of the `initialSortState` so we can (1) revert back to it, and (2) properly derive next sort state
  private initialSortState: SortState | undefined;
  // The server-side `onSort` callback, if any.
  private onSort: ((orderBy: any | undefined, direction: Direction | undefined) => void) | undefined;

  // Non-reactive list of our columns
  public columns: GridColumnWithId<any>[] = [];
  // An observable set of column ids to keep track of which columns are currently expanded
  private expandedColumns = new ObservableSet<string>();
  // An observable set of column ids to keep track of which columns are visible
  public visibleColumns = new ObservableSet<string>();
  private visibleColumnsStorageKey: string = "";
  // Cache for already loaded expandable columns
  private loadedColumns: Map<string, GridColumnWithId<any>[]> = new Map();

  /**
   * Creates the `RowState` for a given `GridTable`.
   */
  constructor() {
    // Make ourselves an observable so that mobx will do caching of .collapseIds so
    // that it'll be a stable identity for GridTable to useMemo against.
    makeAutoObservable(this, {
      // We only shallow observe rows so that:
      // a) we don't deeply/needlessly proxy-ize a large Apollo fragment cache, but
      // b) if rows changes, we re-run computeds like getSelectedRows that may need to see the
      // updated _contents_ of a given row, even if our other selected/matched row states don't change.
      // (as any b/c rows is private, so the mapped type doesn't see it)
      rows: observable.shallow,
      // Do not observe columns, expect this to be a non-reactive value for us to base our reactive values off of.
      columns: false,
    });

    // Whenever our `matchedRows` change (i.e. via filtering) then we need to re-derive header and parent rows'
    // selected state, because we'll show a parent as fully-selected if only visible children are selected.
    // (even if the children is collapsed).
    reaction(
      () => [...this.matchedRows.values()].sort(),
      () => {
        const newlyKeptRows = [...this.selectedDataRows.values()].filter((row) =>
          keptSelectionsFilter(row, this.matchedRows),
        );

        // If the kept rows went from empty to not empty, then introduce the SELECTED_GROUP row as collapsed
        if (newlyKeptRows.length > 0 && this.keptSelectedRows.length === 0) {
          this.collapsedRows.add(KEPT_GROUP);
        }
        // When filters are applied, we need to determine if there are any selected rows that are no longer matched.
        if (!comparer.shallow(newlyKeptRows, this.keptSelectedRows)) {
          this.keptSelectedRows = newlyKeptRows;
        }

        // Re-derive the selected state for both the header and parent rows
        const map = new Map<string, SelectedState>();
        map.set(
          "header",
          deriveParentSelected(
            [...this.rows, ...this.keptSelectedRows].flatMap((row) => this.setNestedSelectedStates(row, map)),
          ),
        );

        // Merge the changes back into the selected rows state
        this.rowSelectedState.merge(map);

        // Update the selectedDataRows to include those that are fully selected based on the filter changes
        [...this.rowSelectedState.entries()].forEach(([id, state]) => {
          if (this.selectedDataRows.has(id) && state !== "checked") {
            this.selectedDataRows.delete(id);
          } else if (!this.selectedDataRows.has(id) && state === "checked") {
            const row = this.rows.find((row) => row.id === id);
            if (row) {
              this.selectedDataRows.set(id, row);
            }
          }
        });
      },
      { equals: comparer.shallow },
    );
  }

  loadCollapse(persistCollapse: string | undefined, rows: GridDataRow<any>[]): void {
    this.persistCollapse = persistCollapse;
    const sessionStorageIds = persistCollapse ? sessionStorage.getItem(persistCollapse) : null;
    // Initialize with our collapsed rows based on what is in sessionStorage. Otherwise check if any rows have been defined as collapsed
    const collapsedGridRowIds = sessionStorageIds ? JSON.parse(sessionStorageIds) : getCollapsedIdsFromRows(rows);

    // If we have some initial rows to collapse, then set the internal prop
    if (collapsedGridRowIds.length > 0) {
      this.collapsedRows.replace(collapsedGridRowIds);
      // If `persistCollapse` is set, but sessionStorageIds was not defined, then add them now.
      if (this.persistCollapse && !sessionStorageIds) {
        sessionStorage.setItem(this.persistCollapse, JSON.stringify(collapsedGridRowIds));
      }
    }
  }

  initSortState(sortConfig: GridSortConfig | undefined, columns: GridColumnWithId<any>[]) {
    if (this.sortConfig) {
      return;
    }

    this.sortConfig = sortConfig;

    if (sortConfig?.on === "client") {
      const { initial, primary } = sortConfig;
      const primaryKey: string | undefined = primary?.[0];
      const persistentSortData = primaryKey
        ? { persistent: { columnId: primaryKey, direction: primary?.[1] ?? ASC } }
        : {};

      if (initial === undefined && "initial" in sortConfig) {
        // if explicitly set to `undefined`, then do not sort
        this.initialSortState = undefined;
      } else if (initial) {
        this.initialSortState = { current: { columnId: initial[0], direction: initial[1] }, ...persistentSortData };
      } else {
        // If no explicit sortState, assume 1st column ascending
        const firstSortableColumn = columns.find((c) => c.clientSideSort !== false)?.id;
        this.initialSortState = firstSortableColumn
          ? { current: { columnId: firstSortableColumn, direction: ASC }, ...persistentSortData }
          : undefined;
      }
    } else {
      this.initialSortState = sortConfig?.value
        ? { current: { columnId: sortConfig?.value[0], direction: sortConfig?.value[1] } }
        : undefined;
    }

    // Only change `this.sort` if `initialSortState` is defined.
    if (this.initialSortState) {
      this.sort = this.initialSortState;
    }

    this.onSort = sortConfig?.on === "server" ? sortConfig.onSort : undefined;
  }

  setSortKey(clickedColumnId: string) {
    if (this.sortConfig) {
      const newState = deriveSortState(this.sort, clickedColumnId, this.initialSortState);
      this.sort = newState ?? {};
      if (this.onSort) {
        const { columnId, direction } = newState?.current ?? {};
        this.onSort(columnId, direction);
      }
    }
  }

  get sortState(): SortState | undefined {
    return this.sort.current ? this.sort : undefined;
  }

  // Updates the list of rows and regenerates the collapsedRows property if needed.
  setRows(rows: GridDataRow<any>[]): void {
    // If the set of rows are different
    if (rows !== this.rows) {
      this.rowStates.setRows(rows);
      const currentCollapsedIds = this.collapsedIds;
      // Create a list of the (maybe) new rows that should be initially collapsed
      const maybeNewCollapsedRowIds = flattenRows(rows)
        .filter((r) => r.initCollapsed)
        .map((r) => r.id);
      // Check against local storage for collapsed state only if this is the first render of "data" (non-header or totals) rows.
      const checkLocalStorage =
        this.persistCollapse && !this.rows.some((r) => r.kind !== "totals" && r.kind !== "header");

      // If the list of collapsed rows are different, then determine which are net-new rows and should be added to the newCollapsedIds array
      if (
        currentCollapsedIds.length !== maybeNewCollapsedRowIds.length ||
        !currentCollapsedIds.every((id) => maybeNewCollapsedRowIds.includes(id))
      ) {
        // Flatten out the existing rows to make checking for new rows easier
        const flattenedExistingIds = flattenRows(this.rows).map((r) => r.id);
        const newCollapsedIds: string[] = maybeNewCollapsedRowIds.filter(
          (maybeNewRowId) =>
            !flattenedExistingIds.includes(maybeNewRowId) &&
            // Using `!` on `this.persistCollapse!` as `checkLocalStorage` ensures this.persistCollapse is truthy
            (!checkLocalStorage || readCollapsedRowStorage(this.persistCollapse!).includes(maybeNewRowId)),
        );

        // If there are new rows that should be collapsed then update the collapsedRows arrays
        if (newCollapsedIds.length > 0) {
          this.collapsedRows.replace(currentCollapsedIds.concat(newCollapsedIds));

          // Also update our persistCollapse if set
          if (this.persistCollapse) {
            sessionStorage.setItem(this.persistCollapse, JSON.stringify(currentCollapsedIds.concat(newCollapsedIds)));
          }
        }
      }
    }
    // Finally replace our existing list of rows
    this.rows = rows;
    // Update the selected rows map to include the rows' updated data
    const selectedRows = new Map();
    visit(this.rows, (row) => this.selectedDataRows.has(row.id) && selectedRows.set(row.id, row));
    this.selectedDataRows.merge(selectedRows);
  }

  setColumns(columns: GridColumnWithId<any>[], visibleColumnsStorageKey: string | undefined): void {
    const isInitial = !this.columns || this.columns.length === 0;
    if (columns !== this.columns) {
      this.visibleColumnsStorageKey = visibleColumnsStorageKey ?? camelCase(columns.map((c) => c.id).join());
      this.visibleColumns.replace(readOrSetLocalVisibleColumnState(columns, this.visibleColumnsStorageKey));

      // Figure out which columns need to be expanded when rendering a new set of columns
      const localStorageColumns = this.persistCollapse ? readExpandedColumnsStorage(this.persistCollapse) : [];
      // On initial render the columns we start with is whatever is in local storage.
      // On subsequent renders we want to keep the columns that were previously expanded.
      const columnIdsToExpand = isInitial ? localStorageColumns : this.expandedColumnIds;

      // Create a list of all existing column ids. (We ignore the `initExpanded` property for existing columns)
      const existingColumnIds = this.columns.map((c) => c.id);

      // Add any columns to our array that are new columns that should be initially expanded.
      columnIdsToExpand.push(
        ...columns.filter((c) => !existingColumnIds.includes(c.id) && c.initExpanded).map((c) => c.id),
      );

      // Clear the cache to force to re-fetch the expanded columns.
      this.loadedColumns.clear();

      // Send the new array of columns along to be parsed and expanded.
      this.parseAndUpdateExpandedColumns(columns.filter((c) => columnIdsToExpand.includes(c.id)));

      this.columns = columns;
    }
  }

  /** Determines which columns to expand immediately vs async */
  async parseAndUpdateExpandedColumns(columnsToExpand: GridColumnWithId<any>[]) {
    // Separate out which columns need to be loaded async vs which can be loaded immediately.
    const [localColumnsToExpand, asyncColumnsToExpand] = columnsToExpand.reduce(
      (acc, c) => {
        if (isFunction(c.expandColumns)) {
          return [acc[0], acc[1].concat(c)];
        }
        return [acc[0].concat(c), acc[1]];
      },
      [[] as GridColumnWithId<any>[], [] as GridColumnWithId<any>[]],
    );

    // Handle all async expanding columns using a Promise.all.
    // This will allow the table to render immediately, then cause a rerender with the new columns
    if (asyncColumnsToExpand.length > 0) {
      // Note: Not using a Promise.all because there seems to be a bug in Apollo with applying TypePolicies when using Promise.all.
      // TODO: Update comment with Apollo issue link.
      // Promise.all(asyncColumnsToExpand.map(async (c) => await this.loadExpandedColumns(c))).then(() =>
      //   this.updateExpandedColumns(asyncColumnsToExpand),
      // );

      // Instead, doing each async request in sequence for now.
      for await (const column of asyncColumnsToExpand) {
        await this.loadExpandedColumns(column);
      }
      this.updateExpandedColumns(asyncColumnsToExpand);
    }

    // For local columns, we skip the Promise in order to have the correct state on the initial load.
    if (localColumnsToExpand.length > 0) {
      this.updateExpandedColumns(localColumnsToExpand);
    }
  }

  /** Updates the state of which columns are expanded */
  updateExpandedColumns(newColumns: GridColumnWithId<any>[]) {
    const newColumnIds = newColumns.map((c) => c.id);
    // If there is a difference between list of current expanded columns vs list we just created, then replace
    const isDifferent =
      newColumnIds.length !== this.expandedColumnIds.length ||
      !this.expandedColumnIds.every((c) => newColumnIds.includes(c));
    if (isDifferent) {
      // Note: `this.expandedColumns` is a Set, so it will take care of dedupe-ing.
      this.expandedColumns.replace([...this.expandedColumnIds, ...newColumnIds]);
      // Update session storage if necessary.
      if (this.persistCollapse) {
        sessionStorage.setItem(getColumnStorageKey(this.persistCollapse), JSON.stringify([...this.expandedColumns]));
      }
    }
  }

  // load and trigger column to be expanded
  async loadExpandedColumns(column: GridColumnWithId<any>): Promise<void> {
    // if we don't have anything in our cache and our expanded columns are a function
    if (!this.loadedColumns.has(column.id) && isFunction(column.expandColumns)) {
      // set our result to the function call of expandColumns
      const result = await column.expandColumns();
      // once we have the loaded columns, add result to local cache
      this.loadedColumns.set(column.id, assignDefaultColumnIds(result));
    }
  }

  // if there is a promise, then grab the already loaded expandable columns from the cache, if not then return the expandedColumns property
  getExpandedColumns(column: GridColumnWithId<any>): GridColumnWithId<any>[] {
    return isFunction(column.expandColumns) ? this.loadedColumns.get(column.id) ?? [] : column.expandColumns ?? [];
  }

  setVisibleColumns(ids: string[]) {
    // If we have a new visible columns, then we need to check if some need to be initially expanded when made visible
    if (ids.length > this.visibleColumnIds.length) {
      // Get a list of columns that are just now being made visible.
      const newlyVisibleIds = ids.filter((id) => !this.visibleColumnIds.includes(id));
      // Figure out if any of these newly visible columns needs to be initially expanded.
      const columnsToExpand = this.columns.filter((c) => newlyVisibleIds.includes(c.id) && c.initExpanded);
      this.parseAndUpdateExpandedColumns(columnsToExpand);
    }
    sessionStorage.setItem(this.visibleColumnsStorageKey, JSON.stringify(ids));
    this.visibleColumns.replace(ids);
  }

  get visibleColumnIds(): string[] {
    return [...this.visibleColumns.values()];
  }

  get expandedColumnIds(): string[] {
    return [...this.expandedColumns.values()];
  }

  toggleExpandedColumn(columnId: string) {
    if (this.expandedColumns.has(columnId)) {
      this.expandedColumns.delete(columnId);
    } else {
      this.expandedColumns.add(columnId);
    }

    if (this.persistCollapse) {
      sessionStorage.setItem(getColumnStorageKey(this.persistCollapse), JSON.stringify(this.expandedColumnIds));
    }
  }

  /** Called with GridTable has re-calced the rows that pass the client-side filter, or all rows. */
  setMatchedRows(rowIds: string[]): void {
    this.rowStates.setMatchedRows(rowIds);
  }

  /** Returns selected data rows (non-header, non-totals, etc.), ignoring rows that have `row.selectable !== false`. */
  get selectedRows(): GridDataRow<any>[] {
    return this.rowStates.allStates.filter((rs) => rs.isSelected).map((rs) => rs.row);
  }

  // Should be called in an Observer/useComputed to trigger re-renders
  getSelected(id: string): SelectedState {
    return this.rowStates.get(id).selected;
  }

  selectRow(id: string, selected: boolean): void {
    if (id === "header") {
      // Select/unselect all has special behavior
      if (selected) {
        // Just mash the header + all rows + children as selected
        const selectedStateMap = new Map<string, SelectedState>();
        const selectedRowMap = new Map<string, GridDataRow<any>>();
        selectedStateMap.set("header", "checked");
        visit(this.rows, (row) => {
          if (!reservedRowKinds.includes(row.kind) && this.matchedRows.has(row.id)) {
            selectedStateMap.set(row.id, "checked");
            selectedRowMap.set(row.id, row);
          }
        });
        this.rowSelectedState.replace(selectedStateMap);
        // Use `merge` to ensure we don't lose any row that were selected, but no longer in `this.rows` (i.e. due to server-side filtering)
        this.selectedDataRows.merge(selectedRowMap);
      } else {
        // Similarly "unmash" all rows + children.
        this.rowSelectedState.clear();
        this.selectedDataRows.clear();
        this.keptSelectedRows = [];
      }
    } else {
      // This is the regular/non-header behavior to just add/remove the individual row id,
      // plus percolate the change down-to-child + up-to-parents.

      // Find the clicked on row
      const curr: FoundRow | undefined =
        findRow(this.rows, id) ??
        (this.selectedDataRows.has(id) ? { row: this.selectedDataRows.get(id)!, parents: [] } : undefined);
      if (!curr) return;

      // Everything here & down is deterministically on/off
      const selectedStateMap = new Map<string, SelectedState>();
      visit([curr.row], (row) => {
        // The `visit` method walks through the selected row and all of its children, if any.
        // Depending on whether we are determining the clicked row's state or its children, then we handle updating the selection differently.

        // We can tell if we are determining a child row's selected state by checking against the row selected `id` and the row we're currently evaluating `row.id`.
        const isClickedRow = row.id === id;

        // Only update the selected states if we're updating the clicked row, or if we are checking a child row, then the row must match the filter.
        // Meaning, rows that are filtered out and displayed in the "selectedGroup" can only change their selection state by interacting with them directly.
        if (isClickedRow || this.matchedRows.has(row.id)) {
          selectedStateMap.set(row.id, selected ? "checked" : "unchecked");
          if (selected) {
            this.selectedDataRows.set(row.id, row);
          } else {
            this.selectedDataRows.delete(row.id);
          }
        }
      });

      // Now walk up the parents and see if they are now-all-checked/now-all-unchecked/some-of-each
      for (const parent of [...curr.parents].reverse()) {
        // Only derive selected state of the parent row if `inferSelectedState` is not `false`
        if (parent.children && parent.inferSelectedState !== false) {
          const selectedState = deriveParentSelected(this.getMatchedChildrenStates(parent.children, selectedStateMap));
          if (selectedState === "checked") {
            this.selectedDataRows.set(parent.id, parent);
          } else {
            this.selectedDataRows.delete(parent.id);
          }
          selectedStateMap.set(parent.id, selectedState);
        }
      }

      // And do the header + top-level "children" as a final one-off
      selectedStateMap.set(
        "header",
        deriveParentSelected(this.getMatchedChildrenStates([...this.rows, ...this.keptSelectedRows], selectedStateMap)),
      );

      // And merge the new selected state map into the existing one
      this.rowSelectedState.merge(selectedStateMap);

      // Lastly, we need to update the `keptSelectedRows` if the row was deselected.
      // (If selected === true, then it's not possible for the row to be in `keptSelectedRows` as you can only select rows that match the filter)
      if (!selected) {
        const newlyKeptRows = [...this.selectedDataRows.values()].filter((row) =>
          keptSelectionsFilter(row, this.matchedRows),
        );
        if (!comparer.shallow(newlyKeptRows, this.keptSelectedRows)) {
          this.keptSelectedRows = newlyKeptRows;
        }
      }
    }
  }

  get collapsedIds(): string[] {
    return [...this.collapsedRows.values()];
  }

  // Should be called in an Observer/useComputed to trigger re-renders
  isCollapsed(id: string): boolean {
    return this.collapsedRows.has(id);
  }

  toggleCollapsed(id: string): void {
    const collapsedIds = [...this.collapsedRows.values()];

    // We have different behavior when going from expand/collapse all.
    if (id === "header") {
      const isAllCollapsed = collapsedIds.includes("header");
      if (isAllCollapsed) {
        // Expand all means keep `collapsedIds` empty
        collapsedIds.splice(0, collapsedIds.length);
      } else {
        // Otherwise push `header` and `selectedGroup` to the list as a hint that we're in the collapsed-all state
        collapsedIds.push(HEADER, KEPT_GROUP);
        // Find all non-leaf rows so that toggling "all collapsed" -> "all not collapsed" opens
        // the parent rows of any level.
        const parentIds = new Set<string>();
        const todo = [...this.rows];
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

      // TODO: Need to handle the kept selected group row.
      // If all rows have been expanded individually, but the 'header' was collapsed, then remove the header from the collapsedIds so it reverts to the expanded state
      if (collapsedIds.length === 1 && collapsedIds[0] === "header") {
        collapsedIds.splice(0, 1);
      } else {
        // If every top level child has been collapsed, then push "header" into the array to be considered collapsed as well.
        if (this.rows.every((maybeParent) => (maybeParent.children ? collapsedIds.includes(maybeParent.id) : true))) {
          collapsedIds.push("header");
        }
      }
    }

    this.collapsedRows.replace(collapsedIds);
    if (this.persistCollapse) {
      sessionStorage.setItem(this.persistCollapse, JSON.stringify(collapsedIds));
    }
  }

  deleteRows(ids: string[]): void {
    this.rows = this.rows.filter((row) => !ids.includes(row.id));
    this.rowStates.delete(ids);
    ids.forEach((id) => {
      this.collapsedRows.delete(id);
    });
  }

  private getMatchedChildrenStates(children: GridDataRow<any>[], map: Map<string, SelectedState>): SelectedState[] {
    const respectedChildren = children.flatMap(getChildrenForDerivingSelectState);
    // When determining the children selected states to base the parent's state from, then only base this off of rows that match the filter or are in the "hidden selected" group (via the `filter` below)
    return respectedChildren
      .filter((row) => row.id !== "header" && (this.matchedRows.has(row.id) || this.selectedDataRows.has(row.id)))
      .map((row) => map.get(row.id) || this.getSelected(row.id));
  }

  // Recursively traverse through rows to determine selected state of parent rows based on children
  // Returns the selected states for the immediately children (if any) of the row passed in
  private setNestedSelectedStates(row: GridDataRow<any>, map: Map<string, SelectedState>): SelectedState[] {
    if (this.matchedRows.has(row.id) || this.selectedDataRows.has(row.id)) {
      // do not derive selected state if there are no children, or if `inferSelectedState` is set to false
      if (!row.children || row.inferSelectedState === false) {
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

/** Returns the child rows needed for deriving the selected state of a parent/group row */
function getChildrenForDerivingSelectState(row: GridDataRow<any>): GridDataRow<any>[] {
  // Only look deeper if the parent row does not infer its selected state
  if (row.children && row.inferSelectedState === false) {
    return [row, ...row.children.flatMap(getChildrenForDerivingSelectState)];
  }
  return [row];
}

/** Provides a context for rows to access their table's `TableState`. */
export const TableStateContext = React.createContext<{ tableState: TableState }>({
  get tableState(): TableState {
    console.log("wtf?");
    throw new Error("No TableStateContext provider");
  },
});

function readCollapsedRowStorage(persistCollapse: string): string[] {
  const collapsedGridRowIds = sessionStorage.getItem(persistCollapse);
  return collapsedGridRowIds ? JSON.parse(collapsedGridRowIds) : [];
}

function readExpandedColumnsStorage(persistCollapse: string): string[] {
  const expandedGridColumnIds = sessionStorage.getItem(getColumnStorageKey(persistCollapse));
  return expandedGridColumnIds ? JSON.parse(expandedGridColumnIds) : [];
}

// Get the columns that are already in the visible state so we keep them toggled.
function readOrSetLocalVisibleColumnState(columns: GridColumnWithId<any>[], storageKey: string): string[] {
  const storageValue = sessionStorage.getItem(storageKey);
  if (storageValue) {
    return JSON.parse(storageValue);
  }
  const visibleColumnIds = columns.filter((c) => c.initVisible || !c.canHide).map((c) => c.id);
  sessionStorage.setItem(storageKey, JSON.stringify(visibleColumnIds));
  return visibleColumnIds;
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

function getCollapsedIdsFromRows(rows: GridDataRow<any>[]): string[] {
  return rows.reduce((acc, r) => {
    if (r.initCollapsed) {
      acc.push(r.id);
    }

    if (r.children) {
      acc.push(...getCollapsedIdsFromRows(r.children));
    }

    return acc;
  }, [] as string[]);
}

function flattenRows(rows: GridDataRow<any>[]): GridDataRow<any>[] {
  const childRows = rows.flatMap((r) => (r.children ? flattenRows(r.children) : []));
  return [...rows, ...childRows];
}

function getColumnStorageKey(storageKey: string): string {
  return `expandedColumn_${storageKey}`;
}

// Exported for testing purposes
export function deriveSortState(
  currentSortState: SortState,
  clickedKey: string,
  initialSortState: SortState | undefined,
): SortState | undefined {
  // If the current sort state is not defined then sort ASC on the clicked key.
  if (!currentSortState.current) {
    return { ...initialSortState, current: { columnId: clickedKey, direction: ASC } };
  }

  const {
    current: { columnId: currentKey, direction: currentDirection },
  } = currentSortState;

  // If clicking a new column, then sort ASC on the clicked key
  if (clickedKey !== currentKey) {
    return { ...initialSortState, current: { columnId: clickedKey, direction: ASC } };
  }

  // If there is an `initialSortState` and we're clicking on that same key, then flip the sort.
  // Handles cases where the initial sort is DESC so that we can allow for DESC to ASC sorting.
  if (initialSortState && initialSortState.current?.columnId === clickedKey) {
    return {
      ...initialSortState,
      current: { columnId: clickedKey, direction: (currentDirection as any as string) === ASC ? DESC : ASC },
    };
  }

  // Otherwise when clicking the current column, toggle through sort states
  if ((currentDirection as any as string) === ASC) {
    // if ASC -> go to desc
    return { ...initialSortState, current: { columnId: clickedKey, direction: DESC } };
  }

  // Else, direction is already DESC, so revert to original sort value.
  return initialSortState;
}

type ColumnSort = {
  columnId: string;
  direction: Direction;
};

export type SortState = {
  current?: ColumnSort;
  /** The persistent sort is always applied first, i.e. for schedules, probably. */
  persistent?: ColumnSort;
};

export type SortOn = "client" | "server" | undefined;

function keptSelectionsFilter(row: GridDataRow<any>, matchedRows: ObservableSet<string>) {
  return (
    !matchedRows.has(row.id) &&
    row.selectable !== false &&
    !reservedRowKinds.includes(row.kind) &&
    (!row.children || row.inferSelectedState === false)
  );
}
