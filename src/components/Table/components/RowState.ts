import { makeAutoObservable, observable } from "mobx";
import { GridDataRow, reservedRowKinds, SelectedState } from "src";

/**
 * A reactive/observable state of each GridDataRow's current behavior.
 *
 * We set up the RowStates in a tree, just like GridDataRow, to make business logic
 * that uses parent/children easier to write, i.e. selected-ness and collapsed-ness.
 */
export class RowState {
  /** Our row, only ref observed, so we don't crawl into GraphQL fragments. */
  row: GridDataRow<any>;
  parent: RowState | undefined;
  children: RowState[] = [];
  /** Whether we match a client-side filter; true if no filter is in place. */
  isMatched = true;
  /** Our current selected state. */
  selected: SelectedState = "unchecked";
  /** Whether our `row` had been in `props.rows`, but was removed, i.e. probably by server-side filters. */
  wasRemoved = false;

  // ...eventually...
  // isDirectlyMatched = accept filters in the constructor and do match here
  // isEffectiveMatched = isDirectlyMatched || hasMatchedChildren

  constructor(parent: RowState | undefined, row: GridDataRow<any>) {
    this.parent = parent;
    this.row = row;
    makeAutoObservable(this, { row: observable.ref });
  }

  get isSelected(): boolean {
    return this.selected === "checked";
  }

  /** Whether this is a selected-but-filtered-out row that we should hoist to the top. */
  get isKept(): boolean {
    // this row is "kept" if it is selected, and:
    // - it is not matched (hidden by filter) (being hidden by collapse is okay)
    // - or it has (probably) been server-side filtered
    return (
      // Unselectable rows defacto cannot be kept
      this.row.selectable !== false &&
      // Headers, totals, etc., do not need keeping
      !reservedRowKinds.includes(this.row.kind) &&
      // Parents don't need keeping, unless they're actually real rows
      (!this.row.children || this.row.inferSelectedState === false) &&
      this.selected === "checked" &&
      (!this.isMatched || this.wasRemoved)
    );
  }
}
