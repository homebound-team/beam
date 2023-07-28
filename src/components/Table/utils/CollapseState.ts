import { reaction } from "mobx";
import { RowStates } from "src/components/Table/utils/RowStates";

/**
 * Manages loading/saving our currently-collapsed rows to session storage.
 *
 * This is useful for pages that the user has to go in-out/out-of a lot, and
 * want it to restore, as much as possible, like their previous visit. Granted,
 * we try to superdrawer most of these experiences to avoid the user having to
 * jump off-page.
 *
 * Unlike most of our other states, this is not directly reactive/an observable,
 * although we do reactive to collapsedRows changing to persist the new state.
 */
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

  /** Once the first real-data load is done, we ignore historical ids so that we prefer any new data's `initCollapsed`. */
  done() {
    this.historicalIds = undefined;
  }

  /** Returns undefined if there is no persisted state to vote first. */
  wasCollapsed(id: string): boolean | undefined {
    return this.historicalIds?.includes(id);
  }
}
