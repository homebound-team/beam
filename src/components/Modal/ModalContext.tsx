// ModalContext.tsx

import React, { createContext, useContext, useMemo, useState } from "react";
import { Modal, ModalProps } from "./Modal";

// Define the type for the modal context
interface ModalContextState {
  inModal: boolean;
}

// Create a context for the modal state
export const ModalContext = createContext<ModalContextState>({ inModal: false });

// Create a provider component to wrap your app and provide the modal state
interface ModalProviderProps {
  modalProps: ModalProps;
}

export function ModalProvider({ modalProps }: ModalProviderProps) {
  const value = useMemo(() => ({ inModal: true }), []);
  return (
    <ModalContext.Provider value={value}>
      <Modal {...modalProps} />
    </ModalContext.Provider>
  );
}

// Create a custom hook to conveniently access the modal context
export function useModalContext(): ModalContextState {
  return useContext(ModalContext);
}
