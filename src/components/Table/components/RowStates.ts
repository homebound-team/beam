import { ObservableMap } from "mobx";
import { GridDataRow } from "src";
import { RowState } from "src/components/Table/components/RowState";

/**
 * Manages our tree of observable RowStates that manage each GridDataRow's behavior.
 */
export class RowStates {
  // A flat map of all row id -> RowState
  private map = new ObservableMap<string, RowState>();

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
    const map = this.map;

    function addRowAndChildren(parent: RowState | undefined, row: GridDataRow<any>): RowState {
      const key = `${row.kind}-${row.id}`;
      let state = map.get(key);
      if (!state) {
        state = new RowState(parent, row);
        map.set(key, state);
      } else {
        state.row = row;
        state.wasRemoved = false;
        existing.delete(state);
      }
      if (row.children) {
        state.children = row.children.map((child) => addRowAndChildren(state, child));
      }
      return state;
    }

    for (const row of rows) {
      addRowAndChildren(undefined, row);
    }
    // Now mark remaining has removed
    for (const state of existing) {
      state.wasRemoved = true;
    }
  }

  /** Fully delete `ids`, so they don't show up in kept rows anymore. */
  delete(ids: string[]) {
    for (const id of ids) {
      const rs = this.map.get(id);
      if (rs && rs.parent) {
        rs.children = rs.children.filter((o) => o !== rs);
      }
      this.map.delete(id);
    }
  }

  setMatchedRows(ids: string[]): void {
    for (const rs of this.allStates) {
      rs.isMatched = ids.includes(rs.row.id);
    }
  }
}
