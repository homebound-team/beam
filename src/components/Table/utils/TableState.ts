import { makeAutoObservable, observable, reaction } from "mobx";
import React from "react";
import { GridDataRow } from "src/components/Table/components/Row";
import { GridSortConfig } from "src/components/Table/GridTable";
import { GridTableApi } from "src/components/Table/GridTableApi";
import { Direction, GridColumnWithId } from "src/components/Table/types";
import { ColumnStates } from "src/components/Table/utils/ColumnStates";
import { RowState } from "src/components/Table/utils/RowState";
import { RowStates } from "src/components/Table/utils/RowStates";
import { ASC, DESC, HEADER, KEPT_GROUP, reservedRowKinds } from "src/components/Table/utils/utils";

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
  private persistCollapse: string | undefined;
  // The current list of rows, basically a useRef.current. Only shallow reactive.
  private rows: GridDataRow<any>[] = [];
  // The current list of columns, basically a useRef.current. Only ref reactive.
  public columns: GridColumnWithId<any>[] = [];
  public readonly api: GridTableApi<any>;
  private readonly rowStates = new RowStates(this);
  private readonly columnStates = new ColumnStates();
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

  /**
   * Creates the `RowState` for a given `GridTable`.
   */
  constructor(api: GridTableApi<any>) {
    this.api = api;

    // Make ourselves an observable so that mobx will do caching of .collapseIds so
    // that it'll be a stable identity for GridTable to useMemo against.
    makeAutoObservable(this, {
      // We use `ref`s so that observables can watch the immutable data change w/o deeply proxy-ifying Apollo fragments
      rows: observable.ref,
      columns: observable.ref,
    } as any);

    // If the kept rows went from empty to not empty, then introduce the SELECTED_GROUP row as collapsed
    reaction(
      () => [...this.keptRows.values()],
      (curr, prev) => {
        if (prev.length === 0 && curr.length > 0) {
          this.rowStates.get(KEPT_GROUP).collapsed = true;
        }
      },
    );
  }

  loadCollapse(persistCollapse: string): void {
    this.persistCollapse = persistCollapse;
    this.rowStates.storage.load(persistCollapse);
    this.columnStates.loadExpanded(persistCollapse);
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
    if (rows !== this.rows) {
      this.rowStates.setRows(rows);
      this.rows = rows;
    }
  }

  setColumns(columns: GridColumnWithId<any>[], visibleColumnsStorageKey: string | undefined): void {
    if (columns !== this.columns) {
      this.columnStates.setColumns(columns, visibleColumnsStorageKey);
      this.columns = columns;
    }
  }

  setSearch(filter: string | undefined): void {
    this.rowStates.search.setSearch(filter);
  }

  get visibleRows(): RowState[] {
    return this.rowStates.visibleRows;
  }

  /** Returns visible columns, i.e. those that are visible + any expanded children. */
  get visibleColumns(): GridColumnWithId<any>[] {
    return this.columnStates.allVisibleColumns.map((cs) => cs.column);
  }

  /** Implements GridTableApi.visibleColumnIds. */
  get visibleColumnIds(): string[] {
    return this.visibleColumns.map((cs) => cs.id);
  }

  setVisibleColumns(ids: string[]) {
    this.columnStates.setVisibleColumns(ids);
  }

  get expandedColumnIds(): string[] {
    return this.columnStates.expandedColumns.map((cs) => cs.column.id);
  }

  isExpandedColumn(columnId: string): boolean {
    return this.columnStates.get(columnId).isExpanded;
  }

  toggleExpandedColumn(columnId: string) {
    this.columnStates.get(columnId).toggleExpanded();
  }

  numberOfExpandedChildren(columnId: string): number {
    // Should this be only _visible_ children?
    return this.columnStates.get(columnId).children?.length ?? 0;
  }

  loadExpandedColumns(columnId: string): Promise<void> {
    return this.columnStates.get(columnId).doExpand();
  }

  /** Returns selected data rows (non-header, non-totals, etc.), ignoring rows that have `row.selectable !== false`. */
  get selectedRows(): GridDataRow<any>[] {
    return this.rowStates.allStates
      .filter((rs) => rs.isSelected && !reservedRowKinds.includes(rs.row.kind))
      .map((rs) => rs.row);
  }

  /** Returns kept group row, with the latest kept children, if any. */
  get keptRowGroup(): GridDataRow<any> {
    return this.rowStates.get(KEPT_GROUP).row;
  }

  /** Returns kept rows, i.e. those that were user-selected but then client-side or server-side filtered. */
  get keptRows(): GridDataRow<any>[] {
    return this.rowStates.keptRows.map((rs) => rs.row);
  }

  // Should be called in an Observer/useComputed to trigger re-renders
  getSelected(id: string): SelectedState {
    const rs = this.rowStates.get(id);
    // The header has special behavior to "see through" selectable parents
    return id === HEADER ? rs.selectedStateForHeader : rs.selectedState;
  }

  selectRow(id: string, selected: boolean): void {
    this.rowStates.get(id).select(selected);
  }

  get collapsedIds(): string[] {
    return this.rowStates.collapsedRows.map((rs) => rs.row.id);
  }

  // Should be called in an Observer/useComputed to trigger re-renders
  isCollapsed(id: string): boolean {
    return this.rowStates.get(id).collapsed;
  }

  toggleCollapsed(id: string): void {
    this.rowStates.toggleCollapsed(id);
  }

  deleteRows(ids: string[]): void {
    this.rows = this.rows.filter((row) => !ids.includes(row.id));
    this.rowStates.delete(ids);
  }
}

/** Provides a context for rows to access their table's `TableState`. */
export const TableStateContext = React.createContext<{ tableState: TableState }>({
  get tableState(): TableState {
    throw new Error("No TableStateContext provider");
  },
});

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
