import { Button } from "src/components/Button";
import { PageHeader } from "src/components/PageHeader";
import { Tab } from "src/components/Tabs";
import { noop } from "src/utils";
import { render, withRouter } from "src/utils/rtl";

describe("PageHeader", () => {
  it("renders", async () => {
    const r = await render(<PageHeader title="Test Title" />);
    expect(r.pageHeader).toBeInTheDocument();
    expect(r.pageHeader_title.textContent).toEqual("Test Title");
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
