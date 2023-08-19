import { makeAutoObservable, observable, reaction } from "mobx";
import { GridDataRow } from "src/components/Table/components/Row";
import { RowStates } from "src/components/Table/utils/RowStates";
import { SelectedState } from "src/components/Table/utils/TableState";
import { applyRowFn, HEADER, KEPT_GROUP, matchesFilter, reservedRowKinds } from "src/components/Table/utils/utils";

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
  /** Whether we are *directly* selected. */
  selected = false;
  /** Whether we are collapsed. */
  collapsed = false;
  /**
   * Whether our `row` had been in `props.rows`, but then removed _while being
   * selected_, i.e. potentially by server-side filters.
   *
   * We have had a large foot-gun where users "select a row", change the filters,
   * the row disappears (filtered out), and the user clicks "Go!", but the table
   * thinks their previously-selected row is gone (b/c it's not in view), and
   * then the row is inappropriately deleted/unassociated/etc. (b/c in the user's
   * head, it is "still selected").
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

  constructor(private states: RowStates, public parent: RowState | undefined, row: GridDataRow<any>) {
    this.row = row;
    this.selected = !!row.initSelected;
    this.collapsed = states.storage.wasCollapsed(row.id) ?? !!row.initCollapsed;
    makeAutoObservable(this, { row: observable.ref }, { name: `RowState@${row.id}` });
    // Ideally we could hook up this reaction conditionally, but for the header RowState,
    // we're initialized by GridTableApiImpl, before TableState.onRowSelect has a chance
    // to be set to GridTableProps.onRowSelect, so for now just always hook up this reaction.
    reaction(
      () => this.selectedState,
      (state) => {
        const isSelected = state === "checked";
        // Go through `this.row.onSelect` to get the latest lambda
        const rowFn = this.row.onSelect;
        rowFn && rowFn(isSelected);
        const tableFn = states.table.onRowSelect?.[this.row.kind];
        tableFn && tableFn(this.row.data as any, isSelected, { row, api: states.table.api });
      },
    );
  }

  /**
   * Whether we match a client-side filter; true if no filter is in place.
   *
   * We should try and keep this based solely on "does/does not match the filter",
   * and do any overrides for things like pinning/kept rows/etc. elsewhere.
   */
  get isMatched(): boolean {
    return (
      this.isDirectlyMatched ||
      // A matched parent means show all it's children
      this.hasDirectlyMatchedParent ||
      // An unmatched parent but with matched children means show the parent
      this.hasDirectlyMatchedChildren
    );
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
    if (this.isParent) return this.selectedState === "checked";
    return this.selected;
  }

  /** The UI state for checked/unchecked + "partially checked" for parents. */
  get selectedState(): SelectedState {
    // Parent `selectedState` is special b/c it does not directly depend on the parent's own selected-ness,
    // but instead depends on the current visible children. I.e. a parent might be "selected", but then the
    // client-side filter changes, a child reappears, and we need to transition to partial-ness.
    if (this.isParent) {
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
    if (this.row.selectable !== false) {
      this.selected = selected;
    }
    // We don't check inferSelectedState here, b/c even if the parent is considered selectable
    // on its own, we still push down selected-ness to our visible children.
    for (const child of this.visibleChildren) {
      child.select(selected);
    }
  }

  /** Marks the row as removed from `props.rows`, to potentially become kept. */
  markRemoved(): void {
    // The kept group is never in `props.rows`, so ignore asks to delete it
    if (this.row.kind === KEPT_GROUP) return;
    this.removed = this.selected && this.removed !== "hard" ? "soft" : "hard";
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
      !this.isReservedKind &&
      !this.isParent &&
      (!this.isMatched || this.removed === "soft")
    );
  }

  get level(): number {
    // Make the header level -1, so the top-level rows are level 0
    return !this.parent ? -1 : this.parent.level + 1;
  }

  private get inferSelectedState(): boolean {
    return this.row.inferSelectedState !== false;
  }

  /** Returns this row and, if we're not collapsed, our children. */
  get selfAndMaybeChildren(): RowState[] {
    // The header always returns all children/top rows, even if collapsed
    if (this.children && (!this.collapsed || this.row.kind === HEADER)) {
      return [this, ...this.visibleSortedChildren.flatMap((c) => c.selfAndMaybeChildren)];
    } else {
      return [this];
    }
  }

  private get visibleChildren(): RowState[] {
    // The keptGroup is special and its children are the dynamically kept rows
    if (this.row.kind === KEPT_GROUP) return this.states.keptRows;
    return (
      this.children?.filter(
        (rs) =>
          // Reserved rows are always visible, even though they're not considered matched.
          // ...except for the kept group: its `isMatched` will become true whenever it has
          // any kept row children, as they will cause its hasDirectlyMatchedChildren to be true.
          (rs.isReservedKind && rs.row.kind !== KEPT_GROUP) || rs.isMatched || rs.isPinned,
      ) ?? []
    );
  }

  /** The `visibleChildren`, but with the current sort config applied. */
  private get visibleSortedChildren(): RowState[] {
    let rows = this.visibleChildren;
    const { sortFn } = this.states.table;
    // We need to make a copy for mobx to see the sort as a change, and also to not mutate
    // the original/unsorted array if we need to revert to the original sort order.
    if (sortFn) rows = [...rows].sort(sortFn);
    return rows;
  }

  /**
   * Returns whether this row should act like a parent.
   *
   * This means "has children" and "does not have inferSelectedState: false"
   * set. I.e. `inferSelectedState: false` allows a parent with children to
   * still act as its own selectable identity.
   *
   * We also check `children.length > 0`, because sometimes pages will calc a
   * row's children as `children = someList.map(...)`, and if the list is empty,
   * they want the row to be selectable.
   */
  private get isParent(): boolean {
    return !!this.children && this.children.length > 0 && this.inferSelectedState;
  }

  private get isPinned(): boolean {
    return typeof this.row.pin === "string" || (!!this.row.pin && this.row.pin.filter !== true);
  }

  public get isReservedKind(): boolean {
    return reservedRowKinds.includes(this.row.kind);
  }

  /** A dedicated method to "looking down" recursively, to avoid loops in `isMatched`. */
  private get hasDirectlyMatchedChildren(): boolean {
    // The keptGroup is special and its children are the dynamically kept rows
    if (this.row.kind === KEPT_GROUP) return this.states.keptRows.length > 0;
    return !!this.children && this.children.some((c) => c.isDirectlyMatched || c.hasDirectlyMatchedChildren);
  }

  /** A dedicated method to "looking up" recursively, to avoid loops in `isMatched`. */
  private get hasDirectlyMatchedParent(): boolean {
    return !!this.parent && (this.parent.isDirectlyMatched || this.parent.hasDirectlyMatchedParent);
  }

  private get isDirectlyMatched(): boolean {
    // Reserved rows like the header can never be directly matched, and treating them
    // as matched currently throws off the header's select all/etc. behavior
    if (this.isReservedKind) return false;
    // Ignore hard-deleted rows, i.e. from `api.deleteRows`; in theory any hard-deleted
    // rows should be removed from `this.children` anyway, by a change to `props.rows`,
    // but just in case the user calls _only_ `api.deleteRows`, and expects the row to
    // go away, go ahead and filter them out here.
    if (this.removed === "hard") return false;
    // Reacts to either search state or visibleColumns state changing
    const { visibleColumns, api, search } = this.states.table;
    return search.every((term) =>
      visibleColumns
        .map((c) => applyRowFn(c, this.row, api, 0, false))
        .some((maybeContent) => matchesFilter(maybeContent, term)),
    );
  }

  /** Used by node when doing `console.log(rs)`. */
  [Symbol.for("nodejs.util.inspect.custom")](): string {
    return `RowState@${this.row.id}`;
  }
}
