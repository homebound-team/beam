import { useEffect, useMemo, useRef } from "react";
import { useBeamContext } from "src/components/BeamContext";
import { Callback, CheckFn } from "src/types";
import { maybeCall } from "src/utils";
import { ModalApi, ModalProps } from "./Modal";

export interface UseModalHook {
  openModal: (props: ModalProps) => void;
  closeModal: Callback;
  addCanClose: (canClose: CheckFn) => void;
  setSize: (size: ModalProps["size"]) => void;
}

export function useModal(): UseModalHook {
  const { modalState, modalCanCloseChecks } = useBeamContext();
  const lastCanClose = useRef<CheckFn | undefined>();
  const api = useRef<ModalApi>();
  useEffect(() => {
    return () => {
      modalCanCloseChecks.current = modalCanCloseChecks.current.filter((c) => c !== lastCanClose.current);
    };
  }, [modalCanCloseChecks]);
  return useMemo(
    () => ({
      openModal(props) {
        // TODO Check already open?
        // TODO Check can leave?
        modalState.current = { ...props, api };
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
      setSize(size: ModalProps["size"]) {
        if (modalState.current && modalState.current.api?.current) {
          modalState.current.api.current.setSize(size);
        }
      },
    }),
    [modalState, modalCanCloseChecks],
  );
}
