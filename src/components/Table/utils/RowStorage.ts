import { reaction } from "mobx";
import { Kinded } from "src";
import { RowStates } from "src/components/Table/utils/RowStates";
import { loadArrayOrUndefined } from "src/components/Table/utils/utils";

/**
 * Manages loading/saving scroll position to session storage for virtual tables.
 *
 * This is useful for pages that the user has to go in-out/out-of a lot, and
 * want it to restore their scroll position on their next visit.
 */
export class ScrollStorage {
  private storageKey: string | undefined;

  /**
   * Loads the scroll position from sessionStorage.
   * @param tableId - The table's id prop, used to differentiate multiple tables on the same page
   * @returns The saved index or undefined
   */
  load(tableId: string): number | undefined {
    // Generate a unique key combining the URL pathname and table id
    this.storageKey = `scrollPosition_${window.location.pathname}_${tableId}`;
    const value = sessionStorage.getItem(this.storageKey);
    return value === null ? undefined : parseInt(value);
  }

  /** Saves the scroll position (startIndex) to sessionStorage. */
  save(startIndex: number): void {
    if (this.storageKey) {
      sessionStorage.setItem(this.storageKey, startIndex.toString());
    }
  }
}

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
export class RowStorage<R extends Kinded> {
  private historicalIds: string[] | undefined;

  constructor(private states: RowStates<R>) {}

  load(persistCollapse: string): void {
    // Load what our previously collapsed rows were
    this.historicalIds = loadArrayOrUndefined(persistCollapse);
    // And store new collapsed rows going forward
    reaction(
      () => this.states.collapsedRows.map((rs) => rs.row.id),
      (rowIds) => sessionStorage.setItem(persistCollapse, JSON.stringify(rowIds)),
    );
  }

  /** Once the first real-data load is done, we ignore historical ids so that we prefer any new data's `initCollapsed`. */
  done() {
    this.historicalIds = undefined;
  }

  /**
   * Returns if this row had been collapsed.
   *
   * Technically we return `undefined` if a) there is no persisted state for this row, or b) we are
   * past the first real-data load, and thus should prefer new incoming rows' `initCollapsed` flag.
   */
  wasCollapsed(id: string): boolean | undefined {
    return this.historicalIds?.includes(id);
  }
}
