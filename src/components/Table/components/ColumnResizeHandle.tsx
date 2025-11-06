import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTestIds } from "src/utils";

type ColumnResizeHandleProps = {
  columnId: string;
  columnIndex: number;
  currentWidth: number;
  minWidth: number;
  onResize: (columnId: string, newWidth: number, columnIndex: number) => void;
  tableWidth?: number;
  columnSizes?: string[];
  rightColumnsMinWidths?: number[];
};

/**
 * Resize handle component that appears on column borders.
 * Allows users to drag to resize columns.
 */
export function ColumnResizeHandle({
  columnId,
  columnIndex,
  currentWidth,
  minWidth,
  onResize,
  tableWidth,
  columnSizes,
  rightColumnsMinWidths,
}: ColumnResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const handleRef = useRef<HTMLDivElement>(null);
  const tid = useTestIds({}, "columnResizeHandle");

  // Calculate max width for this column based on available space in columns to the right
  const calculateMaxWidth = useCallback(() => {
    if (!tableWidth || !columnSizes) return Infinity;

    // Calculate width of columns to the left (excluding current column)
    let leftWidth = 0;
    for (let i = 0; i < columnIndex; i++) {
      const size = columnSizes[i];
      if (size.endsWith("px")) {
        leftWidth += parseInt(size.replace("px", ""), 10);
      }
    }

    // Calculate sum of minimum widths of columns to the right
    // If rightColumnsMinWidths is provided, use it; otherwise assume 0
    const rightColumnsMinSum = rightColumnsMinWidths ? rightColumnsMinWidths.reduce((sum, min) => sum + min, 0) : 0;

    // Max width = container width - left columns width - right columns min widths
    // This ensures the table never exceeds the container width
    const maxWidth = tableWidth - leftWidth - rightColumnsMinSum;

    return Math.max(minWidth, maxWidth);
  }, [tableWidth, columnSizes, columnIndex, minWidth, rightColumnsMinWidths]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      startXRef.current = e.clientX;
      startWidthRef.current = currentWidth;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [currentWidth],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startXRef.current;
      const newWidth = Math.max(minWidth, startWidthRef.current + deltaX);
      // Don't update during drag, only on release
    },
    [isDragging, minWidth],
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startXRef.current;
      const maxWidth = calculateMaxWidth();
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + deltaX));
      onResize(columnId, newWidth, columnIndex);

      setIsDragging(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    },
    [isDragging, columnId, minWidth, onResize, calculateMaxWidth],
  );

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, []);

  return (
    <div
      ref={handleRef}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => !isDragging && setIsHovering(false)}
      css={{
        position: "absolute",
        top: 0,
        bottom: 0,
        right: 0,
        width: "4px",
        cursor: "col-resize",
        zIndex: 10,
        marginRight: "-2px",
        ...(isHovering || isDragging
          ? {
              backgroundColor: "rgba(59, 130, 246, 0.5)",
            }
          : {}),
        "&:hover": {
          backgroundColor: "rgba(59, 130, 246, 0.3)",
        },
      }}
      {...tid.handle}
      data-column-id={columnId}
      data-column-index={columnIndex}
    />
  );
}
