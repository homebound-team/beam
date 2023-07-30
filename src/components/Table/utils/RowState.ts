import { makeAutoObservable, observable } from "mobx";
import { GridDataRow, KEPT_GROUP, reservedRowKinds, SelectedState } from "src";
import { RowStates } from "src/components/Table/utils/RowStates";

/**
 * A reactive/observable state of each GridDataRow's current behavior.
 *
 * We set up the RowStates in a tree, just like GridDataRow, to make business logic
 * that uses parent/children easier to write, i.e. selected-ness and collapsed-ness.
 */
export class RowState {
  /** Our row, only ref observed, so we don't crawl into GraphQL fragments. */
  row: GridDataRow<any>;
  /** Our children row states, as of the latest `props.rows`, without any filtering applied. */
  children: RowState[] | undefined = undefined;
  /** Whether we match a client-side filter; true if no filter is in place. */
  isMatched = true;
  /** Whether we are *directly* selected. */
  selected = false;
  /** Whether we are collapsed. */
  collapsed = false;
  /**
   * Whether our `row` had been in `props.rows`, but then removed _while being
   * selected_, i.e. potentially by server-side filters.
   *
   * We have had a large foot-gun for users "select a row", change the filters,
   * the row disappears (filtered out), and the user clicks "Go!", but the table
   * thinks their previously-selected row is gone (b/c it's not in view), and
   * then the row is inappropriately deleted/unassociated/etc
   *
   * To avoid this, we by default keep selected rows, as "kept rows", to make
   * extra sure the user wants them to go away.
   *
   * Soft-deleted rows are rows that were removed from `props.rows` (i.e. we
   * suspect are just hidden by a changed server-side-filter), and hard-deleted
   * rows are rows the page called `api.deleteRow` and confirmed it should be
   * actively removed.
   */
  removed: false | "soft" | "hard" = false;

  // ...eventually...
  // isDirectlyMatched = accept filters in the constructor and do match here
  // isEffectiveMatched = isDirectlyMatched || hasMatchedChildren

  constructor(states: RowStates, row: GridDataRow<any>) {
    this.row = row;
    this.selected = !!row.initSelected;
    this.collapsed = states.storage.wasCollapsed(row.id) ?? !!row.initCollapsed;
    makeAutoObservable(this, { row: observable.ref });
  }

  /**
   * Whether we are effectively selected, for `GridTableApi.getSelectedRows`.
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
      if ((allUnchecked || children.length === 0) && (this.inferSelectedState || !this.selected)) {
        return "unchecked";
      } else if (allChecked && (this.inferSelectedState || this.selected)) {
        return "checked";
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

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
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
      (!this.isMatched || this.removed === "soft")
    );
  }

  private get inferSelectedState(): boolean {
    return this.row.inferSelectedState !== false;
  }

  private get visibleChildren(): RowState[] {
    return (
      this.children
        // The keptGroup should treat all of its children as visible, as this makes select/unselect all work.
        ?.filter((c) => this.row.kind === KEPT_GROUP || c.isMatched === true)
        // Ignore hard-deleted rows, i.e. from `api.deleteRows`; in theory any hard-deleted
        // rows should be removed from `this.children` anyway, by a change to `props.rows`,
        // but just in case the user calls _only_ `api.deleteRows`, and expects the row to
        // go away, go ahead and filter them out here.
        ?.filter((c) => c.removed !== "hard") ?? []
    );
  }

  /** Pretty toString. */
  [Symbol.for("nodejs.util.inspect.custom")](): string {
    return `RowState ${this.row.kind}-${this.row.id}`;
  }
}
