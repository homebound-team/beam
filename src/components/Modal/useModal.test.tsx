import { act } from "@testing-library/react";
import { useEffect } from "react";
import { ModalProps } from "src/components/Modal/Modal";
import { useModal, UseModalHook } from "src/components/Modal/useModal";
import { Callback } from "src/types";
import { click, render, withBeamRTL } from "src/utils/rtl";

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
    const r = await render(<TestApp />, withBeamRTL);

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

  it("can provide a custom onClose method", async () => {
    function TestApp(modalProps: ModalProps) {
      const { openModal } = useModal();
      useEffect(() => {
        openModal(modalProps);
      }, [openModal]);
      return <div>App</div>;
    }

    // Given a modal that sets a custom `onClose` method
    function TestModalContent({ onClose }: { onClose: Callback }) {
      const { setOnClose } = useModal();
      useEffect(() => {
        setOnClose(onClose);
      }, [setOnClose]);
      return <div>Content</div>;
    }
    const onClose = jest.fn();
    const modalProps = { title: "Test", content: <TestModalContent onClose={onClose} /> };

    const r = await render(<TestApp {...modalProps} />, withBeamRTL);

    // When clicking the close button
    click(r.modal_titleClose);
    // Then expect the custom method to be called.
    expect(onClose).toBeCalled();
    // And the modal should not have closed since the custom method didn't not invoke the ModalContext.closeModal method.
    expect(r.modal()).toBeTruthy();
  });
});
