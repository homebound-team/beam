import { createContext, type ReactNode, useContext, useMemo } from "react";

type ModalContextState = {
  inModal: boolean;
  /** The modal body's scroll container; `null` when `ModalBody` sets `contentOwnsScroll`. */
  scrollEl: HTMLElement | null;
};

export const ModalContext = createContext<ModalContextState>({ inModal: false, scrollEl: null });

type ModalProviderProps = {
  children: ReactNode;
  scrollEl?: HTMLElement | null;
};

export function ModalProvider({ children, scrollEl = null }: ModalProviderProps) {
  const value = useMemo(() => ({ inModal: true, scrollEl }), [scrollEl]);
  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModalContext(): ModalContextState {
  return useContext(ModalContext);
}
