import { ObservableMap } from "mobx";
import { GridDataRow } from "src/components/Table/components/Row";
import { RowState } from "src/components/Table/utils/RowState";
import { RowStorage } from "src/components/Table/utils/RowStorage";
import { HEADER, KEPT_GROUP, reservedRowKinds } from "src/components/Table/utils/utils";

/**
 * Manages our tree of observable RowStates that manage each GridDataRow's behavior.
 */
export class RowStates {
  // A flat map of all row id -> RowState
  private map = new ObservableMap<string, RowState>();
  storage = new RowStorage(this);
  // Pre-create our keptGroupRow for if/when we need it.
  private keptGroupRow: RowState = this.creatKeptGroupRow();
  private header: RowState | undefined = undefined;
  /** The first level of rows, i.e. not the header (or kept group), but the totals + top-level children. */
  private topRows: RowState[] = [];

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

    function addRowAndChildren(row: GridDataRow<any>): RowState {
      // This should really be kind+id, but a lot of our lookups just use id
      const key = row.id;
      let state = map.get(key);
      if (!state) {
        state = new RowState(states, row);
        map.set(key, state);
      } else {
        state.row = row;
        state.removed = false;
        existing.delete(state);
      }
      state.children = row.children?.map((child) => addRowAndChildren(child));
      return state;
    }

    // Probe for the header row, so we can create it as a root RowState, even
    // though we don't require the user to model their GridDataRows that way.
    const headerRow = rows.find((r) => r.kind === HEADER);
    this.header = headerRow ? addRowAndChildren(headerRow) : undefined;
    // Add the top-level rows
    this.topRows = rows.filter((row) => row !== headerRow).map((row) => addRowAndChildren(row));
    // And attach them to the header for select-all/etc. to work
    if (this.header) {
      this.header.children = [
        // Always add the keptGroupRow, and we'll use keptGroupRow.isMatched=true/false to keep it
        // from missing up "header is all selected" if its hidden/when there are no kept rows.
        this.keptGroupRow,
        ...this.topRows.filter((rs) => !reservedRowKinds.includes(rs.row.kind)),
      ];
    }

    // Then mark any remaining as removed
    for (const state of existing) state.markRemoved();

    // After the first load of real data, we detach collapse state, to respect
    // any incoming initCollapsed.
    if (this.topRows.some((rs) => !reservedRowKinds.includes(rs.row.kind))) {
      this.storage.done();
    }
  }

  /** Fully delete `ids`, so they don't show up in kept rows anymore. */
  delete(ids: string[]) {
    for (const id of ids) {
      const rs = this.map.get(id);
      if (rs) rs.removed = "hard";
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
    // We cheat a little and pretend the "kept group matches the filter" not based on it itself
    // literally matching the filter, or its children matching the filter (which is typically
    // how the filter logic works), but if it just has any child rows at all (which actually means
    // its children did _not_ match the filter, but are kept).
    this.keptGroupRow.isMatched = this.keptRows.length > 0;
  }

  /** Returns kept rows, i.e. those that were user-selected but then client-side or server-side filtered. */
  get keptRows(): RowState[] {
    return this.allStates.filter((rs) => rs.isKept);
  }

  get collapsedRows(): RowState[] {
    return this.allStates.filter((rs) => rs.collapsed);
  }

  /** Create our synthetic "group row" for kept rows, that users never pass in, but we self-inject as needed. */
  private creatKeptGroupRow(): RowState {
    // The "group row" for selected rows that are hidden by filters and add the children
    const keptGroupRow: GridDataRow<any> = {
      id: KEPT_GROUP,
      kind: KEPT_GROUP,
      initCollapsed: true,
      // The kept group is basically always selected
      initSelected: true,
      data: undefined,
      children: [],
    };
    return new RowState(this, keptGroupRow);
  }
}
