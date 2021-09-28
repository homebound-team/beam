import { render } from "@homebound/rtl-utils";
import { StaticField } from "src/forms/StaticField";

describe("StaticField", () => {
  it("supports default test ids", async () => {
    const r = await render(<StaticField label="Foo" value="Bar" />);
    expect(r.foo()).toHaveTextContent("Bar");
  });

  it("supports explicit test ids", async () => {
    const r = await render(<StaticField label="Foo" value="Bar" data-testid="zaz" />);
    expect(r.zaz()).toHaveTextContent("Bar");
  });
});
