import { ReactNode } from "react";
import { OpenRightPaneOpts } from "./types";

export type RightPaneOpenActions = {
  openInPane: (opts: OpenRightPaneOpts) => void;
  closePane: () => void;
  clearPane: () => void;
};

let isOpen = false;
let content: ReactNode | undefined;
const openListeners = new Set<() => void>();
const contentListeners = new Set<() => void>();

/** Open-state store for {@link useSyncExternalStore}. */
export const rightPaneOpenStore = {
  subscribe: (listener: () => void) => {
    openListeners.add(listener);
    return () => openListeners.delete(listener);
  },
  getSnapshot: () => isOpen,
};

/** Pane content store for {@link useSyncExternalStore}. */
export const rightPaneContentStore = {
  subscribe: (listener: () => void) => {
    contentListeners.add(listener);
    return () => contentListeners.delete(listener);
  },
  getSnapshot: () => content,
};

function notifyOpenListeners() {
  openListeners.forEach((listener) => listener());
}

function notifyContentListeners() {
  contentListeners.forEach((listener) => listener());
}

function openInPane(opts: OpenRightPaneOpts) {
  content = opts.content;
  notifyContentListeners();
  if (isOpen) return;
  isOpen = true;
  notifyOpenListeners();
}

function closePane() {
  if (!isOpen) return;
  isOpen = false;
  notifyOpenListeners();
}

function clearPane() {
  content = undefined;
  notifyContentListeners();
}

/** Stable action refs — safe in row handlers without subscribing to open state. */
export const rightPaneOpenActions: RightPaneOpenActions = {
  openInPane,
  closePane,
  clearPane,
};

/** Reset module store between tests. */
export function resetRightPaneStore() {
  isOpen = false;
  content = undefined;
  notifyOpenListeners();
  notifyContentListeners();
}
