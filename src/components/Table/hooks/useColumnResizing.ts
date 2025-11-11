import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export type ResizedWidths = Record<string, number>;

/**
 * Hook to manage column resizing state and persistence.
 * Stores resized column widths in session storage.
 */
export function useColumnResizing(storageKey: string | undefined): {
  resizedWidths: ResizedWidths;
  setResizedWidth: (columnId: string, width: number) => void;
  setResizedWidths: (widths: ResizedWidths | ((prev: ResizedWidths) => ResizedWidths)) => void;
  getResizedWidth: (columnId: string) => number | undefined;
} {
  // TODO: Do we REALLY wanna store this?
  const [resizedWidths, setResizedWidths] = useState<ResizedWidths>(() => {
    if (!storageKey) return {};
    try {
      const stored = sessionStorage.getItem(`columnWidths_${storageKey}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const storageKeyRef = useRef(storageKey);
  storageKeyRef.current = storageKey;

  // Debounced persistence to session storage - prevents blocking main thread during fast dragging
  const persistToStorage = useDebouncedCallback(
    (widths: ResizedWidths) => {
      if (!storageKeyRef.current) return;

      const key = `columnWidths_${storageKeyRef.current}`;
      try {
        sessionStorage.setItem(key, JSON.stringify(widths));
      } catch {
        // Ignore storage errors
      }
    },
    500, // Wait 500ms after last change before persisting
  );

  // Persist to session storage whenever resizedWidths changes
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
      // Handle functional update
      setResizedWidths(widths);
    } else {
      // Handle direct object update (merge with existing)
      setResizedWidths((prev) => ({
        ...prev,
        ...widths,
      }));
    }
  }, []);

  const getResizedWidth = useCallback(
    (columnId: string): number | undefined => {
      return resizedWidths[columnId];
    },
    [resizedWidths],
  );

  return {
    resizedWidths,
    setResizedWidth,
    setResizedWidths: batchSetResizedWidths,
    getResizedWidth,
  };
}
