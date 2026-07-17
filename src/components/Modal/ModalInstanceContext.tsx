import { createContext, ReactNode, useContext, useMemo } from "react";
import { CheckFn } from "src/types";
import { ModalProps } from "./Modal";

/** Per-open-Modal state: portal slots + close/size APIs shared with ModalHeader/Body/Footer and nested useModal(). */
export type ModalInstanceContextState = {
  closeModal: VoidFunction;
  addCanClose: (canClose: CheckFn) => void;
  setSize: (size: ModalProps["size"]) => void;
  /** The div for ModalHeader to portal into. */
  modalHeaderDiv: HTMLDivElement;
  /** The div for ModalBody to portal into. */
  modalBodyDiv: HTMLDivElement;
  /** The div for ModalFooter to portal into. */
  modalFooterDiv: HTMLDivElement;
};

export const ModalInstanceContext = createContext<ModalInstanceContextState | undefined>(undefined);

export function useModalInstance(): ModalInstanceContextState | undefined {
  return useContext(ModalInstanceContext);
}

interface ModalInstanceProviderProps {
  value: ModalInstanceContextState;
  children: ReactNode;
}

export function ModalInstanceProvider({ value, children }: ModalInstanceProviderProps) {
  // Keep provider value identity stable when the same fields are passed
  const memo = useMemo(() => value, [value]);
  return <ModalInstanceContext.Provider value={memo}>{children}</ModalInstanceContext.Provider>;
}
