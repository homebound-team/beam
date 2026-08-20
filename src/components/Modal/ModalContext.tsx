import { createContext, ReactNode, useContext, useMemo } from "react";

type ModalContextState = {
  inModal: boolean;
  aiMode: boolean;
};

export const ModalContext = createContext<ModalContextState>({ inModal: false, aiMode: false });

type ModalProviderProps = {
  children: ReactNode;
  aiMode?: boolean;
};

export function ModalProvider({ children, aiMode = false }: ModalProviderProps) {
  const value = useMemo(() => ({ inModal: true, aiMode }), [aiMode]);
  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModalContext(): ModalContextState {
  return useContext(ModalContext);
}
