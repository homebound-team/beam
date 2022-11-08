import { MutableRefObject, useMemo } from "react";
import { VirtuosoHandle } from "react-virtuoso";
import { GridDataRow } from "src/components/Table/components/Row";
import { DiscriminateUnion, Kinded } from "src/components/Table/types";
import { TableState } from "src/components/Table/utils/TableState";
import { visit } from "src/components/Table/utils/visitor";

/**
 * Creates an `api` handle to drive a `GridTable`.
 *
 * ```
 * const api = useGridTableApi<Row>();
 * const count = useComputed(() => api.getSelectedRows().length, [api]);
 * ...
 * return <GridTable api={api} />
 * ```
 *
 * This is very similar to a `useRef`, except that the parent function has
 * immediate access to `api` and can use it for `useComputed`, instead of
 * having to wait for `ref.current` to be set after the child `GridTable`
 * has ran.
 */
export function useGridTableApi<R extends Kinded>(): GridTableApi<R> {
  return useMemo(() => new GridTableApiImpl<R>(), []);
}

/** Provides an imperative API for an application page to interact with the table. */
export type GridTableApi<R extends Kinded> = {
  /** Scrolls row `index` into view; only supported with `as=virtual` and after a `useEffect`. */
  scrollToIndex: (index: number) => void;

  /** Returns the ids of currently-selected rows. */
  getSelectedRowIds(): string[];
  getSelectedRowIds<K extends R["kind"]>(kind: K): string[];

  /** Returns the currently-selected rows. */
  getSelectedRows(): GridDataRow<R>[];
  getSelectedRows<K extends R["kind"]>(kind: K): GridDataRow<DiscriminateUnion<R, "kind", K>>[];

  /** Deselects all rows */
  clearSelections(): void;

  /** Sets the internal state of 'activeRowId' */
  setActiveRowId: (id: string | undefined) => void;

  /** Sets the internal state of 'activeCellId' */
  setActiveCellId: (id: string | undefined) => void;

  /** Set selected state of a row by id */
  selectRow: (id: string, selected?: boolean) => void;

  /** Toggle collapse state of a row by id */
  toggleCollapsedRow: (id: string) => void;
  setVisibleColumns: (ids: string[]) => void;
  getVisibleColumnIds: () => string[];
};

// Using `FooImpl`to keep the public GridTableApi definition separate.
export class GridTableApiImpl<R extends Kinded> implements GridTableApi<R> {
  // This is public to GridTable but not exported outside of Beam
  readonly tableState: TableState = new TableState();
  virtuosoRef: MutableRefObject<VirtuosoHandle | null> = { current: null };

  /** Called once by the GridTable when it takes ownership of this api instance. */
  init(
    persistCollapse: string | undefined,
    virtuosoRef: MutableRefObject<VirtuosoHandle | null>,
    rows: GridDataRow<R>[],
  ) {
    this.tableState.loadCollapse(persistCollapse, rows);
    this.tableState.loadSelected(rows);
    this.virtuosoRef = virtuosoRef;
  }

  public scrollToIndex(index: number): void {
    this.virtuosoRef.current && this.virtuosoRef.current.scrollToIndex(index);
  }

  public getSelectedRowIds(kind?: string): string[] {
    return this.getSelectedRows(kind).map((row: any) => row.id);
  }

  // The any is not great, but getting the overload to handle the optional kind is annoying
  public getSelectedRows(kind?: string): any {
    const ids = this.tableState.selectedIds;
    const selected: GridDataRow<R>[] = [];
    visit(this.tableState.rows, (row) => {
      if (row.selectable !== false && ids.includes(row.id) && (!kind || row.kind === kind)) {
        selected.push(row as any);
      }
    });
    return selected;
  }

  public clearSelections(id?: string) {
    this.tableState.selectRow("header", false);
  }

  public setActiveRowId(id: string | undefined) {
    this.tableState.activeRowId = id;
  }

  public setActiveCellId(id: string | undefined) {
    this.tableState.activeCellId = id;
  }

  public selectRow(id: string, selected: boolean = true) {
    this.tableState.selectRow(id, selected);
  }

  public toggleCollapsedRow(id: string) {
    this.tableState.toggleCollapsed(id);
  }

  public setVisibleColumns(ids: string[]) {
    this.tableState.setVisibleColumns(ids);
  }

  public getVisibleColumnIds() {
    return this.tableState.visibleColumnIds;
  }
}
