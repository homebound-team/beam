import { fireEvent } from "@testing-library/react";
import { ReactNode, useEffect } from "react";
import { ModalContent, ModalContentProps, ModalProps, useModalContext } from "src/components/Modal";
import { noop } from "src/utils";
import { click, render, withModalRTL } from "src/utils/rtl";

describe("Modal", () => {
  it("renders", async () => {
    // Given modal props
    const contentProps = { primaryAction: { label: "Primary", onClick: noop } };
    // When rendered
    const r = await render(<TestModalApp modalProps={{}} contentProps={contentProps} />, withModalRTL);

    // Then expect the content to match
    expect(r.modal_title().textContent).toBe("Test title");
    expect(r.modal_content().textContent).toBe("Modal Content");
    expect(r.modal_primaryAction().textContent).toBe("Primary");
    expect(r.modal_secondaryAction().textContent).toBe("Cancel");
  });

  it("invokes actions", async () => {
    // Given mocked actions
    const onClose = jest.fn();
    const onPrimaryAction = jest.fn();
    const onLeftAction = jest.fn();
    const contentProps = {
      primaryAction: { label: "Primary", onClick: onPrimaryAction },
      leftAction: { label: "Left", onClick: onLeftAction },
    };

    const r = await render(<TestModalApp modalProps={{ onClose }} contentProps={contentProps} />, withModalRTL);

    // When clicking the actions
    click(r.modal_primaryAction);
    // Expect them to be call
    expect(onPrimaryAction).toBeCalledTimes(1);
    click(r.modal_leftAction);
    expect(onLeftAction).toBeCalledTimes(1);

    click(r.modal_secondaryAction);
    expect(onClose).toBeCalledTimes(1);
    click(r.modal_titleClose);
    expect(onClose).toBeCalledTimes(2);
    fireEvent.keyDown(r.modal(), { key: "Escape", code: "Escape" });
    expect(onClose).toBeCalledTimes(3);
  });

  it("can override secondary actions", async () => {
    // Given a custom Secondary Action
    const onClose = jest.fn();
    const onSecondaryAction = jest.fn();
    const contentProps = {
      primaryAction: { label: "Primary", onClick: noop },
      secondaryAction: { label: "Secondary", onClick: onSecondaryAction },
    };

    // When rendered
    const r = await render(<TestModalApp modalProps={{ onClose }} contentProps={contentProps} />, withModalRTL);

    // Then the secondary action's text should match the override
    expect(r.modal_secondaryAction().textContent).toBe("Secondary");

    // And when clicking the action
    click(r.modal_secondaryAction);
    // Then the override action should be invoked
    expect(onSecondaryAction).toBeCalledTimes(1);
    // And `onClose` is not invoked
    expect(onClose).not.toBeCalled();
  });

  it("can set the primary and left actions as disabled", async () => {
    // Given the primary and left actions defined as disabled
    const contentProps = {
      primaryAction: { label: "Primary", onClick: noop, disabled: true },
      leftAction: { label: "Left", onClick: noop, disabled: true },
    };

    // When rendered
    const r = await render(<TestModalApp modalProps={{}} contentProps={contentProps} />, withModalRTL);

    // Then expect both buttons to be disabled
    expect(r.modal_primaryAction()).toBeDisabled();
    expect(r.modal_leftAction()).toBeDisabled();
  });

  it("can show the primary button only", async () => {
    // Given the primary only option as true
    const contentProps = {
      primaryAction: { label: "Primary", onClick: noop },
      primaryOnly: true,
    };

    // When rendered
    const r = await render(<TestModalApp modalProps={{}} contentProps={contentProps} />, withModalRTL);

    // Then expect only the secondary button is now displayed
    expect(r.queryByTestId("modal_secondaryAction")).toBeFalsy();
  });
});

function TestModalApp({
  modalProps,
  contentProps,
}: {
  modalProps: Omit<ModalProps, "content" | "title"> & { title?: string };
  contentProps: Omit<ModalContentProps, "children"> & { children?: ReactNode };
}) {
  const { openModal } = useModalContext();
  useEffect(() => {
    openModal({
      ...{ title: "Test title", ...modalProps },
      content: <ModalContent children="Modal Content" {...contentProps} />,
    });
  }, []);

  return <h1>Page title</h1>;
}
