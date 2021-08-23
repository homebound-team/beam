import { ReactNode, ReactPortal, useContext } from "react";
import { createPortal } from "react-dom";
import { NestedScrollLayoutContext } from "src/components/Layout/NestedScrollLayoutContext";

/** Helper component for placing scrollable content within a `NestedScrollProvider`. */
export function ScrollableContent({ children }: { children: ReactNode }): ReactPortal {
  const { scrollableEl } = useContext(NestedScrollLayoutContext);
  return createPortal(children, scrollableEl);
}
