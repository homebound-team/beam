import { useCallback, useEffect, useRef, useState } from "react";

type ResizedWidths = Record<string, number>;

/**
 * Hook to manage column resizing state and persistence.
 * Stores resized column widths in session storage.
 */
export function useColumnResizing(storageKey: string | undefined): {
  resizedWidths: ResizedWidths;
  setResizedWidth: (columnId: string, width: number) => void;
  setResizedWidths: (widths: Record<string, number>) => void;
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

  // Persist to session storage whenever resizedWidths changes
  useEffect(() => {
    if (!storageKeyRef.current) return;

    const key = `columnWidths_${storageKeyRef.current}`;
    try {
      sessionStorage.setItem(key, JSON.stringify(resizedWidths));
    } catch {
      // Ignore storage errors
    }
  }, [resizedWidths]);

  const setResizedWidth = useCallback((columnId: string, width: number) => {
    setResizedWidths((prev) => ({
      ...prev,
      [columnId]: width,
    }));
  }, []);

  const batchSetResizedWidths = useCallback((widths: Record<string, number>) => {
    setResizedWidths((prev) => ({
      ...prev,
      ...widths,
    }));
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
