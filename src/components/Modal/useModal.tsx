import { useEffect, useMemo, useRef } from "react";
import { useBeamContext } from "src/components/BeamContext";
import { Callback, CheckFn } from "src/types";
import { maybeCall } from "src/utils";
import { ModalProps } from "./Modal";

export interface UseModalHook {
  openModal: (props: ModalProps) => void;
  closeModal: Callback;
  addCanClose: (canClose: CheckFn) => void;
}

export function useModal(): UseModalHook {
  const { modalState, modalCanCloseChecks } = useBeamContext();
  const lastCanClose = useRef<CheckFn | undefined>();
  useEffect(() => {
    // Capture the lastCanClose from when the `useEffect` runs, so that when our cleanup
    // lambda is called later, we clean up the as-when-scheduled value, and not the super-latest
    // value, because then we need up nuking the actually valid current value.
    const { current } = lastCanClose;
    return () => {
      modalCanCloseChecks.current = [...modalCanCloseChecks.current.filter((c) => c !== current)];
    };
  }, [modalCanCloseChecks]);
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
