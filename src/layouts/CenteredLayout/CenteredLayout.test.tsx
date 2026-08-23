import { CenteredLayout } from "src/layouts/CenteredLayout/CenteredLayout";
import { beamLayoutContentPaddingXVar, pageContentPaddingXValue } from "src/layouts/layoutVars";
import { setViewport } from "src/tests/viewport";
import { render } from "src/utils/rtl";

describe("CenteredLayout", () => {
  it("caps the lg shell at 1440px and publishes md+ padding", async () => {
    // Given an lg centered layout with body content
    const r = await render(
      <CenteredLayout size="lg">
        <span>Dashboard body</span>
      </CenteredLayout>,
    );

    // Then the shell is 1440px max (1392px content + padding) and publishes padding for sticky chrome
    expect(r.centeredLayout).toHaveTextContent("Dashboard body");
    expect(r.centeredLayout).toHaveStyle({ width: "100%", maxWidth: "1440px" });
    expect(r.centeredLayout.style.getPropertyValue(beamLayoutContentPaddingXVar)).toBe(pageContentPaddingXValue);
  });

  it("publishes sm viewport padding below md", async () => {
    // Given a narrow viewport
    setViewport("sm");
    const r = await render(
      <CenteredLayout size="lg">
        <span>Dashboard body</span>
      </CenteredLayout>,
    );

    // Then layoutContainer descendants inherit the smaller inset
    expect(r.centeredLayout.style.getPropertyValue(beamLayoutContentPaddingXVar)).toBe("12px");
  });

  it("caps the sm shell at 768px", async () => {
    // Given an sm centered layout
    const r = await render(
      <CenteredLayout size="sm">
        <span>Form body</span>
      </CenteredLayout>,
    );

    // Then the shell is 768px max (720px content + padding)
    expect(r.centeredLayout).toHaveTextContent("Form body");
    expect(r.centeredLayout).toHaveStyle({ width: "100%", maxWidth: "768px" });
  });
});
