import { Icon } from "src/components/Icon";
import { render } from "src/utils/rtl";

describe("Icon", () => {
  it("scopes its tooltip to the icon name", async () => {
    // Given an icon with a tooltip
    // When rendered without an explicit prefix
    const r = await render(<Icon icon="infoCircle" tooltip="Product details" />);
    // Then the tooltip uses the icon-derived prefix
    expect(r.infoCircle_tooltip).toHaveAttribute("title", "Product details");
  });

  it("scopes its tooltip to a forwarded test id", async () => {
    // Given an icon with an explicit prefix
    // When rendered with a tooltip
    const r = await render(<Icon icon="infoCircle" tooltip="Product details" data-testid="productInfo" />);
    // Then the tooltip uses that prefix instead of the icon name
    expect(r.productInfo_tooltip).toHaveAttribute("title", "Product details");
  });
});
