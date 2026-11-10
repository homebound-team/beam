import { camelCase } from "change-case";
import { makeAutoObservable } from "mobx";
import type { GridColumnWithId, Kinded } from "src/components/Table/types";
import { isContentColumn, leafColumnName } from "src/components/Table/utils/columns";
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

  /**
   * Updates our internal columns states when `props.columns` changes.
   *
   * We handle sessionStorage here b/c we allow the user to either provide their own
   * storage key, or calc the storage key based on the currently-visible columns.
   * So like you expand a column, and new columns show up, but we'll remember they
   * were hidden last time you looked at this specific expansion of columns.
   */
  setColumns(columns: GridColumnWithId<R>[], visibleColumnsStorageKey: string | undefined): void {
    if (columns.some((c) => c.canHide)) {
      // We optionally auto-calc visible columns based on the currently-_potentially_-visible columns
      visibleColumnsStorageKey ??= camelCase(columns.map((c) => c.id).join());
      this.loadVisible(visibleColumnsStorageKey);
    }
    this.columns = columns.map((c) => this.addColumn(c));
    // After the very first non-zero `setColumns`, we disconnect from sessionStorage
    if (columns.length > 0) this.storage.done();
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

  /** Returns a flat list of all visible columns. */
  allVisibleColumns(showIn: "web" | "csv"): ColumnState<R>[] {
    return this.columns
      .flatMap((cs) => cs.maybeSelfAndChildren)
      .filter((cs) => !cs.column.showIn || cs.column.showIn === showIn)
      .filter((cs) => (showIn === "csv" ? isContentColumn(cs.column) : true));
  }

  /**
   * Shows the current columns in `ids` and hides the others. Columns that can't be hidden, like layout gutters, stay shown.
   * Columns not currently in the table keep their visibility, so a column that's temporarily removed comes back as it was.
   * With `shareColumnVisibility`, a removed column instead follows the current column with the same leaf name.
   */
  setVisibleColumns(ids: string[], opts: { shareColumnVisibility?: boolean } = {}): void {
    const current = this.columns.flatMap((c) => c.selfAndChildren);
    for (const cs of current) {
      cs.setVisible(ids.includes(cs.column.id));
    }
    if (!opts.shareColumnVisibility) return;
    // Columns not in the table right now should match the shown table columns with the same name
    const visibleByName = new Map<string, boolean>();
    for (const cs of current) {
      if (!cs.column.canHide || !cs.column.name) continue;
      const name = leafColumnName(cs.column);
      // Treat a name as hidden if any column with that name is hidden, like the Edit Columns switch does
      visibleByName.set(name, (visibleByName.get(name) ?? true) && cs.isVisible);
    }
    const currentIds = new Set(current.map((cs) => cs.column.id));
    // Apply that visibility to every column we have seen before that is not in the table right now
    for (const cs of this.map.values()) {
      if (currentIds.has(cs.column.id) || !cs.column.name) continue;
      const visible = visibleByName.get(leafColumnName(cs.column));
      if (visible !== undefined) cs.setVisible(visible);
    }
  }

  loadExpanded(storageKey: string): void {
    this.storage.loadExpanded(storageKey);
  }

  loadVisible(storageKey: string): void {
    this.storage.loadVisible(storageKey);
  }
}
