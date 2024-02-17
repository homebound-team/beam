import React, { KeyboardEvent, useMemo } from "react";
import { gridItemIdKey } from "src/components/DnDGrid/DnDGrid";
import { useDnDGridContext } from "src/components/DnDGrid/DnDGridContext";

export interface useDnDGridItemProps {
  id: React.Key;
  itemRef: React.RefObject<HTMLElement>;
}

/** Provides props for a GridItem to be draggable */
export function useDnDGridItem(props: useDnDGridItemProps) {
  const { id, itemRef } = props;
  const { dragEl, onDragHandleKeyDown } = useDnDGridContext();

  const { dragItemProps, dragHandleProps } = useMemo(
    () => {
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
        },
      };
    },
    // TODO: validate this eslint-disable. It was automatically ignored as part of https://app.shortcut.com/homebound-team/story/40033/enable-react-hooks-exhaustive-deps-for-react-projects
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dragEl, id, itemRef],
  );

  return { dragHandleProps, dragItemProps };
}

export type DnDGridItemProps = ReturnType<typeof useDnDGridItem>;
