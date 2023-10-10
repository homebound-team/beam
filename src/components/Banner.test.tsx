import { Banner } from "src";
import { click, render } from "src/utils/rtl";

describe(Banner, () => {
  it("should render", async () => {
    // Given the Banner with a message and no onClose callback
    const r = await render(<Banner type="warning" message="Banner message" />);
    // Then the banner should be visible
    expect(r.banner_message).toHaveTextContent("Banner message");
    // And there should be no close button
    expect(r.query.banner_close).not.toBeInTheDocument();
  });

  it("should trigger onClose", async () => {
    const onClose = jest.fn();
    // Given the Banner with a message and an onClose callback
    const r = await render(<Banner type="warning" message="Banner message" onClose={onClose} />);
    // When clicking on the close button
    click(r.banner_close);
    // Then the onClose callback should be called
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
