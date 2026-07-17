import { act } from "@testing-library/react";
import { createContext, useContext, useEffect } from "react";
import { useBeamContext } from "src/components/BeamContext";
import { ModalProps } from "src/components/Modal/Modal";
import { useModal, UseModalHook } from "src/components/Modal/useModal";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("useModal", () => {
  it("can open and close the modal", async () => {
    // Given a ModalContext
    let context: UseModalHook;
    const modalProps = { title: "Test", content: <div>Test</div> };

    function TestApp() {
      context = useModal();
      return <div>{context.portal}</div>;
    }

    // When rendering a component without a modal defined
    const r = await render(<TestApp />);

    // Then expect no modal to exist
    expect(r.queryByTestId("modal")).toBeFalsy();

    // When opening the modal via the context method
    act(() => context!.openModal(modalProps));
    // Then expect modal to open
    expect(r.modal).toBeTruthy();

    // When closing the modal via the context method
    act(() => context!.closeModal());
    // Then expect the modal to close
    expect(r.queryByTestId("modal")).toBeFalsy();
  });

  it("can provide a custom canClose method", async () => {
    function TestApp(props: ModalProps) {
      const { openModal, portal } = useModal();
      // TODO: validate this eslint-disable. It was automatically ignored as part of https://app.shortcut.com/homebound-team/story/40033/enable-react-hooks-exhaustive-deps-for-react-projects
      // eslint-disable-next-line react-hooks/exhaustive-deps
      useEffect(() => openModal(props), []);
      return <div>App{portal}</div>;
    }

    // Given a modal that sets a custom `canClose` method
    function TestModalContent({ canClose }: { canClose: () => boolean }) {
      const { addCanClose } = useModal();
      addCanClose(canClose);
      return <div>Content</div>;
    }
    const canClose = vi.fn().mockReturnValue(false);
    const modalProps = { title: "Test", content: <TestModalContent canClose={canClose as any} /> };

    const r = await render(<TestApp {...modalProps} />);

    // When clicking the close button
    click(r.modal_titleClose);
    // Then expect the custom method to be called.
    expect(canClose).toBeCalled();
    // And the modal should not have closed since the canClose check is false.
    expect(r.modal).toBeTruthy();
  });

  it("can close modal when checks pass", async () => {
    function TestApp(props: ModalProps) {
      const { openModal, portal } = useModal();
      // TODO: validate this eslint-disable. It was automatically ignored as part of https://app.shortcut.com/homebound-team/story/40033/enable-react-hooks-exhaustive-deps-for-react-projects
      // eslint-disable-next-line react-hooks/exhaustive-deps
      useEffect(() => openModal(props), []);
      return <div>App{portal}</div>;
    }

    // Given a modal that sets a custom `canClose` method
    function TestModalContent({ canClose }: { canClose: () => boolean }) {
      const { addCanClose } = useModal();
      addCanClose(canClose);
      return <div>Content</div>;
    }
    const canClose = vi.fn().mockReturnValue(true);
    const onClose = vi.fn();
    const modalProps = { title: "Test", content: <TestModalContent canClose={canClose as any} />, onClose };

    const r = await render(<TestApp {...modalProps} />);

    // When clicking the close button
    click(r.modal_titleClose);
    // Then expect the custom method to be called.
    expect(canClose).toBeCalled();
    // And the modal should have closed since the canClose check is true.
    expect(onClose).toBeCalledTimes(1);
    expect(r.queryByTestId("modal")).toBeFalsy();
  });

  it("can identify when component is In Modal", async () => {
    // Given a test app that opens a modal with content that checks if it is in a modal
    function TestApp(props: ModalProps) {
      const { openModal, inModal, portal } = useModal();
      useEffect(() => openModal(props), [openModal, props]);
      return (
        <div data-testid="testApp">
          Behind Modal: InModal? {String(inModal)}
          {portal}
        </div>
      );
    }

    // And a modal content that checks if it is in a modal also
    function TestModalContent() {
      const { inModal } = useModal();
      return <div data-testid="modalContent">Modal Content: InModal? {String(inModal)}</div>;
    }

    // When rendering the test app
    const r = await render(<TestApp content={<TestModalContent />} />);

    // Then the test app should not be in a modal
    expect(r.testApp).toHaveTextContent("Behind Modal: InModal? false");
    // And the modal content should be in a modal
    expect(r.modalContent).toHaveTextContent("Modal Content: InModal? true");
  });

  it("no-ops openModal with a dev error when portal is not rendered", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    let context: UseModalHook;

    function TestApp() {
      context = useModal();
      // Intentionally omit portal
      return <div data-testid="app">App</div>;
    }

    const r = await render(<TestApp />);
    act(() => context!.openModal({ content: <div>Should not show</div> }));

    expect(r.queryByTestId("modal")).toBeFalsy();
    expect(error).toHaveBeenCalledWith(expect.stringContaining("modal.portal"));
    error.mockRestore();
  });

  it("mounts modal content under the caller so it sees caller-only providers", async () => {
    const CallerContext = createContext("missing");

    function TestApp() {
      const { openModal, portal } = useModal();
      useEffect(() => {
        openModal({ content: <ModalReadsCallerContext /> });
      }, [openModal]);
      return (
        <CallerContext.Provider value="from-caller">
          <div data-testid="app">App{portal}</div>
        </CallerContext.Provider>
      );
    }

    function ModalReadsCallerContext() {
      const value = useContext(CallerContext);
      return <div data-testid="modalContextValue">{value}</div>;
    }

    const r = await render(<TestApp />);
    expect(r.modalContextValue).toHaveTextContent("from-caller");
  });

  it("replaces the first modal when a second opens", async () => {
    let first: UseModalHook;
    let second: UseModalHook;

    function TestApp() {
      first = useModal();
      second = useModal();
      return (
        <div>
          {first.portal}
          {second.portal}
        </div>
      );
    }

    const r = await render(<TestApp />);
    act(() => first!.openModal({ content: <div data-testid="firstModal">First</div> }));
    expect(r.firstModal).toBeTruthy();

    act(() => second!.openModal({ content: <div data-testid="secondModal">Second</div> }));
    expect(r.queryByTestId("firstModal")).toBeFalsy();
    expect(r.secondModal).toBeTruthy();
  });

  it("closes cleanly when the caller unmounts while open", async () => {
    const onClose = vi.fn();

    function Host({ open }: { open: boolean }) {
      if (!open) return <div data-testid="closed">closed</div>;
      return <Caller onClose={onClose} />;
    }

    function Caller({ onClose }: { onClose: () => void }) {
      const { openModal, portal } = useModal();
      useEffect(() => {
        openModal({ content: <div data-testid="modalBody">Body</div>, onClose });
      }, [openModal, onClose]);
      return <div data-testid="caller">{portal}</div>;
    }

    const r = await render(<Host open />);
    expect(r.modalBody).toBeTruthy();

    r.rerender(<Host open={false} />);
    expect(r.queryByTestId("modal")).toBeFalsy();
    expect(r.queryByTestId("modalBody")).toBeFalsy();
    expect(onClose).toHaveBeenCalled();
  });

  it("does not mount a sibling Modal from BeamProvider modalState", async () => {
    // BeamContext no longer exposes modalState; opening via useModal only paints through the call-site portal.
    function TestApp() {
      const { openModal, portal } = useModal();
      const beam = useBeamContext();
      useEffect(() => {
        openModal({ content: <div data-testid="viaPortal">via portal</div> });
      }, [openModal]);
      return (
        <div data-testid="app">
          {"modalState" in beam ? "has-modalState" : "no-modalState"}
          {portal}
        </div>
      );
    }

    const r = await render(<TestApp />);
    expect(r.app).toHaveTextContent("no-modalState");
    expect(r.viaPortal).toBeTruthy();
  });
});
