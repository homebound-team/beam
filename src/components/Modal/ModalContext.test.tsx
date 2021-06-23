import { act } from "@testing-library/react";
import { useEffect } from "react";
import { ModalProps } from "src/components/Modal/Modal";
import { ModalContextProps, useModalContext } from "src/components/Modal/ModalContext";
import { Noop } from "src/types";
import { click, render, withModalRTL } from "src/utils/rtl";

class noop {}

describe("ModalContext", () => {
  it("can open and close the modal", async () => {
    // Given a ModalContext
    let context: ModalContextProps;
    const modalProps = { title: "Test", content: <div>Test</div> };

    function TestApp() {
      context = useModalContext();
      return <div />;
    }

    // When rendering a component without a modal defined
    const r = await render(<TestApp />, withModalRTL);

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
      const { openModal } = useModalContext();
      useEffect(() => {
        openModal(modalProps);
      }, []);
      return <div>App</div>;
    }

    // Given a modal that sets a custom `onClose` method
    function TestModalContent({ onClose }: { onClose: Noop }) {
      const { setOnClose } = useModalContext();
      useEffect(() => {
        setOnClose(onClose);
      }, []);
      return <div>Content</div>;
    }
    const onClose = jest.fn();
    const modalProps = { title: "Test", content: <TestModalContent onClose={onClose} /> };

    const r = await render(<TestApp {...modalProps} />, withModalRTL);

    // When clicking the close button
    click(r.modal_titleClose);
    // Then expect the custom method to be called.
    expect(onClose).toBeCalled();
    // And the modal should not have closed since the custom method didn't not invoke the ModalContext.closeModal method.
    expect(r.modal()).toBeTruthy();
  });
});
