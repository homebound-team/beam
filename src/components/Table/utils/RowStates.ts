import { ObservableMap } from "mobx";
import { Kinded } from "src";
import { GridDataRow } from "src/components/Table/components/Row";
import { DraggedOver, RowState } from "src/components/Table/utils/RowState";
import { RowStorage } from "src/components/Table/utils/RowStorage";
import { TableState } from "src/components/Table/utils/TableState";
import { HEADER, KEPT_GROUP, reservedRowKinds } from "src/components/Table/utils/utils";

/**
 * Manages our tree of observable RowStates that manage each GridDataRow's behavior.
 */
export class RowStates<R extends Kinded> {
  // A flat map of all row id -> RowState
  private map = new ObservableMap<string, RowState<R>>();
  readonly table: TableState<R>;
  readonly storage = new RowStorage(this);
  // Pre-create the header to drive select-all/etc. behavior, even if the user
  // doesn't pass an explicit `header` GridDataRow in `rows.props`
  private readonly header: RowState<R>;
  // Pre-create our keptGroupRow for if/when we need it.
  private keptGroupRow: RowState<R>;
  /** The first level of rows, i.e. not the header (or kept group), but the totals + top-level children. */
  private topRows: RowState<R>[] = [];

  constructor(table: TableState<R>) {
    this.table = table;
    this.header = this.createHeaderRow();
    this.keptGroupRow = this.createKeptGroupRow(this.header);
    this.map.set(this.header.row.id, this.header);
    this.map.set(this.keptGroupRow.row.id, this.keptGroupRow);
  }

  /** Returns a flat list of all of our RowStates. */
  get allStates(): RowState<R>[] {
    return [...this.map.values()];
  }

  /** Returns the `RowState` for the given `id`. We should probably require `kind`. */
  get(id: string): RowState<R> {
    const rs = this.map.get(id);
    if (!rs) throw new Error(`No RowState for ${id}`);
    return rs;
  }

  /**
   * Merge a new set of `rows` prop into our state.
   *
   * Any missing rows are marked as `wasRemoved` so we can consider them "kept" if they're also selected.
   */
  setRows(rows: GridDataRow<R>[]): void {
    const states = this;
    const map = this.map;
    // Keep track of ids as we add them, to detect duplicates
    const seenIds = new Set<string>();
    // Keep track of existing rows, so we can mark any that are missing as removed
    const maybeKept = new Set(this.map.values());

    function addRowAndChildren(parent: RowState<R> | undefined, row: GridDataRow<R>): RowState<R> {
      // This should really be kind+id, but nearly all of our existing API uses just ids,
      // b/c we assume our ids are tagged/unique across parent/child kinds anyway. So go
      // ahead and enforce "row.id must be unique across kinds" b/c pragmatically that is
      // baked into the current API signatures.
      const key = row.id;

      if (seenIds.has(key)) {
        throw new Error(`Duplicate row id ${key}`);
      } else {
        seenIds.add(key);
      }

      let state = map.get(key);
      if (!state) {
        state = new RowState(states, parent, row);
        map.set(key, state);
      } else {
        state.parent = parent;
        state.row = row;
        state.removed = false;
        maybeKept.delete(state);
      }
      state.children = row.children?.map((child) => addRowAndChildren(state, child));
      return state;
    }

    // Probe for the header row, so we can create it as a root RowState, even
    // though we don't require the user to model their GridDataRows that way.
    const headerRow = rows.find((r) => r.kind === HEADER);
    this.header.row = headerRow || (missingHeader as GridDataRow<R>);
    // Add the top-level rows
    this.topRows = rows.filter((row) => row !== headerRow).map((row) => addRowAndChildren(this.header, row));
    // Always add the keptGroupRow, and we'll use keptGroupRow.isMatched=true/false to keep it
    // from messing up "header is all selected" if its hidden/when there are no kept rows.
    this.header.children = [this.keptGroupRow, ...this.topRows];

    // Then mark any remaining as removed
    for (const state of maybeKept) (state as any).markRemoved();

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

  get visibleRows(): RowState<R>[] {
    const rows = this.header.selfAndMaybeChildren;
    if (this.header.row === missingHeader) {
      rows.splice(0, 1);
    }
    return rows;
  }

  /** Returns kept rows, i.e. those that were user-selected but then client-side or server-side filtered. */
  get keptRows(): RowState<R>[] {
    return this.allStates.filter((rs) => rs.isKept);
  }

  get collapsedRows(): RowState<R>[] {
    return this.allStates.filter((rs) => rs.collapsed);
  }

  private createHeaderRow(): RowState<R> {
    // We'll switch the rs.row from the `missingHeader` to the real header from the props.rows later
    return new RowState(this, undefined, missingHeader as GridDataRow<R>);
  }

  /** Create our synthetic "group row" for kept rows, that users never pass in, but we self-inject as needed. */
  private createKeptGroupRow(header: RowState<R>): RowState<R> {
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

  maybeSetRowDraggedOver(
    id: string,
    draggedOver: DraggedOver,
    requireSameParentRow: GridDataRow<R> | undefined = undefined,
  ): void {
    const rs = this.get(id);

    if (requireSameParentRow) {
      const requireParentRowState = this.get(requireSameParentRow.id);
      if (requireParentRowState.parent?.row?.id !== rs.parent?.row?.id) return;
    }

    // if this is an expanded parent and draggedOver is Below then we want to set this on this rows bottom-most child
    if (!rs.collapsed && rs.children && rs.children?.length > 0 && draggedOver === DraggedOver.Below) {
      let rowState = rs;
      // recursively find the bottom-most child
      while (rowState.children && rowState.children?.length > 0) {
        rowState = rowState.children[rowState.children.length - 1];
      }

      rowState.isDraggedOver = draggedOver;
      return;
    }

    // this allows a single-row re-render
    if (rs.isDraggedOver === draggedOver) return;
    rs.isDraggedOver = draggedOver;
  }
}

const missingHeader = { kind: "header" as const, id: "header", data: "MISSING" };
