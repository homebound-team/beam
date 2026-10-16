import { isValidElement, type ReactNode } from "react";

/** Body passed to `openRightPane`. */
export type OpenRightPaneOpts = {
  content: ReactNode;
};

export type RightPaneOpenActions = {
  openInPane: (opts: OpenRightPaneOpts) => void;
  closePane: () => void;
  clearPane: () => void;
};

let isOpen = false;
let content: ReactNode | undefined;
/** Set by the open `RightPanePanel`'s `isDirty`; runs `proceed` now or once the user discards. */
let confirmDiscard: ((proceed: VoidFunction) => void) | undefined;
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
  // Same type + key updates the panel in place, so only a remount loses its edits
  if (isOpen && wouldRemount(content, opts.content)) return ask(() => showInPane(opts));
  showInPane(opts);
}

function showInPane(opts: OpenRightPaneOpts) {
  content = opts.content;
  notifyContentListeners();
  if (isOpen) return;
  isOpen = true;
  notifyOpenListeners();
}

function closePane() {
  if (isOpen) ask(hideRightPane);
}

function ask(proceed: VoidFunction) {
  if (confirmDiscard) confirmDiscard(proceed);
  else proceed();
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

/** Internal: the open `RightPanePanel` registers its discard prompt; returns its unregister. */
export function setRightPaneConfirmDiscard(fn: (proceed: VoidFunction) => void): VoidFunction {
  confirmDiscard = fn;
  return () => {
    // Don't clear a check that a swapped-in panel already set
    if (confirmDiscard === fn) confirmDiscard = undefined;
  };
}

/** Internal: closes the pane, then runs `next`; asks first if the open panel is dirty. */
export function closeRightPaneThen(next: VoidFunction): void {
  if (!isOpen) return next();
  ask(() => {
    hideRightPane();
    next();
  });
}

/** Internal: closes without asking, for a host whose unmount takes the panel with it. */
export function hideRightPane(): void {
  if (!isOpen) return;
  isOpen = false;
  notifyOpenListeners();
}

/** Reset module store between tests. */
export function resetRightPaneStore() {
  isOpen = false;
  content = undefined;
  confirmDiscard = undefined;
  notifyOpenListeners();
  notifyContentListeners();
}
