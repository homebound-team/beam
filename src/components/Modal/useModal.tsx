import { useContext, useMemo } from "react";
import { BeamContext } from "src/components/BeamContext";
import { Callback } from "src/types";
import { ModalProps } from "./Modal";

export interface UseModalHook {
  openModal: (props: ModalProps) => void;
  closeModal: Callback;
  onClose: Callback;
  setOnClose: (onClose: Callback) => void;
}

export function useModal(): UseModalHook {
  const { modalState } = useContext(BeamContext);
  return useMemo(
    () => ({
      openModal(props) {
        // TODO Check already open?
        // TODO Check can leave?
        modalState.current = props;
      },
      closeModal() {
        // TODO Check can leave?
        modalState.current = undefined;
      },
      onClose() {
        modalState.current = undefined;
      },
      setOnClose(onClose) {},
    }),
    [modalState],
  );
}
