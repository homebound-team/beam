import React, { ReactNode, useCallback, useContext, useMemo, useRef, useSyncExternalStore } from "react";
import { OpenRightPaneOpts } from "./types";

export type RightPaneOpenActions = {
  openInPane: (opts: OpenRightPaneOpts) => void;
  closePane: () => void;
  clearPane: () => void;
};

export type RightPaneOpenContextProps = RightPaneOpenActions & {
  isRightPaneOpen: boolean;
};

const defaultActions: RightPaneOpenActions = {
  openInPane: () => {},
  closePane: () => {},
  clearPane: () => {},
};

/** Actions only — stable so {@link RightPaneProvider} does not re-render on open/close. */
const RightPaneOpenActionsContext = React.createContext<RightPaneOpenActions>(defaultActions);

type RightPaneOpenStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => boolean;
};

type RightPaneContentStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => ReactNode;
};

const RightPaneOpenStoreContext = React.createContext<RightPaneOpenStore | null>(null);
const RightPaneContentStoreContext = React.createContext<RightPaneContentStore | null>(null);

/** Open/close via external stores so open/close and row swaps do not re-render the table tree. */
export function RightPaneProvider({ children }: { children: ReactNode }) {
  const isOpenRef = useRef(false);
  const openListenersRef = useRef(new Set<() => void>());
  const contentRef = useRef<ReactNode>(undefined);
  const contentListenersRef = useRef(new Set<() => void>());

  const openStore = useMemo<RightPaneOpenStore>(
    () => ({
      subscribe: (listener) => {
        openListenersRef.current.add(listener);
        return () => openListenersRef.current.delete(listener);
      },
      getSnapshot: () => isOpenRef.current,
    }),
    [],
  );

  const contentStore = useMemo<RightPaneContentStore>(
    () => ({
      subscribe: (listener) => {
        contentListenersRef.current.add(listener);
        return () => contentListenersRef.current.delete(listener);
      },
      getSnapshot: () => contentRef.current,
    }),
    [],
  );

  const setIsOpen = useCallback((next: boolean) => {
    if (isOpenRef.current === next) return;
    isOpenRef.current = next;
    openListenersRef.current.forEach((listener) => listener());
  }, []);

  const setContent = useCallback((content: ReactNode) => {
    contentRef.current = content;
    contentListenersRef.current.forEach((listener) => listener());
  }, []);

  const openInPane = useCallback(
    (opts: OpenRightPaneOpts) => {
      setContent(opts?.content);
      setIsOpen(true);
    },
    [setContent, setIsOpen],
  );
  const closePane = useCallback(() => setIsOpen(false), [setIsOpen]);
  const clearPane = useCallback(() => setContent(undefined), [setContent]);

  const actions = useMemo(() => ({ openInPane, closePane, clearPane }), [openInPane, closePane, clearPane]);

  return (
    <RightPaneOpenActionsContext.Provider value={actions}>
      <RightPaneOpenStoreContext.Provider value={openStore}>
        <RightPaneContentStoreContext.Provider value={contentStore}>{children}</RightPaneContentStoreContext.Provider>
      </RightPaneOpenStoreContext.Provider>
    </RightPaneOpenActionsContext.Provider>
  );
}

/** Open/close actions only — does not subscribe to open state (avoids re-rendering layout hosts on toggle). */
export function useRightPaneOpenActions(): RightPaneOpenActions {
  const actions = useContext(RightPaneOpenActionsContext);
  if (actions === defaultActions) {
    throw new Error("useRightPaneOpenActions must be used within RightPaneProvider");
  }
  return actions;
}

export function useRightPaneOpenContext(): RightPaneOpenContextProps {
  const actions = useRightPaneOpenActions();
  const openStore = useContext(RightPaneOpenStoreContext);
  if (!openStore) {
    throw new Error("useRightPaneOpenContext must be used within RightPaneProvider");
  }
  const isRightPaneOpen = useSyncExternalStore(openStore.subscribe, openStore.getSnapshot, openStore.getSnapshot);
  return { ...actions, isRightPaneOpen };
}

/** Pane body only — updates via external store so row swaps do not re-render layout hosts or the table. */
export function useRightPaneContentContext(): ReactNode {
  const store = useContext(RightPaneContentStoreContext);
  if (!store) {
    throw new Error("useRightPaneContentContext must be used within RightPaneProvider");
  }
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}
