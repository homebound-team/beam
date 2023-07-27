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
  /** Our children row state, as of the latest `props.rows`, without any filtering applied. */
  children: RowState[] | undefined = undefined;
  /** Whether we match a client-side filter; true if no filter is in place. */
  isMatched = true;
  /** Whether we are *directly* selected. */
  selected = false;
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

  /**
   * Whether we are currently selected.
   *
   * Note that we don't use "I'm selected || my parent is selected" logic here, because whether a child is selected
   * is actually based on whether it was _visible at the time the parent was selected_. So, we can just assume
   * "a parent being selected means the child is selected", and instead parents have to push selected-ness down
   * to their visible children explicitly.
   */
  get isSelected(): boolean {
    return this.selected;
  }

  /** The UI state for checked/unchecked + "partially checked" for parents. */
  get selectedState(): SelectedState {
    if (this.isSelected) {
      return "checked";
    } else if (this.children && this.inferSelectedState) {
      // If filters are hiding some of our children, we still want to show fully selected
      const allChecked = this.visibleChildren.every((child) => child.selectedState === "checked");
      const allUnchecked = this.visibleChildren.every((child) => child.selectedState === "unchecked");
      return this.children.length === 0 ? "unchecked" : allChecked ? "checked" : allUnchecked ? "unchecked" : "partial";
    } else {
      return "unchecked";
    }
  }

  /**
   * Called to explicitly select/unselect this row.
   *
   * This could be either because the user clicked directly on us, or because we're a visible
   * child of a selected parent row.
   */
  select(selected: boolean): void {
    if (this.row.selectable === false) return;
    this.selected = selected;
    if (this.children && this.inferSelectedState) {
      for (const child of this.visibleChildren) {
        // Kept rows are selected/unselected directly, and not implicitly from their old parent
        if (!child.isKept) {
          child.select(selected);
        }
      }
    }
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
      this.selected &&
      (!this.isMatched || this.wasRemoved)
    );
  }

  /** If either us, or any parent, sets `inferSelectedState: false`, then don't infer it. */
  private get inferSelectedState(): boolean {
    return this.row.inferSelectedState !== false && (this.parent === undefined || this.parent?.inferSelectedState);
  }

  private get visibleChildren(): RowState[] {
    return this.children?.filter((c) => c.isMatched === true) ?? [];
  }

  /** Prtty toString. */
  [Symbol.for("nodejs.util.inspect.custom")](): string {
    return `RowState ${this.row.kind}-${this.row.id}`;
  }
}
