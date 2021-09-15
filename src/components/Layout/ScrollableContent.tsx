import { ReactNode, ReactPortal } from "react";
import { createPortal } from "react-dom";
import { useScrollableParent } from "src/components/Layout/ScrollableParent";

/** Helper component for placing scrollable content within a `NestedScrollProvider`. */
export function ScrollableContent({ children }: { children: ReactNode }): ReactPortal {
  const { scrollableEl } = useScrollableParent();
  return createPortal(children, scrollableEl);
}
