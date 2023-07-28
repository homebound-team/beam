import { ObservableMap } from "mobx";
import { GridDataRow, HEADER, KEPT_GROUP, reservedRowKinds } from "src";
import { CollapseState } from "src/components/Table/utils/CollapseState";
import { RowState } from "src/components/Table/utils/RowState";

/**
 * Manages our tree of observable RowStates that manage each GridDataRow's behavior.
 */
export class RowStates {
  // A flat map of all row id -> RowState
  private map = new ObservableMap<string, RowState>();
  collapseState = new CollapseState(this);
  // Pre-create our keptGroupRow for if/when we need it.
  keptGroupRow: RowState = this.creatKeptGroupRow();
  header: RowState | undefined = undefined;
  topRows: RowState[] = [];

  constructor() {
    this.map.set(this.keptGroupRow.row.id, this.keptGroupRow);
  }

  /** Returns a flat list of all of our RowStates. */
  get allStates(): RowState[] {
    return [...this.map.values()];
  }

  /** Returns the `RowState` for the given `id`. We should probably require `kind`. */
  get(id: string): RowState {
    const rs = this.map.get(id);
    if (!rs) throw new Error(`No RowState for ${id}`);
    return rs;
  }

  /**
   * Merge a new set of `rows` prop into our state.
   *
   * Any missing rows are marked as `wasRemoved` so we can consider them "kept" if they're also selected.
   */
  setRows(rows: GridDataRow<any>[]): void {
    const existing = new Set(this.map.values());
    const states = this;
    const map = this.map;

    function addRowAndChildren(parent: RowState | undefined, row: GridDataRow<any>): RowState {
      // This should really be kind+id, but a lot of our lookups just use id
      const key = row.id;
      let state = map.get(key);
      if (!state) {
        state = new RowState(states, parent, row);
        map.set(key, state);
      } else {
        state.parent = parent;
        state.row = row;
        state.wasRemoved = false;
        existing.delete(state);
      }
      state.children = row.children?.map((child) => addRowAndChildren(state, child));
      return state;
    }

    // Probe for the header row, so we can create it as a root RowState, even
    // though we don't require the user to model their GridDataRows that way.
    const headerRow = rows.find((r) => r.kind === HEADER);
    this.header = headerRow ? addRowAndChildren(undefined, headerRow) : undefined;
    // Add the top-level rows
    this.topRows = rows.filter((row) => row !== headerRow).map((row) => addRowAndChildren(this.header, row));
    // And attach them to the header for select-all/etc. to work
    if (this.header) {
      this.header.children = this.topRows.filter((rs) => !reservedRowKinds.includes(rs.row.kind));
    }

    // Then mark any remaining as removed
    for (const state of existing) {
      state.wasRemoved = true;
    }

    const keptRows = this.keptRows;
    if (keptRows.length > 0) {
      // Stitch the current keptRows into the placeholder keptGroupRow
      keptRows.forEach((rs) => (rs.parent = this.keptGroupRow));
      this.keptGroupRow.children = keptRows;
      this.keptGroupRow.row.children = keptRows.map((rs) => rs.row);
      // And then stitch the keptGroupRow itself into the root header, so that the kept rows
      // are treated as just another child for the header's select/unselect all to work.
      if (this.header) {
        this.keptGroupRow.parent = this.header;
        this.header.children!.unshift(this.keptGroupRow);
      }
    }

    // After the first load of real data, we detach collapse state, to respect
    // any incoming initCollapsed.
    if (this.topRows.some((rs) => !reservedRowKinds.includes(rs.row.kind))) {
      this.collapseState.done();
    }
  }

  /** Fully delete `ids`, so they don't show up in kept rows anymore. */
  delete(ids: string[]) {
    for (const id of ids) {
      const rs = this.map.get(id);
      if (rs && rs.parent) {
        rs.parent.children = rs.parent.children?.filter((o) => o !== rs);
      }
      this.map.delete(id);
    }
  }

  /** Implements special collapse behavior, which is just the header's collapse/uncollapse. */
  toggleCollapsed(id: string): void {
    const rs = this.get(id);
    if (rs === this.header) {
      if (rs.collapsed) {
        // The header being "opened" opens everything
        for (const rs of this.allStates) rs.collapsed = false;
      } else {
        // The header being "closed" marks all non-leaf rows as collapsed,
        // so that when the user re-opens them, they open a level at a time.
        for (const rs of this.allStates) {
          if (rs.children) rs.collapsed = true;
        }
      }
    } else {
      rs.toggleCollapsed();
      // The header might still be collapsed, even though the user has opened all the top-level rows
      if (this.topRows.every((rs) => !rs.children || !rs.collapsed) && this.header) {
        this.header.collapsed = false;
      }
      // Alternatively, if the user has collapsed all top-level rows, then collapse the header as well.
      if (this.topRows.every((rs) => !rs.children || rs.collapsed) && this.header) {
        this.header.collapsed = true;
      }
    }
  }

  setMatchedRows(ids: string[]): void {
    for (const rs of this.allStates) {
      // Don't mark headers, kept rows, etc. as unmatched, b/c they will always be visible,
      // i.e. the kept group row, if we've included it, is always matched.
      if (!reservedRowKinds.includes(rs.row.kind)) {
        rs.isMatched = ids.includes(rs.row.id);
      }
    }
  }

  /** Returns kept rows, i.e. those that were user-selected but then client-side or server-side filtered. */
  get keptRows(): RowState[] {
    return this.allStates.filter((rs) => rs.isKept);
  }

  get collapsedRows(): RowState[] {
    return this.allStates.filter((rs) => rs.collapsed);
  }

  private creatKeptGroupRow(): RowState {
    // The "group row" for selected rows that are hidden by filters and add the children
    const keptGroupRow: GridDataRow<any> = { id: KEPT_GROUP, kind: KEPT_GROUP, initCollapsed: true, data: undefined };
    return new RowState(this, undefined, keptGroupRow);
  }
}
