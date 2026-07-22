import { PageHeader } from "src/components/Headers/PageHeader";
import { Tab } from "src/components/Tabs";
import { noop } from "src/utils";
import { render, withRouter } from "src/utils/rtl";

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
});
