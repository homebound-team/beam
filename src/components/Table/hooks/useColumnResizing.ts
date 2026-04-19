import { useCallback, useEffect, useState } from "react";
import { type PageSessionStorage, loadSessionStorageJson } from "src/hooks/usePageSessionStorage";
import { useDebouncedCallback } from "use-debounce";

export type ResizedWidths = Record<string, number>;

/**
 * Hook to manage column resizing state and persistence.
 * Stores resized column widths in sessionStorage with debounced writes (500ms).
 *
 * @param storage - Page-scoped storage adapter. If undefined, persistence is disabled.
 */
export function useColumnResizing(storage: PageSessionStorage | undefined): {
  resizedWidths: ResizedWidths;
  setResizedWidth: (columnId: string, width: number) => void;
  setResizedWidths: (widths: ResizedWidths | ((prev: ResizedWidths) => ResizedWidths)) => void;
  resetColumnWidths: () => void;
} {
  const [resizedWidths, setResizedWidths] = useState<ResizedWidths>(() => {
    return storage ? loadSessionStorageJson<ResizedWidths>(storage) ?? {} : {};
  });

  // Debounced persistence to session storage - prevents blocking main thread during fast dragging
  const persistToStorage = useDebouncedCallback((widths: ResizedWidths) => {
    if (!storage) return;
    storage.setItem(JSON.stringify(widths));
  }, 500);

  useEffect(() => {
    persistToStorage(resizedWidths);
  }, [resizedWidths, persistToStorage]);

  const setResizedWidth = useCallback((columnId: string, width: number) => {
    setResizedWidths((prev) => ({
      ...prev,
      [columnId]: width,
    }));
  }, []);

  const batchSetResizedWidths = useCallback((widths: ResizedWidths | ((prev: ResizedWidths) => ResizedWidths)) => {
    if (typeof widths === "function") {
      setResizedWidths(widths);
    } else {
      setResizedWidths((prev) => ({
        ...prev,
        ...widths,
      }));
    }
  }, []);

  const resetColumnWidths = useCallback(() => {
    setResizedWidths({});
  }, []);

  return {
    resizedWidths,
    setResizedWidth,
    setResizedWidths: batchSetResizedWidths,
    resetColumnWidths,
  };
}
