import { comparer } from "mobx";
import { computedFn } from "mobx-utils";
import { MutableRefObject, useMemo } from "react";
import { VirtuosoHandle } from "react-virtuoso";
import {
  applyRowFn,
  createRowLookup,
  GridRowLookup,
  GridTableScrollOptions,
  isGridCellContent,
  isJSX,
  MaybeFn,
} from "src/components/index";
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
  /** Scrolls row `index` into view;  only supported with `as=virtual` and after a `useEffect`.
   *
   * Defaults "smooth" behavior; Use {index, behavior: "auto"} for instant scroll in cases where grid table has many, many records and the scroll effect is undesirable.
   * */
  scrollToIndex(index: GridTableScrollOptions): void;

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

  /**
   * Triggers the table's current content to be downloaded as a CSV file.
   *
   * This currently assumes client-side pagination/sorting, i.e. we have the full dataset in memory.
   */
  downloadToCsv(fileName: string): void;

  /**
   * Copies the table's current content to the clipboard.
   *
   * This currently assumes client-side pagination/sorting, i.e. we have the full dataset in memory.
   */
  copyToClipboard(): Promise<void>;
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

  public scrollToIndex(index: GridTableScrollOptions): void {
    this.virtuosoRef.current &&
      this.virtuosoRef.current.scrollToIndex(typeof index === "number" ? { index, behavior: "smooth" } : index);
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

  public downloadToCsv(fileName: string): void {
    // Create a link element, set the download attribute with the provided filename
    const link = document.createElement("a");
    if (link.download === undefined) throw new Error("This browser does not support the download attribute.");
    // Create a Blob from the CSV content
    const url = URL.createObjectURL(
      new Blob([this.generateCsvContent().join("\n")], { type: "text/csv;charset=utf-8;" }),
    );
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  public copyToClipboard(): Promise<void> {
    // Copy the CSV content to the clipboard
    const content = this.generateCsvContent().join("\n");
    return navigator.clipboard.writeText(content).catch((err) => {
      // Let the user know the copy failed...
      window.alert("Failed to copy to clipboard, probably due to browser restrictions.");
      throw err;
    });
  }

  // visibleForTesting, not part of the GridTableApi
  // ...although maybe it could be public someday, to allow getting the raw the CSV content
  // and then sending it somewhere else, like directly to a gsheet.
  public generateCsvContent(): string[] {
    const csvPrefixRows = this.tableState.csvPrefixRows?.map((row) => row.map(escapeCsvValue).join(",")) ?? [];
    // Convert the array of rows into CSV format
    const dataRows = this.tableState.visibleRows.map((rs) => {
      const values = this.tableState.visibleColumns
        .filter((c) => !c.isAction)
        .map((c) => {
          // Just guessing for level=1
          const maybeContent = applyRowFn(c, rs.row, this as any as GridRowApi<R>, 1, true, undefined);
          if (isGridCellContent(maybeContent)) {
            const cell = maybeContent;
            const content = maybeApply(cell.content);
            // Anything not isJSX (like a string) we can put into the CSV directly
            if (!isJSX(content)) return content;
            // Otherwise use the value/sortValue values
            return cell.value ? maybeApply(cell.value) : cell.sortValue ? maybeApply(cell.sortValue) : "-";
          } else {
            // ReactNode
            return isJSX(maybeContent) ? "-" : maybeContent;
          }
        });
      return values.map(toCsvString).map(escapeCsvValue).join(",");
    });
    return [...csvPrefixRows, ...dataRows];
  }
}

function toCsvString(value: any): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function escapeCsvValue(value: string): string {
  // Wrap values with special chars in quotes, and double quotes themselves
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function bindMethods(instance: any): void {
  Object.getOwnPropertyNames(Object.getPrototypeOf(instance)).forEach((key) => {
    if (instance[key] instanceof Function && key !== "constructor") instance[key] = instance[key].bind(instance);
  });
}

export function maybeApply<T>(maybeFn: MaybeFn<T>): T {
  return typeof maybeFn === "function" ? (maybeFn as any)() : maybeFn;
}
