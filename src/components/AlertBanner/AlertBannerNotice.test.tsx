// Test cases

import { noop } from "src/utils";
import { click, render } from "src/utils/rtl";
import { AlertBannerNotice } from "./AlertBannerNotice";

describe("AlertBannerNotice", () => {
  it("renders the default AlertBanner notice layout", async () => {
    // Given an Alert Banner Notice component
    const r = await render(<AlertBannerNotice type={"error"} message={"Error"} onClose={noop} />);
    // Then expect the default properties to exist in the layout
    expect(r.alertBanner_type()).toBeInTheDocument();
    expect(r.alertBanner_message()).toBeInTheDocument();
    expect(r.alertBanner_close()).toBeInTheDocument();
  });

  it("fires onClose callback", async () => {
    // Given an Alert Banner Notice component
    const onClose = jest.fn();
    const r = await render(<AlertBannerNotice type={"error"} message={"Error"} onClose={onClose} />);
    // When clicking the x button to close the alert
    click(r.alertBanner_close);
    // Then expect the onClose callback to have been called
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
