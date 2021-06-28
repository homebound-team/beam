import { fireEvent } from "@testing-library/react";
import { useEffect } from "react";
import { ModalBody, ModalFooter, ModalProps, useModalContext } from "src/components/Modal";
import { noop } from "src/utils";
import { click, render, withModalRTL } from "src/utils/rtl";

describe("Modal", () => {
  it("renders", async () => {
    // When rendered
    const r = await render(
      <TestModalApp title="Title" onClose={noop} content={<TestModalComponent />} />,
      withModalRTL,
    );

    // Then expect the content to match
    expect(r.modal_title().textContent).toBe("Title");
    expect(r.modal_titleClose()).toBeTruthy();
    expect(r.modal_content()).toBeTruthy();
  });

  it("invokes onClose", async () => {
    // Given mocked actions
    const onClose = jest.fn();
    const r = await render(
      <TestModalApp title="Title" onClose={onClose} content={<TestModalComponent />} />,
      withModalRTL,
    );

    // When invoking the `onClose` in various interactions
    click(r.modal_titleClose);
    expect(onClose).toBeCalledTimes(1);
    fireEvent.keyDown(r.modal(), { key: "Escape", code: "Escape" });
    expect(onClose).toBeCalledTimes(2);
  });

  describe("ModalBody", () => {
    it("renders", async () => {
      // When rendered
      const { modal_content } = await render(<ModalBody>Test Content</ModalBody>);
      // Then expect the content to be displayed
      expect(modal_content().textContent).toBe("Test Content");
    });
  });

  describe("ModalFooter", () => {
    it("renders", async () => {
      // When rendered
      const { modal_footer } = await render(<ModalFooter>Test Footer</ModalFooter>);
      // Then expect the footer content to be displayed
      expect(modal_footer().textContent).toBe("Test Footer");
    });
  });
});

function TestModalApp(modalProps: ModalProps) {
  const { openModal } = useModalContext();
  useEffect(() => {
    openModal(modalProps);
  }, []);

  return <h1>Page title</h1>;
}

function TestModalComponent() {
  return (
    <>
      <ModalBody>Modal Body</ModalBody>
      <ModalFooter>Modal Footer</ModalFooter>
    </>
  );
}
