import { fireEvent } from "@testing-library/react";
import { useEffect } from "react";
import { ModalBody, ModalFooter, ModalProps, useModal } from "src/components/Modal";
import { ModalHeader } from "src/components/Modal/Modal";
import { OpenModal } from "src/components/Modal/OpenModal";
import { click, render } from "src/utils/rtl";

describe("Modal", () => {
  it("renders", async () => {
    // When rendered
    const r = await render(<TestModalApp content={<TestModalComponent />} />);
    // Then expect the content to match
    expect(r.modal_title.textContent).toBe("Title");
    expect(r.modal_titleClose).toBeTruthy();
    expect(r.modal_content).toBeTruthy();
  });

  it("invokes canClose", async () => {
    // Given mocked actions
    const canClose = jest.fn().mockReturnValue(false);
    const r = await render(<TestModalApp canClose={canClose} content={<TestModalComponent />} />);
    // When invoking the `onClose` in various interactions
    click(r.modal_titleClose);
    expect(canClose).toBeCalledTimes(1);
    fireEvent.keyDown(r.modal, { key: "Escape", code: "Escape" });
    expect(canClose).toBeCalledTimes(2);
  });

  describe("ModalBody", () => {
    it("renders", async () => {
      // When rendered
      const r = await render(<TestModalApp content={<TestModalComponent />} />);
      // Then expect the content to be displayed
      expect(r.modal_content.textContent).toBe("Modal Body");
    });
  });

  describe("ModalFooter", () => {
    it("renders", async () => {
      // When rendered
      const r = await render(<TestModalApp content={<TestModalComponent />} />);
      // Then expect the footer content to be displayed
      expect(r.modal_footer.textContent).toBe("Modal Footer");
    });
  });

  it("supports testing modal components on their own", async () => {
    // Given a test wants to directly render a modal component
    const r = await render(
      // And it wraps it in the OpenModal helper component
      <OpenModal>
        <TestModalComponent />
      </OpenModal>,
    );
    // Then we can assert against it
    expect(r.modal_footer.textContent).toBe("Modal Footer");
  });
});

function TestModalApp(props: ModalProps & { canClose?: () => boolean }) {
  const { openModal, addCanClose } = useModal();
  // TODO: validate this eslint-disable. It was automatically ignored as part of https://app.shortcut.com/homebound-team/story/40033/enable-react-hooks-exhaustive-deps-for-react-projects
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => openModal(props), [openModal]);
  if (props.canClose) {
    addCanClose(props.canClose);
  }
  return <h1>Page title</h1>;
}

function TestModalComponent() {
  return (
    <>
      <ModalHeader>Title</ModalHeader>
      <ModalBody>Modal Body</ModalBody>
      <ModalFooter>Modal Footer</ModalFooter>
    </>
  );
}
