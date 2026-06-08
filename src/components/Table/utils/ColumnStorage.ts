import { autorun, reaction } from "mobx";
import { Kinded } from "src/components/Table/types";
import { ColumnStates } from "src/components/Table/utils/ColumnStates";
import { loadArrayOrUndefined } from "src/components/Table/utils/utils";

/** Loads/saves the column state from sessionStorage. */
export class ColumnStorage<R extends Kinded> {
  private expandedIds: string[] | undefined;
  private visibleIds: string[] | undefined;
  // `loadExpanded`/`loadVisible` can be called multiple times (i.e. when `props.columns`
  // change, which also changes the auto-derived storage key). Each call wires up a mobx
  // autorun/reaction that writes to its key, so we must dispose the previous one. Otherwise
  // a stale writer keeps firing against an old key and clobbers it with the current visible
  // set, e.g. a conditional column's key gets overwritten while that column isn't rendered.
  private disposeExpanded: (() => void) | undefined;
  private disposeVisible: (() => void) | undefined;

  constructor(private states: ColumnStates<R>) {}

  loadExpanded(persistCollapse: string): void {
    this.disposeExpanded?.();
    const key = `expandedColumn_${persistCollapse}`;
    this.expandedIds = loadArrayOrUndefined(key);
    this.disposeExpanded = reaction(
      () => this.states.expandedColumns.map((cs) => cs.column.id),
      (columnIds) => sessionStorage.setItem(key, JSON.stringify(columnIds)),
    );
  }

  loadVisible(storageKey: string): void {
    this.disposeVisible?.();
    this.visibleIds = loadArrayOrUndefined(storageKey);
    // Unlike the others, where we only store the value on change, we immediately
    // store this value (but I'm not sure why...), hence using `autorun`.
    this.disposeVisible = autorun(() => {
      const columnIds = this.states.allVisibleColumns("web").map((cs) => cs.column.id);
      sessionStorage.setItem(storageKey, JSON.stringify(columnIds));
    });
  }

  wasExpanded(id: string): boolean | undefined {
    return this.expandedIds?.includes(id);
  }

  wasVisible(id: string): boolean | undefined {
    return this.visibleIds?.includes(id);
  }

  done() {
    this.expandedIds = undefined;
  }
}
