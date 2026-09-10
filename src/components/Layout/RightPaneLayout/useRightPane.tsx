import { useSyncExternalStore, type ReactNode } from "react";
import {
  rightPaneContentStore,
  rightPaneOpenActions,
  rightPaneOpenStore,
  type RightPaneOpenActions,
} from "./rightPaneStore";
import type { OpenRightPaneOpts } from "./types";

export type RightPaneOpenState = RightPaneOpenActions & {
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

/** Subscribes to open state via the module store; includes stable actions. */
export function useRightPaneOpenState(): RightPaneOpenState {
  const isRightPaneOpen = useSyncExternalStore(
    rightPaneOpenStore.subscribe,
    rightPaneOpenStore.getSnapshot,
    rightPaneOpenStore.getSnapshot,
  );
  return { ...rightPaneOpenActions, isRightPaneOpen };
}

/** Subscribes to pane content via the module store. */
export function useRightPaneContent(): ReactNode {
  return useSyncExternalStore(
    rightPaneContentStore.subscribe,
    rightPaneContentStore.getSnapshot,
    rightPaneContentStore.getSnapshot,
  );
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
  const { openInPane, closePane, isRightPaneOpen } = useRightPaneOpenState();
  return {
    openRightPane: openInPane,
    closeRightPane: closePane,
    isRightPaneOpen,
  };
}
