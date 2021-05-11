import { useState } from "react";
import { click, render } from "src/utils/rtl";
import { getNextTabValue, TabsWithContent } from "./Tabs";
import { testTabs } from "./testData";

describe("getNextTabValue function", () => {
  it("should skip disabled tabs when clicking right arrow key", () => {
    const currentTabValue = "tab2";
    const nextTabValue = getNextTabValue(currentTabValue, "ArrowRight", testTabs);

    expect(nextTabValue).toBe("tab4");
  });

  it("should skip disabled tabs when clicking left arrow key", () => {
    const currentTabValue = "tab4";
    const nextTabValue = getNextTabValue(currentTabValue, "ArrowLeft", testTabs);

    expect(nextTabValue).toBe("tab2");
  });

  it("should go to first tab when clicking right arrow key from last tab", () => {
    const currentTabValue = "tab4";
    const nextTabValue = getNextTabValue(currentTabValue, "ArrowRight", testTabs);

    expect(nextTabValue).toBe("tab1");
  });

  it("should go to last tab when clicking left arrow key from first tab", () => {
    const currentTabValue = "tab1";
    const nextTabValue = getNextTabValue(currentTabValue, "ArrowLeft", testTabs);

    expect(nextTabValue).toBe("tab4");
  });
});

describe("TabsWithContent", () => {
  it("should display content of selected tab", async () => {
    const r = await render(<TestTabs />);
    // tab panel should initially display Tab 1 Content
    expect(r.getByRole("tabpanel")).toHaveTextContent("Tab 1 Content");
    // when we click on tab index 2
    click(r.getByTestId("tabs_2"));
    // then expect to see the content for tab index 2 ("Tab 3 Content")
    expect(r.getByRole("tabpanel")).toHaveTextContent("Tab 3 Content");
  });
});

function TestTabs() {
  const [selectedTab, setSelectedTab] = useState(testTabs[0].value);
  return <TabsWithContent tabs={testTabs} onChange={setSelectedTab} selected={selectedTab} />;
}
