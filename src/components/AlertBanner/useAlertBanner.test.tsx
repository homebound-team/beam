import { click, render } from "src/utils/rtl";
import { Button } from "../Button";
import { useAlertBanner } from "./useAlertBanner";

describe("useAlertBanner", () => {
  it("can trigger alert banner notice", async () => {
    // Given an app that can trigger an alert banner
    const r = await render(<TestAlertBannerComponent />);
    // When triggering the alert
    click(r.alert);
    // Then expect it to show
    expect(r.alertBanner()).toBeInTheDocument();
  });
});

function TestAlertBannerComponent() {
  const { showAlert } = useAlertBanner();
  const onClose = jest.fn();
  return <Button label="alert" onClick={() => showAlert({ message: "Test Alert", type: "error", onClose })} />;
}

// need to figure out how to close in storybook
// need to figure out black icon in info banner
