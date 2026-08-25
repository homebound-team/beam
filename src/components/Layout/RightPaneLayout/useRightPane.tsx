import { OpenRightPaneOpts, useRightPaneContext } from "./RightPaneContext";

export type UseRightPaneHook = {
  /** Opens a right pane */
  openRightPane: (opts: OpenRightPaneOpts) => void;
  /** Closes the right pane */
  closeRightPane: () => void;
  /** Whether the right pane is currently open. */
  isRightPaneOpen: boolean;
};

export function useRightPane(): UseRightPaneHook {
  const { openInPane, closePane, isRightPaneOpen } = useRightPaneContext();
  return {
    openRightPane: openInPane,
    closeRightPane: closePane,
    isRightPaneOpen,
  };
}
