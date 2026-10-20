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
let discardPrompt: ((proceed: VoidFunction) => void) | undefined;
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
  if (isOpen && wouldRemount(content, opts.content)) return confirmDiscard(() => showInPane(opts));
  if (isOpen && discardPrompt) warnIfUnkeyed(opts.content);
  showInPane(opts);
}

/** Unkeyed items of one panel type look like the same panel, so the guard can't ask between them. */
function warnIfUnkeyed(next: ReactNode) {
  if (process.env.NODE_ENV === "production" || !isValidElement(next) || next.key !== null) return;
  console.warn(
    "[openRightPane] Opened unkeyed content of the same type over a panel with `isDirty`, so it didn't ask and that panel's edits carry over. Key pane content per item, e.g. `<Panel key={id} />`.",
  );
}

function showInPane(opts: OpenRightPaneOpts) {
  content = opts.content;
  notifyContentListeners();
  if (isOpen) return;
  isOpen = true;
  notifyOpenListeners();
}

function closePane() {
  if (isOpen) confirmDiscard(hideRightPane);
}

function confirmDiscard(proceed: VoidFunction) {
  if (discardPrompt) discardPrompt(proceed);
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
export function setRightPaneDiscardPrompt(fn: (proceed: VoidFunction) => void): VoidFunction {
  discardPrompt = fn;
  return () => {
    // Don't clear a check that a swapped-in panel already set
    if (discardPrompt === fn) discardPrompt = undefined;
  };
}

/** Internal: closes the pane, then runs `next`; asks first if the open panel is dirty. */
export function closeRightPaneThen(next: VoidFunction): void {
  if (!isOpen) return next();
  confirmDiscard(() => {
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
  discardPrompt = undefined;
  notifyOpenListeners();
  notifyContentListeners();
}
