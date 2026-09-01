import { Button } from "src/components/Button";
import { PageHeader } from "src/components/Headers/PageHeader";
import { Tab } from "src/components/Tabs";
import { setViewport } from "src/tests/viewport";
import { noop } from "src/utils";
import { click, render, withRouter } from "src/utils/rtl";

describe("PageHeader", () => {
  it("renders with tabs", async () => {
    // Given a PageHeader with tabs
    const tabs: Tab[] = [
      { name: "Tab A", value: "tabA" },
      { name: "Tab B", value: "tabB" },
      { name: "Tab C", value: "tabC" },
    ];
    // When rendered
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
    // Then each tab is shown, nested under the header's tabs test id
    expect(r.header_tabs_tabA).toBeInTheDocument();
    expect(r.header_tabs_tabB).toBeInTheDocument();
    expect(r.header_tabs_tabC).toBeInTheDocument();
  });

  it("renders actions as buttons on desktop", async () => {
    // Given a PageHeader with two actions
    const r = await render(
      <PageHeader
        title="Documents"
        actions={[
          { label: "Upload", onClick: noop },
          { kind: "icon", icon: "refresh", label: "Refresh", onClick: noop },
        ]}
      />,
    );
    // Then both render as buttons
    expect(r.upload).toBeInTheDocument();
    expect(r.refresh).toBeInTheDocument();
  });

  it("collapses two or more actions into a ButtonMenu at sm", async () => {
    // Given a mobile viewport and two actions
    setViewport("sm");
    const r = await render(
      <PageHeader
        title="Documents"
        actions={[
          { label: "Upload", onClick: noop },
          { kind: "icon", icon: "refresh", label: "Refresh", onClick: noop },
        ]}
      />,
      withRouter(),
    );
    // Then the kebab is shown instead of the individual buttons
    expect(r.verticalDots).toBeInTheDocument();
    expect(r.query.upload).toBeNull();
    click(r.verticalDots);
    expect(r.verticalDots_upload).toBeInTheDocument();
    expect(r.verticalDots_refresh).toBeInTheDocument();
  });

  it("keeps a single action as a button at sm", async () => {
    // Given a mobile viewport and one action
    setViewport("sm");
    const r = await render(<PageHeader title="Documents" actions={[{ label: "Upload", onClick: noop }]} />);
    // Then it stays a button
    expect(r.upload).toBeInTheDocument();
    expect(r.query.verticalDots).toBeNull();
  });

  it("still renders rightSlot at sm", async () => {
    // Given a mobile viewport, actions, and a rightSlot
    setViewport("sm");
    const r = await render(
      <PageHeader
        title="Documents"
        actions={[
          { label: "Upload", onClick: noop },
          { label: "Export", onClick: noop },
        ]}
        rightSlot={<Button label="Custom" onClick={noop} />}
      />,
      withRouter(),
    );
    // Then rightSlot is still shown next to the collapsed actions
    expect(r.custom).toBeInTheDocument();
    expect(r.verticalDots).toBeInTheDocument();
  });
});
