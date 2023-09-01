import { OpenRightPaneOpts, useRightPaneContext } from "./RightPaneContext";

export interface UseRightPaneHook {
  /** Opens a right pane */
  openRightPane: (opts: OpenRightPaneOpts) => void;
  /** Closes the right pane */
  closeRightPane: () => void;
}

export function useRightPane(): UseRightPaneHook {
  const { openInPane, closePane } = useRightPaneContext();
  return {
    openRightPane: openInPane,
    closeRightPane: closePane,
  };
}
