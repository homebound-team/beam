import { ReactNode, createContext, useContext, useMemo } from "react";

interface ModalContextState {
  inModal: boolean;
}

export const ModalContext = createContext<ModalContextState>({ inModal: false });

interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const value = useMemo(() => ({ inModal: true }), []);
  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModalContext(): ModalContextState {
  return useContext(ModalContext);
}
