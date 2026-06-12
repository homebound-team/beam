import { useCallback, useState } from "react";
import { TableView } from "src/components/Table/components/ViewToggleButton";

export function usePersistedTableView(
  defaultView: TableView,
  persist: boolean,
): [TableView, (view: TableView) => void] {
  const storageKey = persist ? getGridTableViewStorageKey(window.location.pathname) : undefined;

  const [view, setView] = useState<TableView>(() => {
    if (!storageKey) return defaultView;
    try {
      return parseStoredTableView(localStorage.getItem(storageKey)) ?? defaultView;
    } catch {
      return defaultView;
    }
  });

  const setViewAndPersist = useCallback(
    (next: TableView) => {
      setView(next);
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, next);
        } catch {
          // localStorage may throw under quota / privacy mode; in-memory state still works.
        }
      }
    },
    [storageKey],
  );

  return [view, setViewAndPersist];
}

/** localStorage key for list/card view, scoped to pathname. */
export function getGridTableViewStorageKey(pathname: string): string {
  return `beam.gridTableLayout.view.${pathname}`;
}

function parseStoredTableView(raw: string | null): TableView | undefined {
  return raw === "list" || raw === "card" ? raw : undefined;
}
