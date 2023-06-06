import equal from "fast-deep-equal";
import React, { KeyboardEvent, ReactNode, useCallback, useRef } from "react";
import { Css, Palette, Properties, useTestIds } from "src";
import { isDefined } from "src/utils";
import { DnDGridContext } from "./DnDGridContext";

export interface DnDGridProps {
  children: ReactNode;
  /** CSS Grid styles for the grid container. */
  gridStyles?: GridStyles;
  /** Defines the styling for the GridItem that is actively being moved */
  activeItemStyles?: Properties;
  /** Returns the new order of the GridItems. */
  onReorder: (items: string[]) => void;
}

export function DnDGrid(props: DnDGridProps) {
  const { children, gridStyles, onReorder, activeItemStyles } = props;
  const gridEl = useRef<HTMLDivElement>(null);
  const dragEl = useRef<HTMLElement>();
  const cloneEl = useRef<HTMLElement>();
  const initialOrder = useRef<string[]>();
  const reorderViaKeyboard = useRef(false);
  const transformFrom = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const tid = useTestIds(props, "dndGrid");

  /** Helper function to return an array of GridItems HTMLElements in the DOM */
  const getGridItems = useCallback((): HTMLElement[] => {
    return gridEl.current ? Array.from(gridEl.current.querySelectorAll(`[${gridItemIdKey}]`)) : [];
  }, []);

  /** Helper function that returns the current order of the GridItems `ids` in the DOM */
  const getGridItemIdOrder = useCallback(() => {
    return getGridItems()
      .map((child) => child.getAttribute(gridItemIdKey))
      .filter(isDefined);
  }, [getGridItems]);

  /** Initializes common state when initiating the 'reorder' process, either by cursor or keyboard */
  const initReorder = useCallback(() => {
    if (gridEl.current && dragEl.current) {
      // Store the current order of the GridItems for comparing against before calling onReorder.
      initialOrder.current = getGridItemIdOrder();
      // Add the customizable 'active' styles to the GridItem being moved.
      dragEl.current.classList.add(activeGridItemClass);
    }
  }, [getGridItemIdOrder]);

  /** Saves the new order of the GridItems and resets common state */
  const commitReorder = useCallback(() => {
    if (gridEl.current && dragEl.current) {
      // If the order has changed, call onReorder
      const currentOrder = getGridItemIdOrder();
      if (!equal(currentOrder, initialOrder.current)) onReorder(currentOrder);
      // Reset common state
      dragEl.current.classList.remove(activeGridItemClass);
      dragEl.current = undefined;
      reorderViaKeyboard.current = false;
      // And update the initial order to the current order.
      initialOrder.current = currentOrder;
    }
  }, [onReorder, getGridItemIdOrder]);

  /** Resets common state and reverts the order of the GridItems to the initial order */
  const cancelReorder = useCallback(() => {
    if (gridEl.current && dragEl.current && initialOrder.current) {
      // Determine if the order has actually changed before reverting.
      const currentOrder = getGridItemIdOrder();
      if (!equal(currentOrder, initialOrder.current)) {
        const initialIndex = initialOrder.current.indexOf(dragEl.current.getAttribute(gridItemIdKey) ?? "");
        // If GridItem was initially the last item in the grid, then we need to append it to the end of the other `GridItems`
        if (initialIndex === initialOrder.current.length - 1) {
          const gridItems = getGridItems();
          const lastGridItem = gridItems[gridItems.length - 1];
          // If there is another sibling (meaning there is a non-`GridItem` element after the last `gridItem`), then insert before that.
          gridEl.current.insertBefore(dragEl.current, lastGridItem.nextSibling);
        } else {
          // If this GridItem was not the last item in the grid, then we need to insert it before the next GridItem.
          const nextSiblingIndex = initialOrder.current[initialIndex + 1];
          const nextSibling = gridEl.current.querySelector(`[${gridItemIdKey}="${nextSiblingIndex}"]`);
          if (nextSibling) {
            gridEl.current.insertBefore(dragEl.current, nextSibling);
          }
        }
      }

      // And finally reset common state.
      dragEl.current.classList.remove(activeGridItemClass);
      dragEl.current = undefined;
      reorderViaKeyboard.current = false;
    }
  }, [getGridItemIdOrder, getGridItems]);

  /** Handles moving the GridItem based on cursor position */
  const onMove = useCallback((e: MouseOrTouchEvent) => {
    if (!reorderViaKeyboard.current && dragEl.current && cloneEl.current && gridEl.current) {
      // Get the current position of the pointer.
      const clientX = "clientX" in e ? e.clientX : e.touches[0].clientX;
      const clientY = "clientY" in e ? e.clientY : e.touches[0].clientY;

      // Update the transform property to move the element along with the pointer's position.
      const left = dragEl.current.style.left ? parseInt(dragEl.current.style.left) : 0;
      const top = dragEl.current.style.top ? parseInt(dragEl.current.style.top) : 0;
      const x = clientX - transformFrom.current.x - left;
      const y = clientY - transformFrom.current.y - top;
      dragEl.current.style.transform = `translate(${x}px, ${y}px)`;

      // For touch devices we need to use `document.elementFromPoint` to determine which element is under the cursor/dragged element. For non-touch screens, setting `pointer-events: none` does this for us.
      const maybeTarget = "touches" in e ? document.elementFromPoint(clientX, clientY) : e.target;
      const target = maybeTarget instanceof HTMLElement ? maybeTarget?.closest(`[${gridItemIdKey}]`) : undefined;

      // Figure out if we need to move the placeholder element based on the `dragEl`'s new position.
      if (target instanceof HTMLElement && target !== cloneEl.current && target !== dragEl.current) {
        const targetPos = target.getBoundingClientRect();
        const isHalfwayPassedTarget =
          (clientY - targetPos.top) / (targetPos.bottom - targetPos.top) > 0.5 ||
          (clientX - targetPos.left) / (targetPos.right - targetPos.left) > 0.5;

        // Only insert the placeholder if it's not already in the correct position.
        const shouldInsert =
          (isHalfwayPassedTarget && target.nextSibling !== cloneEl.current) ||
          (!isHalfwayPassedTarget && target.previousSibling !== cloneEl.current);

        if (shouldInsert) {
          gridEl.current.insertBefore(cloneEl.current, isHalfwayPassedTarget ? target.nextSibling : target);
        }
      }
    }
  }, []);

  /** Handles the initiation of the dragging process */
  const onDragStart = useCallback(
    (e: MouseOrTouchEvent) => {
      if (!reorderViaKeyboard.current && dragEl.current && gridEl.current) {
        initReorder();

        // Determine the position of the pointer relative to the element being dragged.
        const rect = dragEl.current.getBoundingClientRect();
        const clientX = "clientX" in e ? e.clientX : e.touches[0].clientX;
        const clientY = "clientY" in e ? e.clientY : e.touches[0].clientY;

        // Store the pointer's offset from the tile being moved to help correctly position the element as we drag it around.
        transformFrom.current = { x: clientX - rect.left, y: clientY - rect.top };

        // Duplicate the draggable element as a placeholder to show as a drop target
        cloneEl.current = dragEl.current.cloneNode() as HTMLElement;
        cloneEl.current?.setAttribute(
          "style",
          `border-width: 2px; border-color: ${Palette.Gray400}; border-style: dashed; width:${rect.width}px; height:${rect.height}px;`,
        );
        // Denote this is a "clone" so we can easily identify it later.
        cloneEl.current?.setAttribute(gridCloneKey, "true");
        // Remove the id attribute from the clone to avoid duplicate ids on the page.
        cloneEl.current.removeAttribute("id");
        // Ensure this element does not close the `active` styles as well.
        cloneEl.current?.classList.remove(activeGridItemClass);
        // And finally place it in the DOM after the element being dragged. If there is no `nextSibling`, then it is appended to the grid element.
        gridEl.current.insertBefore(cloneEl.current, dragEl.current.nextSibling);

        // Apply styles to the actual element to make it look like it's being dragged.
        // This will remove it from the normal flow of the page, allowing the clone above to take its place.
        dragEl.current.setAttribute(
          "style",
          `pointer-events: none; position:fixed; z-index: 9999; top:${rect.top}px; left:${rect.left}px; width:${rect.width}px; height:${rect.height}px;`,
        );
        // Applies cursor styling to the Grid element.
        gridEl.current.style.cursor = "grabbing";

        // Add event listeners to move the element as the user drags it around.
        gridEl.current.addEventListener("mousemove", onMove);
        gridEl.current.addEventListener("touchmove", onMove);
      }
    },
    [initReorder, onMove],
  );

  /** Handles the end of the dragging process */
  const onDragEnd = useCallback(
    (e: MouseOrTouchEvent) => {
      e.preventDefault();
      if (!reorderViaKeyboard.current && dragEl.current && cloneEl.current && gridEl.current) {
        cloneEl.current.replaceWith(dragEl.current);

        // Remove any placeholder elements.
        gridEl.current.querySelectorAll(`[${gridCloneKey}]`).forEach((el) => el.remove());
        // Clear custom styling
        dragEl.current.removeAttribute("style");
        gridEl.current.style.cursor = "auto";
        // And unset the `cloneEl`
        cloneEl.current = undefined;

        // Commit the changes to the GridItem order
        commitReorder();
        // Remove event listeners.
        gridEl.current.removeEventListener("mousemove", onMove);
        gridEl.current.removeEventListener("touchmove", onMove);
      }
    },
    [commitReorder, onMove],
  );

  /** Handles keyboard interaction when the active element is one of the "drag handles" */
  const onDragHandleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const moveHandle = e.target;

      if (dragEl.current instanceof HTMLElement && moveHandle instanceof HTMLElement && gridEl.current) {
        const isSpaceKey = e.key === " ";
        // Check to see if we should activate moving via keyboard
        if (isSpaceKey && !reorderViaKeyboard.current) {
          e.preventDefault();
          reorderViaKeyboard.current = true;
          document.addEventListener("pointerdown", cancelReorder);
          initReorder();
          return;
        }

        if (!reorderViaKeyboard.current) {
          return;
        }

        const isEnterKey = e.key === "Enter";
        const isTabKey = e.key === "Tab";
        // Use Enter or Space keys as a signal to commit the move
        if (isEnterKey || isSpaceKey || isTabKey) {
          if (!isTabKey) {
            e.preventDefault();
          }
          commitReorder();
          if (isEnterKey) {
            moveHandle.blur();
          }
          document.removeEventListener("pointerdown", cancelReorder);
          return;
        }

        // Use the Escape key to signal canceling the move
        if (e.key === "Escape") {
          e.preventDefault();
          cancelReorder();
          document.removeEventListener("pointerdown", cancelReorder);
          return;
        }

        // Check to see if we should move the element
        const movingLeft = ["ArrowLeft", "ArrowUp"].includes(e.key);
        const movingRight = ["ArrowRight", "ArrowDown"].includes(e.key);

        if (movingLeft || movingRight) {
          e.preventDefault();

          // Give the moveEl an "active" state to help identify which element is being moved
          const gridItems = getGridItems();
          const currentIndex = gridItems
            .map((child) => child.getAttribute(gridItemIdKey))
            .filter(isDefined)
            .indexOf(dragEl.current.getAttribute(gridItemIdKey)!);

          const newIndex = movingLeft ? currentIndex - 1 : currentIndex + 2;
          // If we are at the last GridItem, then check to see if there are any elements after it that may not be sortable, but we still want to insert before them.
          const insertBeforeElement = gridItems[newIndex] ?? gridItems[gridItems.length - 1].nextSibling;
          if ((movingLeft && currentIndex > 0) || (movingRight && currentIndex < gridItems.length - 1)) {
            gridEl.current.insertBefore(dragEl.current, insertBeforeElement);
          }
          // Put the focus back on the move handle in case it was moved
          moveHandle.focus();
        }
      }
    },
    [cancelReorder, commitReorder, initReorder, getGridItems],
  );

  return (
    <DnDGridContext.Provider value={{ dragEl, onDragHandleKeyDown }}>
      <div
        ref={gridEl}
        css={{
          ...Css.dg.addIn(`& .${activeGridItemClass}`, activeItemStyles ?? Css.bshModal.$).$,
          ...gridStyles,
        }}
        onTouchStart={onDragStart}
        onMouseDown={onDragStart}
        onTouchEnd={onDragEnd}
        onMouseUp={onDragEnd}
        {...tid}
      >
        {children}
      </div>
    </DnDGridContext.Provider>
  );
}

type GridStyles = Pick<
  Properties,
  | "gridTemplate"
  | "gridTemplateColumns"
  | "gridTemplateRows"
  | "gridTemplateAreas"
  | "gridAutoFlow"
  | "gridAutoColumns"
  | "gridAutoRows"
  | "gap"
  | "columnGap"
  | "rowGap"
>;

export const gridItemIdKey = "dndgrid-itemid";
const gridCloneKey = "dndgrid-clone";
const activeGridItemClass = "dndgrid-active";

// Create a union of the mouse and touch events, both native and react synthetics.
// This simplifies the type signature of the event handlers.
type MouseOrTouchEvent = MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent;
