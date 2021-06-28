import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { OverlayProvider } from "react-aria";
import { Callback } from "src/types";
import { Modal, ModalProps } from "./Modal";

export interface ModalContextProps {
  openModal: (props: ModalProps) => void;
  closeModal: Callback;
  onClose: Callback;
  setOnClose: (onClose: Callback) => void;
}

export const ModalContext = createContext<ModalContextProps>({} as ModalContextProps);
export const useModalContext = () => useContext(ModalContext);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<ModalProps>({} as ModalProps);

  const modalContext: ModalContextProps = useMemo(
    () => ({
      openModal: (props) => setModalState(props),
      // Helper method intended to be used if default `onClose` functionality is overridden via `setOnClose`.
      closeModal: () => setModalState({} as ModalProps),
      onClose: () => {
        // If `onClose` is passed in, then call that and rely on the implementer to properly close the modal via `setOnClose`
        if (modalState.onClose) {
          modalState.onClose();
          return;
        }
        setModalState({} as ModalProps);
      },
      setOnClose: (onClose: Callback) => setModalState({ ...modalState, onClose }),
    }),
    [modalState],
  );

  return (
    <ModalContext.Provider value={modalContext}>
      {/* OverlayProvider is required for Modals generated via React-Aria */}
      <OverlayProvider>
        {children}
        {modalState.content && <Modal {...modalState} />}
      </OverlayProvider>
    </ModalContext.Provider>
  );
}
