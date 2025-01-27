import { render } from "@homebound/rtl-utils";
import { StaticField } from "src/forms/StaticField";

describe("StaticField", () => {
  it("supports default test ids", async () => {
    const r = await render(<StaticField label="Foo" value="Bar" />);
    expect(r.foo).toHaveTextContent("Bar");
  });

  it("supports explicit test ids", async () => {
    const r = await render(<StaticField label="Foo" value="Bar" data-testid="zaz" />);
    expect(r.zaz).toHaveTextContent("Bar");
  });

  it("supports label style left", async () => {
    const r = await render(<StaticField label="Foo" labelStyle="left" value="Bar" />);
    expect(r.foo).toHaveTextContent("Bar");
    expect(r.foo_container).toHaveStyle({ display: "flex" });
    expect(r.foo_container).toHaveStyle({ justifyContent: "space-between" });
    expect(r.foo_container).toHaveStyle({ maxWidth: "100%" });
    expect(r.foo).toHaveStyle({ width: "50%" });
  });
});
