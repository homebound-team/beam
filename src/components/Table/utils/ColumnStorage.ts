import { autorun, reaction } from "mobx";
import { Kinded } from "src";
import { ColumnStates } from "src/components/Table/utils/ColumnStates";
import { loadArrayOrUndefined } from "src/components/Table/utils/utils";

/** Loads/saves the column state from sessionStorage. */
export class ColumnStorage<R extends Kinded> {
  private expandedIds: string[] | undefined;
  private visibleIds: string[] | undefined;

  constructor(private states: ColumnStates<R>) {}

  loadExpanded(persistCollapse: string): void {
    const key = `expandedColumn_${persistCollapse}`;
    this.expandedIds = loadArrayOrUndefined(key);
    reaction(
      () => this.states.expandedColumns.map((cs) => cs.column.id),
      (columnIds) => sessionStorage.setItem(key, JSON.stringify(columnIds)),
    );
  }

  loadVisible(storageKey: string): void {
    this.visibleIds = loadArrayOrUndefined(storageKey);
    // Unlike the others, where we only store the value on change, we immediately
    // store this value (but I'm not sure why...), hence using `autorun`.
    autorun(() => {
      const columnIds = this.states.allVisibleColumns.map((cs) => cs.column.id);
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
