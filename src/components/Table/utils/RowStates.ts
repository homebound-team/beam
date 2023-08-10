import { ObservableMap } from "mobx";
import { GridDataRow } from "src/components/Table/components/Row";
import { RowState } from "src/components/Table/utils/RowState";
import { RowStorage } from "src/components/Table/utils/RowStorage";
import { TableState } from "src/components/Table/utils/TableState";
import { HEADER, KEPT_GROUP, reservedRowKinds } from "src/components/Table/utils/utils";

/**
 * Manages our tree of observable RowStates that manage each GridDataRow's behavior.
 */
export class RowStates {
  // A flat map of all row id -> RowState
  private map = new ObservableMap<string, RowState>();
  readonly table: TableState;
  readonly storage = new RowStorage(this);
  // Pre-create the header to drive select-all/etc. behavior, even if the user
  // doesn't pass an explicit `header` GridDataRow in `rows.props`
  private readonly header: RowState = this.createHeaderRow();
  // Pre-create our keptGroupRow for if/when we need it.
  private keptGroupRow: RowState = this.createKeptGroupRow(this.header);
  /** The first level of rows, i.e. not the header (or kept group), but the totals + top-level children. */
  private topRows: RowState[] = [];

  constructor(table: TableState) {
    this.table = table;
    this.map.set(this.header.row.id, this.header);
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
        state.removed = false;
        existing.delete(state);
      }
      state.children = row.children?.map((child) => addRowAndChildren(state, child));
      return state;
    }

    // Probe for the header row, so we can create it as a root RowState, even
    // though we don't require the user to model their GridDataRows that way.
    const headerRow = rows.find((r) => r.kind === HEADER);
    this.header.row = headerRow || missingHeader;
    // Add the top-level rows
    this.topRows = rows.filter((row) => row !== headerRow).map((row) => addRowAndChildren(this.header, row));
    // Always add the keptGroupRow, and we'll use keptGroupRow.isMatched=true/false to keep it
    // from messing up "header is all selected" if its hidden/when there are no kept rows.
    this.header.children = [this.keptGroupRow, ...this.topRows];

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
      // Ignore the kept group
      const topGroupRows = this.topRows.filter((rs) => !rs.isReservedKind && rs.children);
      if (topGroupRows.length > 0) {
        // The header might still be collapsed, even though the user has opened all the top-level rows
        if (topGroupRows.every((rs) => !rs.collapsed)) this.header.collapsed = false;
        // Alternatively, if the user has collapsed all top-level rows, then collapse the header as well.
        if (topGroupRows.every((rs) => rs.collapsed)) this.header.collapsed = true;
      }
    }
  }

  get visibleRows(): RowState[] {
    const rows = this.header.selfAndMaybeChildren;
    if (this.header.row === missingHeader) {
      rows.splice(0, 1);
    }
    return rows;
  }

  /** Returns kept rows, i.e. those that were user-selected but then client-side or server-side filtered. */
  get keptRows(): RowState[] {
    return this.allStates.filter((rs) => rs.isKept);
  }

  get collapsedRows(): RowState[] {
    return this.allStates.filter((rs) => rs.collapsed);
  }

  private createHeaderRow(): RowState {
    // We'll switch the rs.row from the `missingHeader` to the real header from the props.rows later
    return new RowState(this, undefined, missingHeader);
  }

  /** Create our synthetic "group row" for kept rows, that users never pass in, but we self-inject as needed. */
  private createKeptGroupRow(header: RowState): RowState {
    // The "group row" for selected rows that are hidden by filters and add the children
    const keptGroupRow: GridDataRow<any> = {
      id: KEPT_GROUP,
      kind: KEPT_GROUP,
      initCollapsed: true,
      selectable: false,
      data: undefined,
      children: [],
      pin: { at: "first", filter: true },
    };
    const rs = new RowState(this, header, keptGroupRow);
    // Make the RowState behave like a parent, even though we calc its visibleChildren.
    rs.children = [];
    return rs;
  }
}

const missingHeader = { kind: "header" as const, id: "header", data: undefined };
