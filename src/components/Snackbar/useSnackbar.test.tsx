import { clickAndWait } from "@homebound/rtl-utils";
import { useState } from "react";
import { Button } from "src/components/Button";
import { SnackbarNoticeProps } from "src/components/Snackbar/SnackbarNotice";
import { useSnackbar } from "src/components/Snackbar/useSnackbar";
import { Css } from "src/Css";
import { click, render, wait } from "src/utils/rtl";

describe("useSnackbar", () => {
  it("can trigger snackbar notice", async () => {
    // Given an app that can trigger snackbar notices
    const r = await render(<TestComponent />);
    // When triggering the notice
    click(r.triggerNotice);
    // Then expect it to show
    expect(r.snackbar()).toBeInTheDocument();

    // And when waiting for the timeout
    await wait();
    // Then expect it to automatically close
    expect(r.snackbar).toNotBeInTheDom();
  });

  it("can close via 'closeNotice' method", async () => {
    // Given an app that can trigger snackbar notices
    const r = await render(<TestComponent persistent />);
    // When triggering the persistent notice
    click(r.triggerNotice);
    // Then expect it to show
    expect(r.snackbar()).toBeInTheDocument();

    // And when waiting for the timeout, which shouldn't have bene set
    await wait();
    // Then expect it to still be in the DOM.
    expect(r.snackbar()).toBeInTheDocument();

    // And when clicking the button to close the notice
    await clickAndWait(r.closeNotice);
    // Then expect it to have closed
    expect(r.snackbar).toNotBeInTheDom();
  });

  it("can close via 'onClose' callback", async () => {
    // Given an app that can trigger snackbar notices
    const r = await render(<TestComponent persistent />);
    // When triggering the persistent notice
    click(r.triggerNotice);
    // Then expect it to show
    expect(r.snackbar()).toBeInTheDocument();

    // And when clicking the close button in the notice
    await clickAndWait(r.snackbar_close);
    // Then expect it to have closed
    expect(r.snackbar).toNotBeInTheDom();
  });

  it("can use an offset", async () => {
    // Given a component with a 200 offset
    const r = await render(<TestComponentWithOffset bottom={200} />);

    // When a notification spawns
    click(r.notify);
    // Then it's offset by 200px
    expect(r.snackbarWrapper()).toHaveStyleRule("bottom", "200px");

    // When its value changes to undefined
    r.rerender(<TestComponentWithOffset />);

    // When a notification spawns
    click(r.notify);

    // Then it reverted to a default offset
    expect(r.snackbarWrapper()).toHaveStyleRule("bottom", "24px");
  });

  it("reverts offset when dismounting", async () => {
    // Given a component with a 200 offset
    const r = await render(
      <>
        <TestComponent />
        <TestComponentWithOffset bottom={200} />
      </>,
    );

    // When we trigger a notice
    click(r.triggerNotice);
    // Then the offset is 200
    expect(r.snackbarWrapper()).toHaveStyle("bottom: 200px");

    // When we drop the offset-caller from the DOM
    r.rerender(<TestComponent />);

    // Then snackbar reverts to a default offset
    expect(r.snackbarWrapper()).toHaveStyleRule("bottom", "24px");
  });
});

function TestComponent(props: Partial<SnackbarNoticeProps>) {
  const { triggerNotice, closeNotice } = useSnackbar();
  const [noticeOpen, setNoticeOpen] = useState(false);
  const noticeId = "customId";

  const triggerOnClick = () => {
    triggerNotice({
      id: noticeId,
      message: "Test Message",
      ...props,
      onClose: () => setNoticeOpen(false),
    });
    setNoticeOpen(true);
  };

  const closeOnClick = () => {
    closeNotice(noticeId);
    setNoticeOpen(false);
  };

  return (
    <div css={Css.df.gap2.$}>
      <Button onClick={triggerOnClick} label="Trigger notice" disabled={noticeOpen} />
      <Button variant="secondary" onClick={closeOnClick} label="Close notice" disabled={!noticeOpen} />
    </div>
  );
}

function TestComponentWithOffset({ bottom }: { bottom?: number }) {
  const { useSnackbarOffset, triggerNotice } = useSnackbar();
  useSnackbarOffset({ bottom });

  return <Button label="notify" onClick={() => triggerNotice({ message: "Test post please ignore" })} />;
}
