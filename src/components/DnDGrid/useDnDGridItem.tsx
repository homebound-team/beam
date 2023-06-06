import React, { KeyboardEvent, useMemo } from "react";
import { gridHandleKey, gridItemIdKey } from "src/components/DnDGrid/DnDGrid";
import { useDnDGridContext } from "src/components/DnDGrid/DnDGridContext";

export interface useDnDGridItemProps {
  id: React.Key;
  itemRef: React.RefObject<HTMLElement>;
}

/** Provides props for a GridItem to be draggable */
export function useDnDGridItem(props: useDnDGridItemProps) {
  const { id, itemRef } = props;
  const { dragEl, onDragHandleKeyDown } = useDnDGridContext();

  const { dragItemProps, dragHandleProps } = useMemo(() => {
    function initDraggable() {
      if (itemRef.current) {
        dragEl.current = itemRef.current;
      }
    }

    return {
      dragItemProps: { [gridItemIdKey]: id },
      dragHandleProps: {
        onMouseDown: initDraggable,
        onTouchStart: initDraggable,
        onKeyDown: (e: KeyboardEvent) => {
          initDraggable();
          onDragHandleKeyDown(e);
        },
        [gridHandleKey]: "true",
      },
    };
  }, [dragEl, id, itemRef]);

  return { dragHandleProps, dragItemProps };
}

export type DnDGridItemProps = ReturnType<typeof useDnDGridItem>;
