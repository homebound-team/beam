import { BeamProvider } from "src/components/BeamContext";
import { Button } from "src/components/Button";
import { PageHeader } from "src/components/PageHeader";
import { Tab } from "src/components/Tabs";
import { noop } from "src/utils";
import { render, withRouter } from "src/utils/rtl";

describe("PageHeader", () => {
  beforeEach(() => {
    document.title = "";
  });

  it("renders", async () => {
    const r = await render(<PageHeader title="Test Title" />);
    expect(r.pageHeader).toBeInTheDocument();
    expect(r.pageHeader_title.textContent).toEqual("Test Title");
  });

  it("sets document.title when BeamProvider documentTitleConfig is configured", async () => {
    // Given BeamProvider with documentTitleConfig and a PageHeader
    // When rendered
    await render(
      <BeamProvider documentTitleConfig={{ env: "local", suffix: "Blueprint | Homebound" }}>
        <PageHeader title="Projects" />
      </BeamProvider>,
      { omitBeamContext: true },
    );

    // Then document.title includes the env prefix, page title, and app suffix
    expect(document.title).toBe("[LOCAL] Projects | Blueprint | Homebound");
  });

  it("includes documentTitleSuffix in document.title only", async () => {
    // Given a PageHeader with documentTitleSuffix inside BeamProvider
    const r = await render(
      <BeamProvider documentTitleConfig={{ env: "qa", suffix: "Blueprint | Homebound" }}>
        <PageHeader title="Schedule" documentTitleSuffix="123 Sesame St" />
      </BeamProvider>,
      { omitBeamContext: true },
    );

    // Then the suffix appears in document.title but not the visible heading
    expect(document.title).toBe("[QA] Schedule | 123 Sesame St | Blueprint | Homebound");
    expect(r.pageHeader_title.textContent).toBe("Schedule");
  });

  it("renders with right slot", async () => {
    const r = await render(<PageHeader title="Test Title" rightSlot={<Button label="Test Button" onClick={noop} />} />);
    expect(r.testButton).toBeInTheDocument();
  });

  it("renders with tabs", async () => {
    const tabs: Tab[] = [
      { name: "Tab A", value: "tabA" },
      { name: "Tab B", value: "tabB" },
      { name: "Tab C", value: "tabC" },
    ];
    const r = await render(
      <PageHeader
        title="Test Title"
        tabs={{
          tabs,
          selected: "tabA",
          onChange: noop,
        }}
      />,
      withRouter(),
    );
    expect(r.tabs_tabA).toBeInTheDocument();
    expect(r.tabs_tabB).toBeInTheDocument();
    expect(r.tabs_tabC).toBeInTheDocument();
  });
});
