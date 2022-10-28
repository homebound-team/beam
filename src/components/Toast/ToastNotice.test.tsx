import { noop } from "src/utils";
import { click, render } from "src/utils/rtl";
import { ToastNotice } from "./ToastNotice";

describe("ToastNotice", () => {
  it("renders the default Toast notice layout", async () => {
    // Given a Toast Notice component
    const r = await render(<ToastNotice type={"error"} message={"Error"} onClose={noop} />);
    // Then expect the default properties to exist in the layout
    expect(r.toast_type()).toBeInTheDocument();
    expect(r.toast_message()).toBeInTheDocument();
    expect(r.toast_close()).toBeInTheDocument();
  });

  it("fires onClose callback", async () => {
    // Given a Toast Notice component
    const onClose = jest.fn();
    const r = await render(<ToastNotice type={"error"} message={"Error"} onClose={onClose} />);
    // When clicking the x button to close the toast
    click(r.toast_close);
    // Then expect the onClose callback to have been called
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
