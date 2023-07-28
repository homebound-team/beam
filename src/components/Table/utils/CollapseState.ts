import { reaction } from "mobx";
import { RowStates } from "src/components/Table/utils/RowStates";

export class CollapseState {
  private historicalIds: string[] | undefined;

  constructor(private states: RowStates) {}

  load(persistCollapse: string): void {
    // Load what our previously collapsed rows were
    const ids = sessionStorage.getItem(persistCollapse);
    if (ids) {
      this.historicalIds = JSON.parse(ids);
    }
    // And store new collapsed rows going forward
    reaction(
      () => [...this.states.collapsedRows],
      (rows) => {
        sessionStorage.setItem(persistCollapse, JSON.stringify(rows.map((rs) => rs.row.id)));
      },
    );
  }

  clear() {
    this.historicalIds = undefined;
  }

  /** Returns undefined if there is no persisted state to vote first. */
  wasCollapsed(id: string): boolean | undefined {
    return this.historicalIds?.includes(id);
  }
}
