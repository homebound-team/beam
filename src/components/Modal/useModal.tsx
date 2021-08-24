import { useContext, useMemo, useRef } from "react";
import { BeamContext } from "src/components/BeamContext";
import { Callback, CheckFn } from "src/types";
import { maybeCall } from "src/utils";
import { ModalProps } from "./Modal";

export interface UseModalHook {
  openModal: (props: ModalProps) => void;
  closeModal: Callback;
  addCanClose: (canClose: CheckFn) => void;
}

export function useModal(): UseModalHook {
  const { modalState, modalCanCloseChecks } = useContext(BeamContext);
  const lastCanClose = useRef<CheckFn | undefined>();
  return useMemo(
    () => ({
      openModal(props) {
        // TODO Check already open?
        // TODO Check can leave?
        modalState.current = props;
      },
      closeModal() {
        // TODO: Should remove checks
        for (const canCloseModal of modalCanCloseChecks.current) {
          if (!canCloseModal()) {
            return;
          }
        }
        maybeCall(modalState.current?.onClose);
        modalState.current = undefined;
      },
      // TODO: Rename as a breaking change
      addCanClose(canClose) {
        modalCanCloseChecks.current = [
          // Only allow one canClose per component at a time; this lets the caller avoid useMemo'ing their lambda
          ...modalCanCloseChecks.current.filter((c) => c !== lastCanClose.current),
          canClose,
        ];
        lastCanClose.current = canClose;
      },
    }),
    [modalState, modalCanCloseChecks],
  );
}
