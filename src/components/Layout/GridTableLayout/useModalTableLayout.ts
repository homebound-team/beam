import { useModalContext } from "src/components/Modal/ModalContext";

/** Scrolls a `GridTableLayout` with the modal body; content above it scrolls away while the actions stay pinned. */
export function useModalTableLayout() {
  const { inModal, scrollEl } = useModalContext();
  return {
    inModal,
    scrollEl,
    // `100cqw` resolves against `ModalFullBleed`, the visible width of the modal body.
    scrollViewportWidth: inModal ? "100cqw" : undefined,
  };
}
