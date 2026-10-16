import { useCallback, useRef } from "react";
import { hideRightPane } from "./rightPaneStore";

/** Closes the pane when the layout root unmounts. */
export function useDocumentScrollRightPaneAnchorRef() {
  const ref = useRef<HTMLDivElement | null>(null);

  const setRef = useCallback((node: HTMLDivElement | null) => {
    if (!node && ref.current) {
      hideRightPane();
    }
    ref.current = node;
  }, []);

  return { ref, setRef };
}
