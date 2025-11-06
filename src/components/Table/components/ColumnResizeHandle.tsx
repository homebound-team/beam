import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { TableStateContext } from "src/components/Table";
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
  calculatePreviewWidth?: (columnId: string, newWidth: number, columnIndex: number) => number;
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
  calculatePreviewWidth,
}: ColumnResizeHandleProps) {
  const { tableContainerRef } = useContext(TableStateContext);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [guideLineX, setGuideLineX] = useState<number | null>(null);
  const [guideLineTop, setGuideLineTop] = useState<number>(0);
  const [guideLineHeight, setGuideLineHeight] = useState<number>(0);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const startHandleRightRef = useRef<number>(0);
  const handleRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const pendingMouseXRef = useRef<number | null>(null);
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

      // Store the original handle position
      const rect = handleRef.current?.getBoundingClientRect();
      if (rect) {
        startHandleRightRef.current = rect.right;
        setGuideLineX(rect.right);
      }

      // Calculate table container bounds using the ref
      if (tableContainerRef?.current) {
        const tableRect = tableContainerRef.current.getBoundingClientRect();
        setGuideLineTop(tableRect.top);
        setGuideLineHeight(tableRect.height);
      } else {
        // Fallback: use viewport
        setGuideLineTop(0);
        setGuideLineHeight(window.innerHeight);
      }

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [currentWidth, tableContainerRef],
  );

  // Update guide line position using requestAnimationFrame for smooth performance
  // Use a simplified calculation that's fast enough for real-time updates
  const updateGuideLine = useCallback(() => {
    if (pendingMouseXRef.current === null) return;

    const deltaX = pendingMouseXRef.current - startXRef.current;
    const maxWidth = calculateMaxWidth();
    const requestedWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + deltaX));

    // Use the preview function if available, but with a fallback to requested width
    // The preview function accounts for adjustments, but we'll use it directly
    // If it's too slow, we can optimize it further
    let finalWidth = requestedWidth;
    if (calculatePreviewWidth) {
      try {
        finalWidth = calculatePreviewWidth(columnId, requestedWidth, columnIndex);
      } catch (e) {
        // Fallback to requested width if calculation fails
        finalWidth = requestedWidth;
      }
    }

    // Calculate where the guide line should be based on the final width
    const widthChange = finalWidth - startWidthRef.current;
    setGuideLineX(startHandleRightRef.current + widthChange);

    pendingMouseXRef.current = null;
    rafRef.current = null;
  }, [minWidth, calculateMaxWidth, calculatePreviewWidth, columnId, columnIndex]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      // Store the mouse position
      pendingMouseXRef.current = e.clientX;

      // Schedule an update using requestAnimationFrame if one isn't already scheduled
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(updateGuideLine);
      }
    },
    [isDragging, updateGuideLine],
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startXRef.current;
      const maxWidth = calculateMaxWidth();
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + deltaX));
      onResize(columnId, newWidth, columnIndex);

      setIsDragging(false);
      setGuideLineX(null);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    },
    [isDragging, columnId, minWidth, onResize, calculateMaxWidth, columnIndex],
  );

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        // Cancel any pending animation frame
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        pendingMouseXRef.current = null;
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
    <>
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
      {isDragging && guideLineX !== null && (
        <div
          css={{
            position: "fixed",
            top: `${guideLineTop}px`,
            height: `${guideLineHeight}px`,
            left: `${guideLineX}px`,
            width: "2px",
            backgroundColor: "rgba(59, 130, 246, 0.8)",
            pointerEvents: "none",
            zIndex: 9998,
            transform: "translateX(-50%)",
          }}
          {...tid.guideLine}
        />
      )}
    </>
  );
}
