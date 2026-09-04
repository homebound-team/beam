import { useRightPaneOpenActions, useRightPaneOpenContext } from "./RightPaneContext";
import { OpenRightPaneOpts } from "./types";

export type UseRightPaneHook = {
  /** Opens a right pane */
  openRightPane: (opts: OpenRightPaneOpts) => void;
  /** Closes the right pane */
  closeRightPane: () => void;
  /** Whether the right pane is currently open. */
  isRightPaneOpen: boolean;
};

export type UseRightPaneActionsHook = Pick<UseRightPaneHook, "openRightPane" | "closeRightPane">;

/** Open/close only — use in row click handlers so the table tree does not re-render on toggle. */
export function useRightPaneActions(): UseRightPaneActionsHook {
  const { openInPane, closePane } = useRightPaneOpenActions();
  return {
    openRightPane: openInPane,
    closeRightPane: closePane,
  };
}

export function useRightPane(): UseRightPaneHook {
  const { openInPane, closePane, isRightPaneOpen } = useRightPaneOpenContext();
  return {
    openRightPane: openInPane,
    closeRightPane: closePane,
    isRightPaneOpen,
  };
}
