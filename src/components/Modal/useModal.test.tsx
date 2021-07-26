import { act } from "@testing-library/react";
import { useEffect } from "react";
import { ModalProps } from "src/components/Modal/Modal";
import { useModal, UseModalHook } from "src/components/Modal/useModal";
import { click, render } from "src/utils/rtl";

describe("useModal", () => {
  it("can open and close the modal", async () => {
    // Given a ModalContext
    let context: UseModalHook;
    const modalProps = { title: "Test", content: <div>Test</div> };

    function TestApp() {
      context = useModal();
      return <div />;
    }

    // When rendering a component without a modal defined
    const r = await render(<TestApp />);

    // Then expect no modal to exist
    expect(r.queryByTestId("modal")).toBeFalsy();

    // When opening the modal via the context method
    act(() => context!.openModal(modalProps));
    // Then expect modal to open
    expect(r.modal()).toBeTruthy();

    // When closing the modal via the context method
    act(() => context!.closeModal());
    // Then expect the modal to close
    expect(r.queryByTestId("modal")).toBeFalsy();
  });

  it("can provide a custom canClose method", async () => {
    function TestApp(props: ModalProps) {
      const { openModal } = useModal();
      useEffect(() => openModal(props), []);
      return <div>App</div>;
    }

    // Given a modal that sets a custom `canClose` method
    function TestModalContent({ canClose }: { canClose: () => boolean }) {
      const { addCanClose } = useModal();
      addCanClose(canClose);
      return <div>Content</div>;
    }
    const canClose = jest.fn().mockReturnValue(false);
    const modalProps = { title: "Test", content: <TestModalContent canClose={canClose} /> };

    const r = await render(<TestApp {...modalProps} />);

    // When clicking the close button
    click(r.modal_titleClose);
    // Then expect the custom method to be called.
    expect(canClose).toBeCalled();
    // And the modal should not have closed since the canClose check is false.
    expect(r.modal()).toBeTruthy();
  });

  it("can close modal when checks pass", async () => {
    function TestApp(props: ModalProps) {
      const { openModal } = useModal();
      useEffect(() => openModal(props), []);
      return <div>App</div>;
    }

    // Given a modal that sets a custom `canClose` method
    function TestModalContent({ canClose }: { canClose: () => boolean }) {
      const { addCanClose } = useModal();
      addCanClose(canClose);
      return <div>Content</div>;
    }
    const canClose = jest.fn().mockReturnValue(true);
    const onClose = jest.fn();
    const modalProps = { title: "Test", content: <TestModalContent canClose={canClose} />, onClose };

    const r = await render(<TestApp {...modalProps} />);

    // When clicking the close button
    click(r.modal_titleClose);
    // Then expect the custom method to be called.
    expect(canClose).toBeCalled();
    // And the modal should have closed since the canClose check is true.
    expect(onClose).toBeCalledTimes(1);
    expect(r.queryByTestId("modal")).toBeFalsy();
  });
});
