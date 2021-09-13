import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { Palette } from "src/Css";
import { click, render, withRouter } from "src/utils/rtl";
import { getNextTabValue, RouteTab, Tab, TabsWithContent } from "./Tabs";
import { TabValue, TestTabContent, testTabs } from "./testData";

describe("TabsWithContent", () => {
  it("should display content of selected tab", async () => {
    const r = await render(<TestTabs />, withRouter());
    // tab panel should initially display Tab 1 Content
    expect(r.tab_panel()).toHaveTextContent("Tab 1 Content");
    // when we click on the 4th tab
    click(r.tabs_tab4);
    // then expect to see the 4th tab's content
    expect(r.tab_panel()).toHaveTextContent("Tab 4 Content");
  });

  it("should update the active tab", async () => {
    // Given we start out on tab1
    const r = await render(<TestTabs />, withRouter());
    expect(r.tabs_tab1()).toHaveStyleRule("color", Palette.LightBlue700);
    // when an external state change moves us to the 2nd tab
    click(r.goToTab2);
    // Then tab2 is now actively styled
    expect(r.tabs_tab2()).toHaveStyleRule("color", Palette.LightBlue700);
  });

  it("should reset the active tab on blur", async () => {
    // Given we start out on tab1
    const r = await render(<TestTabs />, withRouter());
    expect(r.tabs_tab1()).toHaveStyleRule("color", Palette.LightBlue700);
    // And we've moved to the 2nd tab
    fireEvent.keyUp(r.tabs_tab2(), { key: "ArrowRight" });
    expect(r.tabs_tab2()).toHaveStyleRule("color", Palette.LightBlue700);
    // When we blur away
    fireEvent.blur(r.tabs_tab1());
    // Then the 1st tab goes back to highlighted
    expect(r.tabs_tab1()).toHaveStyleRule("color", Palette.LightBlue700);
  });

  it("cannot click on disabled tabs", async () => {
    // Given we start out on tab1
    const r = await render(<TestTabs />, withRouter());
    expect(r.tabs_tab1()).toHaveStyleRule("color", Palette.LightBlue700);
    // And we try to click on the 3rd disabled tab
    click(r.tabs_tab3);
    // Then nothing happens
    expect(r.tabs_tab1()).toHaveStyleRule("color", Palette.LightBlue700);
  });

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

  it("hides the tabs if only a single tab is enabled", async () => {
    // Given only the 1st tab is enabled
    const testTabs: Tab<TabValue>[] = [
      { name: "Tab 1", value: "tab1", render: () => <TestTabContent content="Tab 1 Content" /> },
      { name: "Tab 2", value: "tab2", disabled: true, render: () => <TestTabContent content="Tab 2 Content" /> },
      { name: "Tab 3", value: "tab3", disabled: true, render: () => <TestTabContent content="Tab 3 Content" /> },
      { name: "Tab 4", value: "tab4", disabled: true, render: () => <TestTabContent content="Tab 4 Content" /> },
    ];
    const r = await render(<TabsWithContent tabs={testTabs} onChange={() => {}} selected="tab1" />, withRouter());
    // Then the tabs are not even in the dom
    expect(() => r.tabs_tab1()).toThrow("Unable to find an element");
    // But the selected tab's content is shown
    expect(r.tab_panel().textContent).toBe("Tab 1 Content");
  });

  it("renders tabs as links", async () => {
    const router = withRouter("/tab1");
    // Given tabs with `path` values
    const testTabs: RouteTab<string>[] = [
      { name: "Tab 1", path: "/tab1", value: "/tab1", render: () => <TestTabContent content="Tab 1 Content" /> },
      { name: "Tab 2", path: "/tab2", value: "/tab2", render: () => <TestTabContent content="Tab 2 Content" /> },
    ];
    const r = await render(<TabsWithContent tabs={testTabs} />, router);

    // Then the tab elements are links with expected `href` values
    expect(r.tabs_tab1().tagName).toBe("A");
    expect(r.tabs_tab1()).toHaveAttribute("href", "/tab1");
    expect(r.tabs_tab2().tagName).toBe("A");
    expect(r.tabs_tab2()).toHaveAttribute("href", "/tab2");
  });

  it("can match tab based on multiple paths", async () => {
    // Given a route
    const router = withRouter("/ce:1", "/:ceId");
    // And a tab that supports multiple routes
    const testTabs: RouteTab<string>[] = [
      {
        name: "Tab 1",
        path: "/:ceId/line-items",
        value: "/ce:1/line-items",
        render: () => <TestTabContent content="Tab 1 Content" />,
      },
      {
        name: "Tab 2",
        path: ["/:ceId", "/:ceId/overview"],
        value: "/ce:1/overview",
        render: () => <TestTabContent content="Tab 2 Content" />,
      },
    ];
    const r = await render(<TabsWithContent tabs={testTabs} />, router);

    // Then expect the second tab to be active
    expect(r.tab_panel().textContent).toBe("Tab 2 Content");
  });

  it("can navigate between tabs when rendered as links", async () => {
    // Given Route-able tabs, rendered at the first tab's route
    const router = withRouter("/tab1", "/");
    const testTabs: RouteTab<string>[] = [
      { name: "Tab 1", path: "/tab1", value: "/tab1", render: () => <TestTabContent content="Tab 1 Content" /> },
      { name: "Tab 2", path: "/tab2", value: "/tab2", render: () => <TestTabContent content="Tab 2 Content" /> },
    ];
    const r = await render(<TabsWithContent tabs={testTabs} />, router);

    // Then expect the first tab to be active
    expect(r.tab_panel().textContent).toBe("Tab 1 Content");

    // When clicking the second tab
    click(r.tabs_tab2);

    // Then expect the URL to be updated and the tab panel to show the selected tab's content
    expect(router.history.location.pathname).toBe("/tab2");
    expect(r.tab_panel().textContent).toBe("Tab 2 Content");
  });
});

function TestTabs() {
  const [selectedTab, setSelectedTab] = useState(testTabs[0].value);
  return (
    <div>
      <TabsWithContent tabs={testTabs} onChange={setSelectedTab} selected={selectedTab} />
      <button data-testid="goToTab2" onClick={() => setSelectedTab("tab2")} />
    </div>
  );
}
