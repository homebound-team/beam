import { makeAutoObservable } from "mobx";
import { GridColumnWithId, Kinded } from "src";
import { type PageSessionStorage } from "src/hooks/usePageSessionStorage";
import { ColumnState } from "src/components/Table/utils/ColumnState";
import { ColumnStorage } from "src/components/Table/utils/ColumnStorage";

/** A reactive/observable wrapper around our columns. */
export class ColumnStates<R extends Kinded> {
  // The top-level list of columns
  private columns: ColumnState<R>[] = [];
  private map = new Map<string, ColumnState<R>>();
  private storage = new ColumnStorage(this);

  constructor() {
    makeAutoObservable(this);
  }

  /** Updates our internal column states when `props.columns` changes. */
  setColumns(columns: GridColumnWithId<R>[]): void {
    this.columns = columns.map((c) => this.addColumn(c));
  }

  /** Adds a column to our state, i.e. maybe a dynamically loaded column. */
  addColumn(column: GridColumnWithId<R>): ColumnState<R> {
    const existing = this.map.get(column.id);
    if (!existing) {
      const cs = new ColumnState(this, this.storage, column);
      this.map.set(column.id, cs);
      return cs;
    } else {
      existing.column = column;
      // Any time a column is re-added (i.e. props.columns changed), re-expand it
      // TODO: verify this eslint ignore
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      if (existing.isExpanded) existing.doExpand(true);
      return existing;
    }
  }

  /** Returns the `ColumnState` for the given `id`. */
  get(id: string): ColumnState<R> {
    const cs = this.map.get(id);
    if (!cs) throw new Error(`No ColumnState for ${id}`);
    return cs;
  }

  /** Returns all currently-expanded columns. */
  get expandedColumns(): ColumnState<R>[] {
    return this.columns.filter((cs) => cs.isExpanded);
  }

  /** Returns every current column, including hidden and loaded children. */
  get allColumns(): ColumnState<R>[] {
    return this.columns.flatMap((cs) => cs.selfAndLoadedChildren);
  }

  /** Returns a flat list of all visible columns. */
  allVisibleColumns(showIn: "web" | "csv"): ColumnState<R>[] {
    return this.columns
      .flatMap((cs) => cs.maybeSelfAndChildren)
      .filter((cs) => !cs.column.showIn || cs.column.showIn === showIn)
      .filter((cs) => (showIn === "csv" ? !cs.column.isAction : true));
  }

  setVisibleColumns(ids: string[]): void {
    for (const cs of this.map.values()) {
      cs.setVisible(ids.includes(cs.column.id));
    }
  }

  loadExpanded(storage: PageSessionStorage): void {
    this.storage.loadExpanded(storage);
  }

  loadVisible(storage: PageSessionStorage): void {
    this.storage.loadVisible(storage);
  }
}
