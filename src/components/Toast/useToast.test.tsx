import { clickAndWait } from "@homebound/rtl-utils";
import { useState } from "react";
import { click, render } from "src/utils/rtl";
import { Button } from "../Button";
import { useToast } from "./useToast";

describe("useToast", () => {
  it("can trigger toast notice", async () => {
    // Given an app that can trigger a toast
    const r = await render(<TestToastComponent />);
    // When triggering the toast
    click(r.toast);
    // Then expect it to show
    expect(r.toast()).toBeInTheDocument();
  });

  it("can close a toast notice", async () => {
    // Given an app that can trigger a toast
    const r = await render(<TestToastComponent />);
    // When triggering the toast and clicking on the close button
    click(r.toast);
    await clickAndWait(r.toast_close());
    // Then expect it to be closed
    expect(r.toast()).toNotBeInTheDom();
  });
});

function TestToastComponent() {
  const { showToast } = useToast();
  const showToastOnClick = () => {
    showToast({ message: "Test Toast", type: "error", onClose: () => setNoticeOpen(false) });
    setNoticeOpen(true);
  };
  const [noticeOpen, setNoticeOpen] = useState(true);

  return <Button label="toastButton" onClick={showToastOnClick} />;
}
