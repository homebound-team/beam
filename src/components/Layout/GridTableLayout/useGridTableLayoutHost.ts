import { useModalContext } from "src/components/Modal/ModalContext";
import { useDocumentScrollLayout } from "src/layouts/DocumentScrollLayoutContext";

export type GridTableLayoutHost =
  | { kind: "modal"; scrollEl: HTMLElement | null; scrollViewportWidth: string }
  | { kind: "document-scroll" }
  | { kind: "scrollable-parent" };

/** Resolves which surrounding layout owns the table's scrolling and sticky chrome. */
export function useGridTableLayoutHost(): GridTableLayoutHost {
  const { inModal, scrollEl } = useModalContext();
  const inDocumentScrollLayout = useDocumentScrollLayout();

  if (inModal) {
    // `100cqw` resolves against ModalFullBleed, the visible width of the modal body.
    return { kind: "modal", scrollEl, scrollViewportWidth: "100cqw" };
  }
  return inDocumentScrollLayout ? { kind: "document-scroll" } : { kind: "scrollable-parent" };
}
