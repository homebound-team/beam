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
    expect(r.testTag).toHaveStyle({ marginTop: "calc(var(--t-spacing) * 1)" });
  });

  it("renders with icon", async () => {
    const r = await render(<Tag text="text" icon="infoCircle" />);
    const iconElement = r.container.querySelector(`[data-icon="infoCircle"]`)!;
    expect(iconElement).toBeInTheDocument();
  });

  it("iconOnly keeps accessible text", async () => {
    // Given an icon-only tag with descriptive text
    const r = await render(<Tag text="Information" icon="infoCircle" iconOnly data-testid="tag" />);

    // Then the text remains in the document for screen readers
    expect(r.getByText("Information")).toBeInTheDocument();
    expect(r.container.querySelector(`[data-icon="infoCircle"]`)).toBeInTheDocument();
  });

  it("iconOnly shows text as tooltip", async () => {
    // Given an icon-only tag
    const r = await render(<Tag text="Information" icon="infoCircle" iconOnly data-testid="tag" />);

    // Then the hidden text is surfaced as a hover tooltip
    expect(r.tag.closest("[data-testid='tooltip']")).toHaveAttribute("title", "Information");
  });

  it("iconOnly respects preventTooltip", async () => {
    // Given an icon-only tag that opts out of tooltips
    const r = await render(<Tag text="Information" icon="infoCircle" iconOnly preventTooltip data-testid="tag" />);

    // Then no tooltip wrapper is rendered
    expect(r.query.tooltip).toBeNull();
  });

  it("secondary variant does not uppercase text", async () => {
    // Given a secondary tag
    const r = await render(<Tag text="Secondary Label" variant="secondary" data-testid="tag" />);

    // Then text is not transformed to uppercase
    expect(r.tag).not.toHaveStyle({ textTransform: "uppercase" });
  });
});
