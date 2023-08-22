import { comparer } from "mobx";
import { computedFn } from "mobx-utils";
import { MutableRefObject, useMemo } from "react";
import { VirtuosoHandle } from "react-virtuoso";
import { createRowLookup, GridRowLookup } from "src/components/index";
import { GridDataRow } from "src/components/Table/components/Row";
import { DiscriminateUnion, Kinded } from "src/components/Table/types";
import { TableState } from "src/components/Table/utils/TableState";

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
 * has run.
 */
export function useGridTableApi<R extends Kinded>(): GridTableApi<R> {
  return useMemo(() => new GridTableApiImpl<R>(), []);
}

/** Provides an imperative API for an application page to interact with the table. */
export type GridTableApi<R extends Kinded> = {
  /** Scrolls row `index` into view; only supported with `as=virtual` and after a `useEffect`. */
  scrollToIndex(index: number): void;

  /** Returns the currently-visible rows. */
  getVisibleRows(): GridDataRow<R>[];
  /** Returns the currently-visible rows of the given `kind`. */
  getVisibleRows<K extends R["kind"]>(kind: K): GridDataRow<DiscriminateUnion<R, "kind", K>>[];

  /** Returns the ids of currently-selected rows. */
  getSelectedRowIds(): string[];
  getSelectedRowIds<K extends R["kind"]>(kind: K): string[];
  /** Returns the currently-selected rows. */
  getSelectedRows(): GridDataRow<R>[];
  /** Returns the currently-selected rows of the given `kind`. */
  getSelectedRows<K extends R["kind"]>(kind: K): GridDataRow<DiscriminateUnion<R, "kind", K>>[];
  /** Set selected state of a row by id. */
  selectRow(id: string, selected?: boolean): void;
  /** De-selects all selected rows. */
  clearSelections(): void;

  /** Whether a row is currently collapsed. */
  isCollapsedRow(id: string): boolean;
  /** Toggle collapse state of a row by id. */
  toggleCollapsedRow(id: string): void;

  /** Sets the internal state of 'activeRowId' */
  setActiveRowId(id: string | undefined): void;
  /** Sets the internal state of 'activeCellId' */
  setActiveCellId(id: string | undefined): void;

  /** Deletes a row from the table, i.e. so it's not detected as kept. */
  deleteRows(ids: string[]): void;

  getVisibleColumnIds(): string[];
  setVisibleColumns(ids: string[]): void;
};

/** Adds per-row methods to the `api`, i.e. for getting currently-visible children. */
export type GridRowApi<R extends Kinded> = GridTableApi<R> & {
  getVisibleChildren(): GridDataRow<R>[];
  getVisibleChildren<K extends R["kind"]>(kind: K): GridDataRow<DiscriminateUnion<R, "kind", K>>[];
  getSelectedChildren(): GridDataRow<R>[];
  getSelectedChildren<K extends R["kind"]>(kind: K): GridDataRow<DiscriminateUnion<R, "kind", K>>[];
};

// Using `FooImpl`to keep the public GridTableApi definition separate.
export class GridTableApiImpl<R extends Kinded> implements GridTableApi<R> {
  // This is public to GridTable but not exported outside of Beam
  readonly tableState: TableState<R> = new TableState(this);
  virtuosoRef: MutableRefObject<VirtuosoHandle | null> = { current: null };
  lookup!: GridRowLookup<R>;

  constructor() {
    // This instance gets spread into each row's GridRowApi, so bind the methods up-front
    bindMethods(this);
    // Memoize these so that if the user is creating new `data` instances on every render, they
    // can use `getSelectedRowIds` to observer a stable list of `[pi:1, pi:2]`, etc.
    this.getVisibleRowsImpl = computedFn(this.getVisibleRowsImpl, { equals: comparer.shallow });
    this.getVisibleRowIdsImpl = computedFn(this.getVisibleRowIdsImpl, { equals: comparer.shallow });
    this.getSelectedRowsImpl = computedFn(this.getSelectedRowsImpl, { equals: comparer.shallow });
    this.getSelectedRowIdsImpl = computedFn(this.getSelectedRowIdsImpl, { equals: comparer.shallow });
  }

  /** Called once by the GridTable when it takes ownership of this api instance. */
  init(persistCollapse: string | undefined, virtuosoRef: MutableRefObject<VirtuosoHandle | null>) {
    // Technically this drives both row-collapse and column-expanded
    if (persistCollapse) this.tableState.loadCollapse(persistCollapse);
    this.virtuosoRef = virtuosoRef;
    this.lookup = createRowLookup(this, virtuosoRef);
  }

  public scrollToIndex(index: number): void {
    this.virtuosoRef.current && this.virtuosoRef.current.scrollToIndex(index);
  }

  public getSelectedRowIds(kind?: string): string[] {
    return this.getSelectedRowIdsImpl(kind ?? undefined);
  }

  // impl with required param for computedFn
  private getSelectedRowIdsImpl(kind: string | undefined): string[] {
    return this.tableState.selectedRows.filter((rs) => !kind || rs.kind === kind).map((rs) => rs.row.id);
  }

  public getSelectedRows(kind?: string): any {
    return this.getSelectedRowsImpl(kind ?? undefined);
  }

  // impl with required param for computedFn
  private getSelectedRowsImpl(kind: string | undefined): any {
    return this.tableState.selectedRows.filter((rs) => !kind || rs.kind === kind).map((rs) => rs.row);
  }

  // The `any` is not great, but getting the overload to handle the optional kind is annoying
  public getVisibleRows(kind?: string): any {
    return this.getVisibleRowsImpl(kind ?? undefined);
  }

  // impl with required param for computedFn
  private getVisibleRowsImpl(kind: string | undefined) {
    return this.tableState.visibleRows.filter((row) => !kind || row.kind === kind).map((rs) => rs.row);
  }

  public getVisibleRowIds(kind?: string): any {
    return this.getVisibleRowIdsImpl(kind ?? undefined);
  }

  // impl with required param for computedFn
  private getVisibleRowIdsImpl(kind: string | undefined) {
    return this.tableState.visibleRows.filter((row) => !kind || row.kind === kind).map((rs) => rs.row.id);
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

  public isCollapsedRow(id: string) {
    return this.tableState.isCollapsed(id);
  }

  public setVisibleColumns(ids: string[]) {
    this.tableState.setVisibleColumns(ids);
  }

  public getVisibleColumnIds() {
    return this.tableState.visibleColumnIds;
  }

  public deleteRows(ids: string[]) {
    this.tableState.deleteRows(ids);
  }
}

function bindMethods(instance: any): void {
  Object.getOwnPropertyNames(Object.getPrototypeOf(instance)).forEach((key) => {
    if (instance[key] instanceof Function && key !== "constructor") instance[key] = instance[key].bind(instance);
  });
}
