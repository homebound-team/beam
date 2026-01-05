import { useCallback, useRef } from "react";
import { ResizedWidths } from "src/components/Table/hooks/useColumnResizing";
import { GridColumnWithId, Kinded } from "src/components/Table/types";
import { parseWidthToPx } from "src/components/Table/utils/columns";

type ColumnWidthInfo = {
  id: string;
  currentWidth: number;
  minWidth: number;
};

type DistributionResult = {
  updates: ResizedWidths;
  actualAdjustment: number;
};

/**
 * Hook to manage column resize handlers and calculations.
 * Handles the complex logic of distributing width changes across columns
 * while maintaining table width and respecting minimum widths.
 */
export function useColumnResizeHandlers<R extends Kinded>(
  columns: GridColumnWithId<R>[],
  columnSizes: string[],
  tableWidth: number | undefined,
  setResizedWidth: (columnId: string, width: number) => void,
  setResizedWidths: (widths: ResizedWidths | ((prev: ResizedWidths) => ResizedWidths)) => void,
): {
  handleColumnResize: (columnId: string, newWidth: number, columnIndex: number) => void;
  calculatePreviewWidth: (columnId: string, newWidth: number, columnIndex: number) => number;
} {
  // Track whether columns have been locked to pixel widths in this session.
  // Separate from resizedWidths.length because persisted widths don't trigger locking.
  // TODO: Could add a "Reset Column Widths" button to clear resizedWidths and unlock.
  const hasLockedColumnsRef = useRef<boolean>(false);

  // Helper to distribute adjustment proportionally among right columns
  const distributeAdjustment = useCallback(
    (rightColumns: Array<ColumnWidthInfo>, totalRightWidth: number, adjustment: number): DistributionResult => {
      const updates: ResizedWidths = {};
      let remainingAdjustment = adjustment;

      // Distribute the adjustment across all right columns proportionally
      rightColumns.forEach((col) => {
        const proportion = totalRightWidth > 0 ? col.currentWidth / totalRightWidth : 1 / rightColumns.length;
        const colAdjustment = adjustment * proportion;
        const newColWidth = Math.max(col.minWidth, col.currentWidth + colAdjustment);

        updates[col.id] = newColWidth;
        remainingAdjustment -= newColWidth - col.currentWidth;
      });

      return { updates, actualAdjustment: adjustment - remainingAdjustment };
    },
    [],
  );

  const calculateResizeUpdates = useCallback(
    (
      columnId: string,
      newWidth: number,
      columnIndex: number,
    ): { updates: ResizedWidths; hasRightColumns: boolean } | null => {
      if (!tableWidth || !columnSizes || columnSizes.length === 0) {
        return null;
      }

      const currentSizeStr = columnSizes[columnIndex];
      const currentWidth = parseWidthToPx(currentSizeStr, tableWidth) ?? 0;
      const resizedColumn = columns[columnIndex];
      const resizedColumnMinWidth = resizedColumn.mw ? parseInt(resizedColumn.mw.replace("px", ""), 10) : 0;
      const clampedNewWidth = Math.max(resizedColumnMinWidth, newWidth);
      const delta = clampedNewWidth - currentWidth;

      if (delta === 0) {
        return { updates: {}, hasRightColumns: false };
      }

      // Find right columns and calculate how much they can shrink
      const rightColumns: Array<ColumnWidthInfo> = [];
      let totalRightWidth = 0;

      for (let i = columnIndex + 1; i < columns.length; i++) {
        const col = columns[i];
        // Skip action columns
        if (col.isAction) {
          continue;
        }

        const sizeStr = columnSizes[i];
        const width = parseWidthToPx(sizeStr, tableWidth) ?? 0;
        const minWidth = col.mw ? parseInt(col.mw.replace("px", ""), 10) : 0;

        rightColumns.push({
          id: col.id,
          currentWidth: width,
          minWidth,
        });
        totalRightWidth += width;
      }

      // If no resizable columns to the right, just update this column
      if (rightColumns.length === 0) {
        return { updates: { [columnId]: clampedNewWidth }, hasRightColumns: false };
      }

      // Distribute the opposite of the delta to right columns to keep table width constant
      // If we shrink by 30, right columns grow by 30. If we grow by 30, right columns shrink by 30.
      const distributionResult = distributeAdjustment(rightColumns, totalRightWidth, -delta);

      // Always use the actual distributed amount to ensure table width stays constant
      // actualAdjustment is the amount that was successfully distributed to right columns
      // We adjust the resized column by the opposite of this to maintain constant table width
      const actualAdjustment = distributionResult.actualAdjustment;
      const finalResizedWidth = currentWidth - actualAdjustment;

      // Enforce minWidth on the final resized width as well
      // This ensures we never shrink below the column's minimum width
      const clampedFinalWidth = Math.max(resizedColumnMinWidth, finalResizedWidth);

      const updates: ResizedWidths = {
        [columnId]: clampedFinalWidth,
        ...distributionResult.updates,
      };

      return { updates, hasRightColumns: true };
    },
    [tableWidth, columnSizes, columns, distributeAdjustment],
  );

  // Calculate the preview width for a column resize (without applying it) so our guide line is accurate
  const calculatePreviewWidth = useCallback(
    (columnId: string, newWidth: number, columnIndex: number): number => {
      const result = calculateResizeUpdates(columnId, newWidth, columnIndex);
      if (!result) {
        return newWidth;
      }
      return result.updates[columnId] ?? newWidth;
    },
    [calculateResizeUpdates],
  );

  const handleColumnResize = useCallback(
    (columnId: string, newWidth: number, columnIndex: number) => {
      const result = calculateResizeUpdates(columnId, newWidth, columnIndex);

      if (!result) {
        setResizedWidth(columnId, newWidth);
        return;
      }

      if (Object.keys(result.updates).length === 0) {
        return;
      }

      // On first manual resize, lock all columns to pixel widths to prevent fr unit shifting.
      // We check hasLockedColumnsRef instead of resizedWidths.length because persisted widths
      // from sessionStorage don't count as manual resizes in this session.
      if (!hasLockedColumnsRef.current) {
        const lockedWidths: ResizedWidths = {};
        columnSizes.forEach((sizeStr, idx) => {
          const col = columns[idx];

          // Don't resize action col
          if (col.isAction) return;
          const currentWidth = parseWidthToPx(sizeStr, tableWidth) ?? 0;
          lockedWidths[col.id] = currentWidth;
        });

        setResizedWidths((prev) => ({
          ...prev,
          ...lockedWidths,
          ...result.updates,
        }));
        hasLockedColumnsRef.current = true;
        return;
      }

      setResizedWidths(result.updates);
    },
    [calculateResizeUpdates, setResizedWidths, columnSizes, columns, setResizedWidth, tableWidth],
  );

  return {
    handleColumnResize,
    calculatePreviewWidth,
  };
}
