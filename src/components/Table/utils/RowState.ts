import { makeAutoObservable, observable } from "mobx";
import { GridDataRow, KEPT_GROUP, reservedRowKinds, SelectedState } from "src";

/**
 * A reactive/observable state of each GridDataRow's current behavior.
 *
 * We set up the RowStates in a tree, just like GridDataRow, to make business logic
 * that uses parent/children easier to write, i.e. selected-ness and collapsed-ness.
 */
export class RowState {
  /** Our row, only ref observed, so we don't crawl into GraphQL fragments. */
  row: GridDataRow<any>;
  /** Our parent RowState, or the `header` RowState if we're a top-level row. */
  parent: RowState | undefined;
  /** Our children row states, as of the latest `props.rows`, without any filtering applied. */
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
    this.selected = !!row.initSelected;
    makeAutoObservable(this, { row: observable.ref });
  }

  /**
   * Whether we are currently selected, for `GridTableApi.getSelectedRows`.
   *
   * Note that we don't use "I'm selected || my parent is selected" logic here, because whether a child is selected
   * is actually based on whether it was _visible at the time the parent was selected_. So, we can't just assume
   * "a parent being selected means the child is also selected", and instead parents have to push selected-ness down
   * to their visible children explicitly.
   */
  get isSelected(): boolean {
    // We consider group rows selected if all of their children are selected.
    if (this.children && this.inferSelectedState) return this.selectedState === "checked";
    return this.selected;
  }

  /** The UI state for checked/unchecked + "partially checked" for parents. */
  get selectedState(): SelectedState {
    // Parent `selectedState` is special b/c it does not directly depend on the parent's own selected-ness,
    // but instead depends on the current visible children. I.e. a parent might be "selected", but then the
    // client-side filter changes, a child reappears, and we need to transition to partial-ness.
    if (this.children && this.inferSelectedState) {
      // Use visibleChildren b/c if filters are hiding some of our children, we still want to show fully selected
      const children = this.visibleChildren;
      const allChecked = children.every((child) => child.selectedState === "checked");
      const allUnchecked = children.every((child) => child.selectedState === "unchecked");
      return children.length === 0 ? "unchecked" : allChecked ? "checked" : allUnchecked ? "unchecked" : "partial";
    }
    return this.selected ? "checked" : "unchecked";
  }

  /**
   * A special SelectedState that "sees through"/ignores inferSelectedState, so the header works.
   *
   * I.e. a row might have `inferSelectedState: false`, so is showing unchecked, but the header
   * wants to show partial-ness whenever any given child is selected.
   */
  get selectedStateForHeader(): SelectedState {
    if (this.children) {
      const children = this.visibleChildren;
      const allChecked = children.every((child) => child.selectedStateForHeader === "checked");
      const allUnchecked = children.every((child) => child.selectedStateForHeader === "unchecked");
      // For the header purposes, if this is a selectable-row (i.e. not inferSelectedState) make sure
      // both the row itself & all children are "all checked" or "not all checked", otherwise consider
      // ourselves partially selected.
      const me = this.inferSelectedState || this.selected;
      if (allChecked && me) {
        return "checked";
      } else if (allUnchecked && !me) {
        return "unchecked";
      } else {
        return "partial";
      }
    }
    return this.selected ? "checked" : "unchecked";
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
    // We don't check inferSelectedState here, b/c even if the parent is considered selectable
    // on its own, we still push down selected-ness to our visible children.
    if (this.children) {
      for (const child of this.visibleChildren) {
        child.select(selected);
      }
    }
  }

  /** Whether this is a selected-but-filtered-out row that we should hoist to the top. */
  get isKept(): boolean {
    // this row is "kept" if it is selected, and:
    // - it is not matched (hidden by filter) (being hidden by collapse is okay)
    // - or it has (probably) been server-side filtered
    return (
      this.selected &&
      // Headers, totals, etc., do not need keeping
      !reservedRowKinds.includes(this.row.kind) &&
      // Parents don't need keeping, unless they're actually real rows
      !(this.children && this.inferSelectedState) &&
      (!this.isMatched || this.wasRemoved)
    );
  }

  /** If either us, or any parent, sets `inferSelectedState: false`, then don't infer it. */
  private get inferSelectedState(): boolean {
    return this.row.inferSelectedState !== false;
  }

  private get visibleChildren(): RowState[] {
    // The keptGroup should treat all of its children as visible, as this makes select/unselect all work.
    if (this.row.kind === KEPT_GROUP) return this.children ?? [];
    return this.children?.filter((c) => c.isMatched === true) ?? [];
  }

  /** Pretty toString. */
  [Symbol.for("nodejs.util.inspect.custom")](): string {
    return `RowState ${this.row.kind}-${this.row.id}`;
  }
}
