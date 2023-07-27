import { ObservableMap } from "mobx";
import { GridDataRow, HEADER, reservedRowKinds } from "src";
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
      // This should really be kind+id, but a lot of our lookups just use id
      const key = row.id;
      let state = map.get(key);
      if (!state) {
        state = new RowState(parent, row);
        state.selected = !!row.initSelected;
        map.set(key, state);
      } else {
        state.row = row;
        state.wasRemoved = false;
        existing.delete(state);
      }
      state.children = row.children?.map((child) => addRowAndChildren(state, child));
      return state;
    }

    // Probe for the header row, so we can create it as a root RowState, even
    // though we don't require the user to model their GridDataRows that way.
    const header = rows.find((r) => r.kind === HEADER);
    const headerState = header ? addRowAndChildren(undefined, header) : undefined;
    // Add the top-level rows
    const children = rows.map((row) => addRowAndChildren(headerState, row));
    // And attach them to the header for select-all/etc. to work
    if (headerState) {
      headerState.children = children.filter((rs) => !reservedRowKinds.includes(rs.row.kind));
    }

    // Then mark any remaining as removed
    for (const state of existing) {
      state.wasRemoved = true;
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

  setMatchedRows(ids: string[]): void {
    for (const rs of this.allStates) {
      rs.isMatched = ids.includes(rs.row.id);
    }
  }
}
