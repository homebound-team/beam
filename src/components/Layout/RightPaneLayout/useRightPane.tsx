import { ReactNode, useSyncExternalStore } from "react";
import {
  rightPaneContentStore,
  rightPaneOpenActions,
  rightPaneOpenStore,
  type RightPaneOpenActions,
} from "./rightPaneStore";
import { OpenRightPaneOpts } from "./types";

export type { RightPaneOpenActions };

export type RightPaneOpenContextProps = RightPaneOpenActions & {
  isRightPaneOpen: boolean;
};

export type UseRightPaneHook = {
  /** Opens a right pane */
  openRightPane: (opts: OpenRightPaneOpts) => void;
  /** Closes the right pane */
  closeRightPane: () => void;
  /** Whether the right pane is currently open. */
  isRightPaneOpen: boolean;
};

export type UseRightPaneActionsHook = Pick<UseRightPaneHook, "openRightPane" | "closeRightPane">;

/** Open/close actions only — does not subscribe to open state. */
export function useRightPaneOpenActions() {
  return rightPaneOpenActions;
}

export function useRightPaneOpenContext(): RightPaneOpenContextProps {
  const isRightPaneOpen = useSyncExternalStore(rightPaneOpenStore.subscribe, rightPaneOpenStore.getSnapshot);
  return { ...rightPaneOpenActions, isRightPaneOpen };
}

/** Pane body only — subscribes to content swaps without re-rendering layout hosts. */
export function useRightPaneContentContext(): ReactNode {
  return useSyncExternalStore(rightPaneContentStore.subscribe, rightPaneContentStore.getSnapshot);
}

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
