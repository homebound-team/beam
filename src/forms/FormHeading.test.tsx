import { render } from "@homebound/rtl-utils";
import { FormHeading } from "src/forms/FormHeading";

describe("FormHeading", () => {
  it("has a test id", async () => {
    const r = await render(<FormHeading title="Details" data-testid="details" />);
    expect(r.details).toHaveTextContent("Details");
  });
});
