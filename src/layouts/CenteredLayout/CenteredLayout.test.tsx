import { CenteredLayout } from "src/layouts/CenteredLayout/CenteredLayout";
import { render } from "src/utils/rtl";

describe("CenteredLayout", () => {
  it("renders children in the lg width", async () => {
    // Given an lg centered layout with body content
    // When rendered
    const r = await render(
      <CenteredLayout size="lg">
        <span>Dashboard body</span>
      </CenteredLayout>,
    );

    // Then the children render and the outer max-width is 1440
    expect(r.centeredLayout).toHaveTextContent("Dashboard body");
    expect(r.centeredLayout).toHaveStyle({ maxWidth: "1440px" });
  });

  it("uses the sm outer max-width so content stays 720 at md+", async () => {
    // Given an sm centered layout
    // When rendered
    const r = await render(
      <CenteredLayout size="sm">
        <span>Form body</span>
      </CenteredLayout>,
    );

    // Then the outer max-width is 768 (720 content + 48 pad)
    expect(r.centeredLayout).toHaveTextContent("Form body");
    expect(r.centeredLayout).toHaveStyle({ maxWidth: "768px" });
  });
});
