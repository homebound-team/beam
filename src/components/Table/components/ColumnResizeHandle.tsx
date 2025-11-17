import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useScrollableParent } from "src/components/Layout/ScrollableParent";
import { TableStateContext } from "src/components/Table";
import { Css } from "src/Css";
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
 * Fallback: Find the nearest scrollable ancestor element via DOM traversal.
 * Only used when ScrollableParent context is not available.
 */
function findScrollableParent(element: HTMLElement | null): HTMLElement | null {
  if (!element) return null;

  let parent = element.parentElement;
  while (parent) {
    const style = window.getComputedStyle(parent);
    const overflowY = style.overflowY;
    const overflow = style.overflow;

    // Check if this element is scrollable
    if (overflowY === "auto" || overflowY === "scroll" || overflow === "auto" || overflow === "scroll") {
      // Verify it actually has scrollable content
      if (parent.scrollHeight > parent.clientHeight) {
        return parent;
      }
    }

    parent = parent.parentElement;
  }

  return null;
}

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
  const { scrollableEl } = useScrollableParent(); // Get scrollable element from context
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
  const scrollableParentRef = useRef<HTMLElement | null>(null);
  const tid = useTestIds({}, "columnResizeHandle");

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

      // Find the scrollable parent container
      // Prefer scrollableEl from ScrollableParent context (avoids expensive DOM traversal)
      // Fall back to findScrollableParent for tables not wrapped in ScrollableParent
      // This sounds bad but resizable columns was built with GridTableLayout in mind which always gets used
      // within a ScrollableParent because it is wrapped in a ScrollableContent
      scrollableParentRef.current =
        scrollableEl || (tableContainerRef?.current ? findScrollableParent(tableContainerRef.current) : null);

      // Calculate bounds - use intersection of scrollable parent and table
      if (tableContainerRef?.current) {
        const tableRect = tableContainerRef.current.getBoundingClientRect();

        if (scrollableParentRef.current) {
          const scrollRect = scrollableParentRef.current.getBoundingClientRect();
          // Use the intersection of both rectangles
          const top = Math.max(tableRect.top, scrollRect.top);
          const bottom = Math.min(tableRect.bottom, scrollRect.bottom);
          setGuideLineTop(top);
          setGuideLineHeight(Math.max(0, bottom - top));
        } else {
          // No scrollable parent, just use table bounds
          setGuideLineTop(tableRect.top);
          setGuideLineHeight(tableRect.height);
        }
      } else {
        // Fallback: use viewport
        setGuideLineTop(0);
        setGuideLineHeight(window.innerHeight);
      }

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [currentWidth, tableContainerRef, scrollableEl],
  );

  // Update guide line position using requestAnimationFrame for smooth performance
  const updateGuideLine = useCallback(() => {
    if (pendingMouseXRef.current === null) return;

    const deltaX = pendingMouseXRef.current - startXRef.current;
    const requestedWidth = Math.max(minWidth, startWidthRef.current + deltaX);

    // Calculate the accurate final width using the preview function
    // This accounts for distribution to right columns and all constraints
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

    // Update guide line bounds if scrollable parent has scrolled
    if (tableContainerRef?.current) {
      const tableRect = tableContainerRef.current.getBoundingClientRect();

      if (scrollableParentRef.current) {
        const scrollRect = scrollableParentRef.current.getBoundingClientRect();
        // Use the intersection of both rectangles
        const top = Math.max(tableRect.top, scrollRect.top);
        const bottom = Math.min(tableRect.bottom, scrollRect.bottom);
        setGuideLineTop(top);
        setGuideLineHeight(Math.max(0, bottom - top));
      } else {
        // No scrollable parent, just use table bounds
        setGuideLineTop(tableRect.top);
        setGuideLineHeight(tableRect.height);
      }
    }

    pendingMouseXRef.current = null;
    rafRef.current = null;
  }, [minWidth, calculatePreviewWidth, columnId, columnIndex, tableContainerRef]);

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
      const newWidth = Math.max(minWidth, startWidthRef.current + deltaX);
      // Note: onResize (handleColumnResize) will enforce actual constraints via calculateResizeUpdates
      onResize(columnId, newWidth, columnIndex);

      setIsDragging(false);
      setGuideLineX(null);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    },
    [isDragging, columnId, minWidth, onResize, columnIndex],
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
        css={
          Css.absolute.top0.bottom0.right0
            .wPx(4)
            .mrPx(-2)
            .z(10)
            .cursor("col-resize")
            .onHover.bgGray700.if(isHovering || isDragging).bgGray700.$
        }
        {...tid.handle}
        data-column-id={columnId}
        data-column-index={columnIndex}
      />
      {isDragging && guideLineX !== null && (
        <div
          css={
            Css.fixed
              .topPx(guideLineTop)
              .hPx(guideLineHeight)
              .leftPx(guideLineX)
              .wPx(4)
              .bgGray700.add("pointerEvents", "none")
              .z9999.add("transform", "translateX(-50%)").$
          }
          {...tid.guideLine}
        />
      )}
    </>
  );
}
