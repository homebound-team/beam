import { render } from "@homebound/rtl-utils";
import { Tag } from "src/components/Tag";
import { Css } from "src/Css";

describe("Tag", () => {
  it("renders", async () => {
    const r = await render(<Tag text="test" data-testid="testTag" />);
    expect(r.testTag.textContent).toBe("test");
  });

  it("can apply margin changes via xss", async () => {
    const r = await render(<Tag text="test" data-testid="testTag" xss={Css.mt1.$} />);
    expect(r.testTag).toHaveStyleRule("margin-top", "8px");
  });

  it("renders with icon", async () => {
    const r = await render(<Tag text="text" icon="infoCircle" />);
    const iconElement = r.container.querySelector(`[data-icon="infoCircle"]`)!;
    expect(iconElement).toBeInTheDocument();
  });
});
