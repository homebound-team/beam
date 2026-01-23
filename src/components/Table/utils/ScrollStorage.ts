import { useMemo } from "react";

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

/** Creates a ScrollStorage instance and loads the initial scroll position. */
export function useScrollStorage(persistScrollPosition: boolean, tableId: string) {
  return useMemo(() => {
    if (!persistScrollPosition) return { scrollStorage: undefined, initialScrollIndex: undefined };
    const storage = new ScrollStorage();
    // Use the table's id to generate a unique storage key (combined with URL path in ScrollStorage)
    const index = storage.load(tableId);
    return { scrollStorage: storage, initialScrollIndex: index };
  }, [persistScrollPosition, tableId]);
}
