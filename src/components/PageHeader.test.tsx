import { render } from "@homebound/rtl-utils";
import { Button } from "src/components/Button";
import { PageHeader } from "src/components/PageHeader";
import { noop } from "src/utils";

describe("PageHeader", () => {
  it("renders", async () => {
    const r = await render(<PageHeader title="Test Title" />);
    expect(r.pageHeader).toBeInTheDocument();
    expect(r.pageHeader_title.textContent).toEqual("Test Title");
  });

  it("renders with right slot", async () => {
    const r = await render(<PageHeader title="Test Title" rightSlot={<Button label="Test Button" onClick={noop} />} />);
    expect(r.testButton).toBeInTheDocument();
  });
});
