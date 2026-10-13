import { isValidElement, type ReactNode } from "react";
import {
  getRightPaneConfirmDiscard,
  resetRightPaneConfirmDiscard,
} from "src/components/Layout/RightPaneLayout/internal/rightPaneConfirmDiscard";

/** Body passed to `openRightPane`. */
export type OpenRightPaneOpts = {
  content: ReactNode;
};

export type CloseRightPaneOpts = {
  /** Skip the unsaved-changes check, e.g. after deleting the shown item or when the pane's host unmounts. */
  force?: boolean;
};

export type RightPaneOpenActions = {
  openInPane: (opts: OpenRightPaneOpts) => void;
  closePane: (opts?: CloseRightPaneOpts) => void;
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
  const confirmDiscard = getRightPaneConfirmDiscard();
  // Same type + key updates the panel in place, so only a remount loses its edits
  if (isOpen && confirmDiscard && wouldRemount(content, opts.content)) return confirmDiscard(() => showInPane(opts));
  showInPane(opts);
}

function showInPane(opts: OpenRightPaneOpts) {
  content = opts.content;
  notifyContentListeners();
  if (isOpen) return;
  isOpen = true;
  notifyOpenListeners();
}

function closePane(opts?: CloseRightPaneOpts) {
  if (!isOpen) return;
  const confirmDiscard = getRightPaneConfirmDiscard();
  if (confirmDiscard && !opts?.force) return confirmDiscard(hidePane);
  hidePane();
}

function hidePane() {
  if (!isOpen) return;
  isOpen = false;
  notifyOpenListeners();
}

function wouldRemount(prev: ReactNode, next: ReactNode): boolean {
  return !isValidElement(prev) || !isValidElement(next) || prev.type !== next.type || prev.key !== next.key;
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
  resetRightPaneConfirmDiscard();
  notifyOpenListeners();
  notifyContentListeners();
}
