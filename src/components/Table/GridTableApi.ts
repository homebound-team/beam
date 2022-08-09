import { MutableRefObject, useMemo } from "react";
import { VirtuosoHandle } from "react-virtuoso";
import { DiscriminateUnion, GridDataRow, Kinded } from "src/components/Table/GridTable";
import { RowState } from "src/components/Table/RowState";
import { visit } from "src/components/Table/visitor";

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

  /** Set selected state of a row by id */
  selectRow: (id: string, selected?: boolean) => void;
};

// Using `FooImpl`to keep the public GridTableApi definition separate.
export class GridTableApiImpl<R extends Kinded> implements GridTableApi<R> {
  // This is public to GridTable but not exported outside of Beam
  readonly rowState: RowState = new RowState();
  virtuosoRef: MutableRefObject<VirtuosoHandle | null> = { current: null };

  /** Called once by the GridTable when it takes ownership of this api instance. */
  init(
    persistCollapse: string | undefined,
    virtuosoRef: MutableRefObject<VirtuosoHandle | null>,
    rows: GridDataRow<R>[],
  ) {
    this.rowState.loadCollapse(persistCollapse, rows);
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
    const ids = this.rowState.selectedIds;
    const selected: GridDataRow<R>[] = [];
    visit(this.rowState.rows, (row) => {
      if (row.selectable !== false && ids.includes(row.id) && (!kind || row.kind === kind)) {
        selected.push(row as any);
      }
    });
    return selected;
  }

  public clearSelections(id?: string) {
    this.rowState.selectRow("header", false);
  }

  public setActiveRowId(id: string | undefined) {
    this.rowState.activeRowId = id;
  }

  public selectRow(id: string, selected: boolean = true) {
    this.rowState.selectRow(id, selected);
  }
}
