import { useContext, useMemo, useRef } from "react";
import { BeamContext } from "src/components/BeamContext";
import { Callback } from "src/types";
import { ModalProps } from "./Modal";

export interface UseModalHook {
  openModal: (props: ModalProps) => void;
  closeModal: Callback;
  addCanClose: (canClose: () => boolean) => void;
}

export function useModal(): UseModalHook {
  const { modalState, canCloseModalChecks } = useContext(BeamContext);
  const lastCanClose = useRef<undefined | (() => boolean)>();
  return useMemo(
    () => ({
      openModal(props) {
        // TODO Check already open?
        // TODO Check can leave?
        modalState.current = props;
      },
      closeModal() {
        for (const canCloseModal of canCloseModalChecks.current) {
          if (!canCloseModal()) {
            return;
          }
        }
        modalState.current = undefined;
      },
      // TODO: Rename as a breaking change
      addCanClose(canClose) {
        canCloseModalChecks.current = [
          // Only allow one canClose per component at a time; this lets the caller avoid useMemo'ing their lambda
          ...canCloseModalChecks.current.filter((c) => c !== lastCanClose.current),
          canClose,
        ];
        lastCanClose.current = canClose;
      },
    }),
    [modalState, canCloseModalChecks],
  );
}
