import { camelCase } from "change-case";
import { comparer, makeAutoObservable, observable, ObservableMap, ObservableSet, reaction } from "mobx";
import React from "react";
import { GridDataRow } from "src/components/Table/components/Row";
import { GridSortConfig } from "src/components/Table/GridTable";
import { Direction, GridColumnWithId } from "src/components/Table/types";
import { ASC, DESC } from "src/components/Table/utils/utils";
import { visit } from "src/components/Table/utils/visitor";

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
  private readonly collapsedRows = new ObservableSet<string>();
  private persistCollapse: string | undefined;
  private readonly selectedRows = new ObservableMap<string, SelectedState>();
  // Set of just row ids. Keeps track of which rows match the filter. Used to filter rows from `selectedIds`
  private matchedRows = new ObservableSet<string>();
  // The current list of rows, basically a useRef.current. Not reactive.
  public rows: GridDataRow<any>[] = [];
  // Keeps track of the 'active' row, formatted `${row.kind}_${row.id}`
  activeRowId: string | undefined = undefined;
  // Keeps track of the 'active' cell, formatted `${row.kind}_${row.id}_${column.name}`
  activeCellId: string | undefined = undefined;

  // Keep a local copy of the `sortConfig` to ensure we only execute `initSortState` once, and determines if we should execute `setSortKey`
  public sortConfig: GridSortConfig | undefined;
  // Provide some defaults to get the sort state to properly work.
  public sort: SortState = {};
  // Keep track of the `initialSortState` so we can (1) revert back to it, and (2) properly derive next sort state
  private initialSortState: SortState | undefined;
  private onSort: ((orderBy: any | undefined, direction: Direction | undefined) => void) | undefined;

  // Non-reactive list of our columns
  public columns: GridColumnWithId<any>[] = [];
  // An observable set of column ids to keep track of which columns are currently expanded
  private expandedColumns = new ObservableSet<string>();
  // An observable set of column ids to keep track of which columns are visible
  public visibleColumns = new ObservableSet<string>();
  private visibleColumnsStorageKey: string = "";

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
    // Whenever our `matchedRows` change (i.e. via filtering) then we need to re-derive header and parent rows' selected state.
    reaction(
      () => [...this.matchedRows.values()].sort(),
      () => {
        const map = new Map<string, SelectedState>();
        map.set("header", deriveParentSelected(this.rows.flatMap((row) => this.setNestedSelectedStates(row, map))));
        // Merge the changes back into the selected rows state
        this.selectedRows.merge(map);
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

  loadSelected(rows: GridDataRow<any>[]): void {
    const selectedRows = rows.filter((row) => row.initSelected);
    // Initialize with selected rows as defined
    const map = new Map<string, SelectedState>();
    selectedRows.forEach((row) => {
      map.set(row.id, "checked");
    });

    this.selectedRows.merge(map);
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
            (!checkLocalStorage || readLocalCollapseState(this.persistCollapse!).includes(maybeNewRowId)),
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
  }

  setColumns(columns: GridColumnWithId<any>[], visibleColumnsStorageKey: string | undefined): void {
    if (columns !== this.columns) {
      this.columns = columns;
      this.visibleColumnsStorageKey = visibleColumnsStorageKey ?? camelCase(columns.map((c) => c.id).join());
      this.visibleColumns.replace(readOrSetLocalVisibleColumnState(columns, this.visibleColumnsStorageKey));
      const expandedColumnIds = columns.filter((c) => c.initExpanded).map((c) => c.id);
      this.expandedColumns.replace(expandedColumnIds);
    }
  }

  setVisibleColumns(ids: string[]) {
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
  }

  setMatchedRows(rowIds: string[]): void {
    // ObservableSet doesn't seem to do a `diff` inside `replace` before firing
    // observers/reactions that watch it, which can lead to render loops with the
    // application page is observing `GridTableApi.getSelectedRows`, and merely
    // the act of rendering GridTable (w/o row changes) causes it's `useComputed`
    // to be triggered.
    if (!comparer.shallow(rowIds, [...this.matchedRows.values()])) {
      this.matchedRows.replace(rowIds);
    }
  }

  get selectedIds(): string[] {
    // Return only ids that are fully checked, i.e. not partial
    const ids = [...this.selectedRows.entries()]
      .filter(([id, v]) => this.matchedRows.has(id) && v === "checked")
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
        visit(this.rows, (row) => this.matchedRows.has(row.id) && row.kind !== "totals" && map.set(row.id, "checked"));
        this.selectedRows.replace(map);
      } else {
        // Similarly "unmash" all rows + children.
        this.selectedRows.clear();
      }
    } else {
      // This is the regular/non-header behavior to just add/remove the individual row id,
      // plus percolate the change down-to-child + up-to-parents.

      // Find the clicked on row
      const curr = findRow(this.rows, id);
      if (!curr) {
        return;
      }

      // Everything here & down is deterministically on/off
      const map = new Map<string, SelectedState>();
      visit([curr.row], (row) => this.matchedRows.has(row.id) && map.set(row.id, selected ? "checked" : "unchecked"));

      // Now walk up the parents and see if they are now-all-checked/now-all-unchecked/some-of-each
      for (const parent of [...curr.parents].reverse()) {
        // Only derive selected state of the parent row if `inferSelectedState` is not `false`
        if (parent.children && parent.inferSelectedState !== false) {
          map.set(parent.id, deriveParentSelected(this.getMatchedChildrenStates(parent.children, map)));
        }
      }

      // And do the header + top-level "children" as a final one-off
      map.set("header", deriveParentSelected(this.getMatchedChildrenStates(this.rows, map)));

      this.selectedRows.merge(map);
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
        // Otherwise push `header` to the list as a hint that we're in the collapsed-all state
        collapsedIds.push("header");
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

  private getMatchedChildrenStates(children: GridDataRow<any>[], map: Map<string, SelectedState>): SelectedState[] {
    const respectedChildren = children.flatMap(getChildrenForDerivingSelectState);
    return respectedChildren
      .filter((row) => row.id !== "header" && this.matchedRows.has(row.id))
      .map((row) => map.get(row.id) || this.getSelected(row.id));
  }

  // Recursively traverse through rows to determine selected state of parent rows based on children
  private setNestedSelectedStates(row: GridDataRow<any>, map: Map<string, SelectedState>): SelectedState[] {
    if (this.matchedRows.has(row.id)) {
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
  if (row.children && row.inferSelectedState === false) {
    return [row, ...row.children.flatMap(getChildrenForDerivingSelectState)];
  }
  return [row];
}

/** Provides a context for rows to access their table's `TableState`. */
export const TableStateContext = React.createContext<{ tableState: TableState }>({
  get tableState(): TableState {
    throw new Error("No TableStateContext provider");
  },
});

// Get the rows that are already in the toggled state, so we can keep them toggled
function readLocalCollapseState(persistCollapse: string): string[] {
  const collapsedGridRowIds = sessionStorage.getItem(persistCollapse);
  return collapsedGridRowIds ? JSON.parse(collapsedGridRowIds) : [];
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
  persistent?: ColumnSort;
};

export type SortOn = "client" | "server" | undefined;
