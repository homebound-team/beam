import equal from "fast-deep-equal";
import React, { KeyboardEvent, ReactNode, useCallback, useRef } from "react";
import { Css, Palette, Properties, useTestIds } from "src";
import { isDefined } from "src/utils";
import { DnDGridContext } from "./DnDGridContext";

export interface DnDGridProps {
  children: ReactNode;
  /** CSS Grid styles for the grid container. */
  gridStyles?: GridStyles;
  /** Defines the styling for the grid item that is actively being moved */
  activeItemStyles?: Properties;
  /** Returns the new order of the grid items. */
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

  const getGridItemIdOrder = useCallback(() => {
    if (gridEl.current) {
      const gridItems: NodeListOf<HTMLElement> = gridEl.current.querySelectorAll(`[${gridItemIdKey}]`);
      return Array.from(gridItems)
        .map((child) => child.getAttribute(gridItemIdKey))
        .filter(isDefined);
    }
    return [];
  }, []);

  const initReorder = useCallback(() => {
    if (gridEl.current && dragEl.current) {
      // Store the current order of the grid items for comparing against before calling onReorder.
      initialOrder.current = getGridItemIdOrder();
      dragEl.current.classList.add(movingGridItemClass);
    }
  }, [getGridItemIdOrder]);

  const commitReorder = useCallback(() => {
    if (gridEl.current && dragEl.current) {
      // If the order has changed, call onReorder
      const currentOrder = getGridItemIdOrder();
      if (!equal(currentOrder, initialOrder.current)) onReorder(currentOrder);
      dragEl.current.classList.remove(movingGridItemClass);
      dragEl.current = undefined;
      reorderViaKeyboard.current = false;
      initialOrder.current = currentOrder;
    }
  }, [onReorder, getGridItemIdOrder]);

  const cancelReorder = useCallback(() => {
    // If the order changed, then we need to reset it back to the original order.
    if (gridEl.current && dragEl.current && initialOrder.current) {
      const currentOrder = getGridItemIdOrder();

      if (!equal(currentOrder, initialOrder.current)) {
        const initialIndex = initialOrder.current.indexOf(dragEl.current.getAttribute(gridItemIdKey) ?? "");
        // If grid item was initially the last item in the grid, then we need to append it to the end of the other grid-items
        if (initialIndex === initialOrder.current.length - 1) {
          const gridItems: NodeListOf<HTMLElement> = gridEl.current.querySelectorAll(`[${gridItemIdKey}]`);
          const lastGridItem = gridItems[gridItems.length - 1];
          // If there is another sibling (meaning there is a non-`gridItem` element after the last `gridItem`), then insert before that.
          if (lastGridItem.nextSibling) {
            gridEl.current.insertBefore(dragEl.current, lastGridItem.nextSibling);
          } else {
            gridEl.current.appendChild(dragEl.current);
          }
        } else {
          // If this grid item was not the last item in the grid, then we need to insert it before the next grid item.
          const nextSiblingIndex = initialOrder.current[initialIndex + 1];
          const nextSibling = gridEl.current.querySelector(`[${gridItemIdKey}="${nextSiblingIndex}"]`);
          if (nextSibling) {
            gridEl.current.insertBefore(dragEl.current, nextSibling);
          }
        }
      }
      dragEl.current.classList.remove(movingGridItemClass);
      dragEl.current = undefined;
      reorderViaKeyboard.current = false;
    }
  }, [getGridItemIdOrder]);

  const onDragStart = useCallback(
    (e: MouseOrTouchEvent) => {
      e.preventDefault();
      if (!reorderViaKeyboard.current && dragEl.current && gridEl.current) {
        initReorder();

        // Determine the position of the pointer relative to the element being dragged.
        const rect = dragEl.current.getBoundingClientRect();
        const clientX = "clientX" in e ? e.clientX : e.touches[0].clientX;
        const clientY = "clientY" in e ? e.clientY : e.touches[0].clientY;

        // Store this offset to help correctly position the element as we drag it around.
        transformFrom.current = { x: clientX - rect.left, y: clientY - rect.top };

        // Duplicate the draggable element as a placeholder to show as a drop target
        cloneEl.current = dragEl.current?.cloneNode() as HTMLElement;
        cloneEl.current?.setAttribute(
          "style",
          `border-width: 2px; border-color: ${Palette.Gray400}; border-style: dashed; width:${rect.width}px; height:${rect.height}px;`,
        );
        cloneEl.current?.setAttribute(gridCloneKey, "true");
        // Remove the id attribute from the clone to avoid duplicate ids on the page.
        cloneEl.current.removeAttribute("id");
        cloneEl.current?.classList.remove(movingGridItemClass);
        gridEl.current.insertBefore(cloneEl.current, dragEl.current);

        // Apply styles to the actual element to make it look like it's being dragged.
        dragEl.current.setAttribute(
          "style",
          `pointer-events: none; position:fixed; z-index: 9999; top:${rect.top}px; left:${rect.left}px; width:${rect.width}px; height:${rect.height}px;`,
        );
        gridEl.current.style.cursor = "grabbing";

        // Add event listeners to move the element as the user drags it around.
        gridEl.current.addEventListener("mousemove", onMove);
        gridEl.current.addEventListener("touchmove", onMove);
      }
    },
    [initReorder],
  );

  const onMove = useCallback((e: MouseOrTouchEvent) => {
    if (!reorderViaKeyboard.current && dragEl.current && cloneEl.current && gridEl.current) {
      const clientX = "clientX" in e ? e.clientX : e.touches[0].clientX;
      const clientY = "clientY" in e ? e.clientY : e.touches[0].clientY;

      // Move the grid item being dragged along with the cursor.
      const left = dragEl.current.style.left ? parseInt(dragEl.current.style.left) : 0;
      const top = dragEl.current.style.top ? parseInt(dragEl.current.style.top) : 0;
      const x = clientX - transformFrom.current.x - left;
      const y = clientY - transformFrom.current.y - top;
      dragEl.current.style.transform = `translate(${x}px, ${y}px)`;

      // For touch devices we need to use `document.elementFromPoint` to determine which element is under the cursor/dragged element. For non-touch screens, setting `pointer-events: none` does this for us.
      const maybeTarget = "touches" in e ? document.elementFromPoint(clientX, clientY) : e.target;
      const target = maybeTarget instanceof HTMLElement ? maybeTarget?.closest(`[${gridItemIdKey}]`) : undefined;

      if (target instanceof HTMLElement) {
        // Figure out if we need to move the placeholder element.
        if (dragEl.current && target && target !== dragEl.current && target.hasAttribute(gridItemIdKey)) {
          const targetPos = target.getBoundingClientRect();
          const isHalfwayPassedTarget =
            (clientY - targetPos.top) / (targetPos.bottom - targetPos.top) > 0.5 ||
            (clientX - targetPos.left) / (targetPos.right - targetPos.left) > 0.5;
          gridEl.current.insertBefore(cloneEl.current, isHalfwayPassedTarget ? target.nextSibling : target);
        }
      }
    }
  }, []);

  const onDragEnd = useCallback(
    (e: MouseOrTouchEvent) => {
      e.preventDefault();
      if (!reorderViaKeyboard.current && dragEl.current && cloneEl.current && gridEl.current) {
        cloneEl.current.replaceWith(dragEl.current);

        // By dragging the item out of the viewport and then lifting the pointer, and then dragging back on screen,
        // it is possible to not remove the `cloneEl`. Ensure we do not leave any dangling clone elements
        gridEl.current.querySelectorAll(`[${gridCloneKey}]`).forEach((el) => el.remove());
        dragEl.current.removeAttribute("style");
        gridEl.current.style.cursor = "auto";
        cloneEl.current = undefined;

        commitReorder();
        // Remove event listeners.
        gridEl.current.removeEventListener("mousemove", onMove);
        gridEl.current.removeEventListener("touchmove", onMove);
      }
    },
    [commitReorder],
  );

  const onDragHandleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isSpaceKey = e.key === " ";
      const isEnterKey = e.key === "Enter";
      const isEscapeKey = e.key === "Escape";
      const moveHandle = e.target;
      if (dragEl.current instanceof HTMLElement && moveHandle instanceof HTMLElement && gridEl.current) {
        // Check to see if we should activate moving via keyboard
        if (isSpaceKey && !reorderViaKeyboard.current) {
          e.preventDefault();
          reorderViaKeyboard.current = true;
          initReorder();
          return;
        }

        // Use Enter or Space keys as a signal to commit the move
        if ((isEnterKey || isSpaceKey) && reorderViaKeyboard.current) {
          e.preventDefault();
          commitReorder();
          if (isEnterKey) {
            moveHandle.blur();
          }
          return;
        }

        // Use the Escape key to signal canceling the move
        if (isEscapeKey && dragEl.current.classList.contains(movingGridItemClass)) {
          e.preventDefault();
          cancelReorder();
          return;
        }

        const moveLeftKeys = ["ArrowLeft", "ArrowUp"];
        const moveRightKeys = ["ArrowRight", "ArrowDown"];
        if (
          dragEl.current.classList.contains(movingGridItemClass) &&
          [...moveLeftKeys, ...moveRightKeys].includes(e.key)
        ) {
          e.preventDefault();
          const movingLeft = moveLeftKeys.includes(e.key);
          const movingRight = moveRightKeys.includes(e.key);

          // Give the moveEl an "active" state to help identify which element is being moved
          const gridItems: NodeListOf<HTMLElement> = gridEl.current.querySelectorAll(`[${gridItemIdKey}]`);
          const currentIndex = Array.from(gridItems)
            .map((child) => child.getAttribute(gridItemIdKey))
            .filter(isDefined)
            .indexOf(dragEl.current.getAttribute(gridItemIdKey)!);

          const newIndex = movingLeft ? currentIndex - 1 : currentIndex + 2;
          // If we are at the last grid item, then check to see if there are any elements after it that may not be sortable, but we still want to insert before them.
          const nextEl = gridItems[newIndex] ?? gridItems[gridItems.length - 1].nextSibling;
          if (nextEl && ((movingLeft && currentIndex !== 0) || !movingLeft)) {
            gridEl.current.insertBefore(dragEl.current, nextEl);
          } else if (movingRight && currentIndex !== gridItems.length - 1) {
            // if this is not the last element already, and we're moving to the right, then append to the end.
            gridEl.current.appendChild(dragEl.current);
          }
          // Put the focus back on the move handle in case it was moved
          moveHandle.focus();
        }
      }
    },
    [cancelReorder, commitReorder, initReorder],
  );

  return (
    <DnDGridContext.Provider value={{ dragEl, onDragHandleKeyDown }}>
      <div
        ref={gridEl}
        css={{
          ...Css.dg.addIn(`& .${movingGridItemClass}`, activeItemStyles ?? Css.bshModal.$).$,
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
export const gridHandleKey = "dndgrid-draghandle";
const gridCloneKey = "dndgrid-clone";
const movingGridItemClass = "dndgrid-moving";

// Create a union of the mouse and touch events, both native and react synthetics.
// This simplifies the type signature of the event handlers.
type MouseOrTouchEvent = MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent;
