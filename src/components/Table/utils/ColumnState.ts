import { makeAutoObservable, observable } from "mobx";
import { GridColumnWithId } from "src/components/Table/types";
import { assignDefaultColumnIds } from "src/components/Table/utils/columns";
import { ColumnStates } from "src/components/Table/utils/ColumnStates";
import { ColumnStorage } from "src/components/Table/utils/ColumnStorage";
import { isFunction } from "src/utils/index";

/**
 * A reactive/observable wrapper around each GridColumn.
 *
 * This is primarily for tracking visible/expanded columns for tables
 * that use the expandable columns feature.
 */
export class ColumnState {
  column: GridColumnWithId<any>;
  children: ColumnState[] | undefined = undefined;
  private visible = true;
  private expanded = false;

  constructor(private states: ColumnStates, storage: ColumnStorage, column: GridColumnWithId<any>) {
    this.column = column;
    // If the user sets `canHide: true`, we default to hidden unless they set `initVisible: true`
    this.visible = storage.wasVisible(column.id) ?? (column.canHide ? column.initVisible ?? false : true);
    if (this.visible && (storage.wasExpanded(column.id) ?? column.initExpanded)) {
      this.expanded = true;
      this.doExpand();
    }
    makeAutoObservable(this, { column: observable.ref });
  }

  setVisible(visible: boolean): void {
    const wasVisible = this.visible;
    this.visible = visible;
    // If an expandable header is becoming visible for the 1st time, expand it
    if (!wasVisible && visible && this.column.initExpanded && this.children === undefined) {
      this.expanded = true;
      this.doExpand();
    }
  }

  get isExpanded(): boolean {
    return this.expanded;
  }

  toggleExpanded(): void {
    const wasExpanded = this.expanded;
    this.expanded = !this.expanded;
    // The first time we expand, fetch our children. Note that ExpandableHeader
    // technically pre-loads our children, so it can show a spinner while loading,
    // and only after loading is complete, tell our column to expand.
    if (!wasExpanded) this.doExpand();
  }

  /** Calls the `column.expandColumns` function, if set, and adds the resulting columns. */
  async doExpand(force: boolean = false): Promise<void> {
    const { expandColumns } = this.column;
    // If we've already got the children, don't re-expand unless forced (i.e. props.columns changed)
    if (this.children !== undefined && !force) return;
    if (isFunction(expandColumns)) {
      const ecs = await expandColumns();
      this.children = assignDefaultColumnIds(ecs).map((ec) => this.states.addColumn(ec));
    } else if (expandColumns) {
      this.children = expandColumns.map((ec) => this.states.addColumn(ec as GridColumnWithId<any>));
    }
  }

  /** Returns this column, if visible, and its children, if expanded. */
  get maybeSelfAndChildren(): ColumnState[] {
    if (!this.visible) {
      return [];
    } else if (this.expanded && this.children) {
      // Maybe do the `hideOnExpand` thing here? Seems cute, but the Row rendering still
      // needs to do the "look back to the prior column for the expandableHeader cell" logic.
      // if (this.column.hideOnExpand) {
      //   return this.children.flatMap((c) => c.selfAndMaybeChildren);
      // }
      return [this, ...this.children.flatMap((c) => c.maybeSelfAndChildren)];
    } else {
      return [this];
    }
  }
}
