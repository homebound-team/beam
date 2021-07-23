import { useEffect } from "react";
import { ModalSize } from "src/components/Modal/Modal";
import { useModal } from "src/components/Modal/useModal";

/**
 * A component for testing open modals in unit tests.
 *
 * Current, calling `render(<ModalComponent />)` in a test currently doesn't work, because
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
export function OpenModal(props: { children: JSX.Element; size?: ModalSize; title?: string }): JSX.Element {
  const { openModal } = useModal();
  const { size, title = "Title", children } = props;
  useEffect(() => openModal({ size, title, content: children }), [openModal, size, title, children]);
  return <div>dummy content</div>;
}
