import { ReactNode, useCallback } from "react";
import { useRightPaneContext } from "./RightPaneLayout";

export interface UseRightPaneHook {
  /** Opens a right pane */
  openRightPane: (content: ReactNode) => void;
  /** Closes the right pane */
  closeRightPane: () => void;
  /** Returns whether the pane is currently open. */
  // isPaneOpen: boolean;
}

export function useRightPane(): UseRightPaneHook {
  const { openInPane, closePane } = useRightPaneContext();
  const openRightPane = useCallback((content) => openInPane(content), []);
  const closeRightPane = useCallback(() => closePane(), []);

  return {
    openRightPane,
    closeRightPane,
  };
}
