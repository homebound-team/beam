import { useEffect } from "react";
import { Modal, ModalProps } from "src/components/Modal/Modal";
import { useModal } from "src/components/Modal/useModal";

export interface OpenModalProps {
  /** The custom modal content to show. */
  children: JSX.Element;
  /** The size to use. */
  size?: ModalProps["size"];
  /** Whether to force the modal to stay open. This is useful for stories where ruler/tape extensions cause the modal to close. */
  keepOpen?: boolean;
}

/**
 * A component for testing open modals in stories and unit tests.
 *
 * Currently, calling `render(<ModalComponent />)` in a test currently doesn't work, because
 * nothing has called `useModal` to get the header & footer mounted into the DOM.
 *
 * So instead tests can call:
 *
 * ```tsx
 * render(
 *   <OpenModal>
 *     <ModalComponent />
 *   </OpenModal>
 * );
 * ```
 *
 * And `OpenModal` will do a boilerplate `openModal` call, so that the content
 * shows up in the DOM as expected.
 */
export function OpenModal(props: OpenModalProps): JSX.Element {
  const { openModal } = useModal();
  const { size, children, keepOpen } = props;
  useEffect(() => {
    if (!keepOpen) {
      openModal({ size, content: children });
    }
  }, [keepOpen, openModal, size, children]);
  if (keepOpen) {
    return <Modal size={size} content={children} />;
  } else {
    return <div>dummy content</div>;
  }
}
