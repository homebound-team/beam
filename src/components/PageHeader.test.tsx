import { BeamProvider } from "src/components/BeamContext";
import { Button } from "src/components/Button";
import { PageHeader } from "src/components/PageHeader";
import { StepperTabsStep } from "src/components/StepperTabs/StepperTabs";
import { Tab } from "src/components/Tabs";
import { noop } from "src/utils";
import { click, render, withRouter } from "src/utils/rtl";
import { vi } from "vitest";

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

  it("renders breadcrumbs when provided", async () => {
    const r = await render(
      <PageHeader
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
    expect(r.breadcrumb_link_0.textContent).toEqual("Home");
    expect(r.breadcrumb_link_1.textContent).toEqual("Projects");
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

  it("renders with stepperTabs", async () => {
    const steps: StepperTabsStep[] = [
      { label: "Step A", value: "stepA", completed: false },
      { label: "Step B", value: "stepB", completed: false },
    ];
    const onChange = vi.fn();
    const r = await render(<PageHeader title="Test Title" stepperTabs={{ steps, currentStep: "stepA", onChange }} />);

    expect(r.stepperTabs_tab_stepA).toBeInTheDocument();
    expect(r.stepperTabs_tab_stepB).toBeInTheDocument();

    click(r.stepperTabs_tab_stepB);
    expect(onChange).toHaveBeenCalledWith("stepB");
  });
});
