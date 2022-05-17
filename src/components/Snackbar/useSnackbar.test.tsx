import { clickAndWait } from "@homebound/rtl-utils";
import { useState } from "react";
import { Button } from "src/components/Button";
import { SnackbarProvider } from "src/components/Snackbar/SnackbarContext";
import { SnackbarNoticeProps } from "src/components/Snackbar/SnackbarNotice";
import { useSnackbar } from "src/components/Snackbar/useSnackbar";
import { Css } from "src/Css";
import { click, render, wait } from "src/utils/rtl";

describe("useSnackbar", () => {
  it("can trigger snackbar notice", async () => {
    // Given an app that can trigger snackbar notices
    const r = await render(<TestApp />);
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
    const r = await render(<TestApp persistent />);
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
    const r = await render(<TestApp persistent />);
    // When triggering the persistent notice
    click(r.triggerNotice);
    // Then expect it to show
    expect(r.snackbar()).toBeInTheDocument();

    // And when clicking the close button in the notice
    await clickAndWait(r.snackbar_close);
    // Then expect it to have closed
    expect(r.snackbar).toNotBeInTheDom();
  });
});

function TestApp(props: Partial<SnackbarNoticeProps>) {
  return (
    <SnackbarProvider>
      <TestComponent {...props} />
    </SnackbarProvider>
  );
}

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
