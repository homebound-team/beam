import { useCallback, useRef } from "react";
import { useRightPaneOpenActions } from "./useRightPane";

/** Closes the pane when the layout root unmounts. */
export function useDocumentScrollRightPaneAnchorRef() {
  const { closePane } = useRightPaneOpenActions();
  const ref = useRef<HTMLDivElement | null>(null);

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node && ref.current) {
        closePane();
      }
      ref.current = node;
    },
    [closePane],
  );

  return { ref, setRef };
}
