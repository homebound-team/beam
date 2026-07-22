import { BeamProvider } from "src/components/BeamContext";
import { Button } from "src/components/Button";
import { BaseHeader } from "src/components/Headers/BaseHeader";
import { noop } from "src/utils";
import { render } from "src/utils/rtl";

describe("BaseHeader", () => {
  beforeEach(() => {
    document.title = "";
  });

  it("renders", async () => {
    // Given a BaseHeader with a title
    // When rendered
    const r = await render(<BaseHeader title="Test Title" />);
    // Then the header and its title are shown
    expect(r.header).toBeInTheDocument();
    expect(r.header_title.textContent).toEqual("Test Title");
  });

  it("sets document.title when BeamProvider documentTitleConfig is configured", async () => {
    // Given BeamProvider with documentTitleConfig and a BaseHeader
    // When rendered
    await render(
      <BeamProvider documentTitleConfig={{ env: "local", suffix: "Blueprint | Homebound" }}>
        <BaseHeader title="Projects" />
      </BeamProvider>,
      { omitBeamContext: true },
    );

    // Then document.title includes the env prefix, page title, and app suffix
    expect(document.title).toBe("[LOCAL] Projects | Blueprint | Homebound");
  });

  it("includes documentTitleSuffix in document.title only", async () => {
    // Given a BaseHeader with documentTitleSuffix inside BeamProvider
    const r = await render(
      <BeamProvider documentTitleConfig={{ env: "qa", suffix: "Blueprint | Homebound" }}>
        <BaseHeader title="Schedule" documentTitleSuffix="123 Sesame St" />
      </BeamProvider>,
      { omitBeamContext: true },
    );

    // Then the suffix appears in document.title but not the visible heading
    expect(document.title).toBe("[QA] Schedule | 123 Sesame St | Blueprint | Homebound");
    expect(r.header_title.textContent).toBe("Schedule");
  });

  it("renders with right slot", async () => {
    // Given a BaseHeader with rightSlot content
    // When rendered
    const r = await render(<BaseHeader title="Test Title" rightSlot={<Button label="Test Button" onClick={noop} />} />);
    // Then the right slot content is shown
    expect(r.testButton).toBeInTheDocument();
  });

  it("renders breadcrumbs when provided", async () => {
    // Given a BaseHeader with breadcrumbs
    // When rendered
    const r = await render(
      <BaseHeader
        title="Test Title"
        breadcrumbs={{
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "Projects", href: "/projects" },
          ],
        }}
      />,
      {},
    );
    // Then the breadcrumbs are shown
    expect(r.breadcrumb_link_0.textContent).toEqual("Home");
    expect(r.breadcrumb_link_1.textContent).toEqual("Projects");
  });

  it("renders bottom slot content", async () => {
    // Given a BaseHeader with bottomSlot content
    // When rendered
    const r = await render(<BaseHeader title="Test Title" bottomSlot={<div data-testid="customBottomSlot" />} />);
    // Then the bottom slot content is shown
    expect(r.customBottomSlot).toBeInTheDocument();
  });
});
