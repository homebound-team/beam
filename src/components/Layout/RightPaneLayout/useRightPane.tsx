import { ReactNode, useCallback } from "react";
import { useRightPaneContext } from "./RightPaneContext";

interface OpenRightPaneOpts {
  content: ReactNode;
}

export interface UseRightPaneHook {
  /** Opens a right pane */
  // openRightPane: (opts: OpenRightPaneOpts) => void;
  openRightPane: (opts: OpenRightPaneOpts) => void;
  /** Closes the right pane */
  closeRightPane: () => void;
}

export function useRightPane(): UseRightPaneHook {
  const { openInPane, closePane } = useRightPaneContext();
  const openRightPane = useCallback((opts: OpenRightPaneOpts) => {
    openInPane(opts);
  }, []);
  const closeRightPane = useCallback(() => closePane(), []);

  return {
    openRightPane,
    closeRightPane,
  };
}
