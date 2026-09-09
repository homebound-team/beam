import type React from "react";
import { createContext, useContext, type KeyboardEvent } from "react";

interface DnDGridContextProps {
  dragEl: React.MutableRefObject<HTMLElement | undefined>;
  onDragHandleKeyDown: (e: KeyboardEvent) => void;
}

export const DnDGridContext = createContext<DnDGridContextProps>({
  dragEl: { current: undefined },
  onDragHandleKeyDown: () => {},
});

export function useDnDGridContext() {
  return useContext(DnDGridContext);
}
