import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { Palette } from "src/Css";
import { click, render } from "src/utils/rtl";
import { getNextTabValue, TabsWithContent } from "./Tabs";
import { testTabs } from "./testData";

describe("TabsWithContent", () => {
  it("should display content of selected tab", async () => {
    const r = await render(<TestTabs />);
    // tab panel should initially display Tab 1 Content
    expect(r.tab_panel()).toHaveTextContent("Tab 1 Content");
    // when we click on the 4th tab
    click(r.tabs_tab4);
    // then expect to see the 4th tab's content
    expect(r.tab_panel()).toHaveTextContent("Tab 4 Content");
  });

  it("should update the active tab", async () => {
    // Given we start out on tab1
    const r = await render(<TestTabs />);
    expect(r.tabs_tab1()).toHaveStyleRule("color", Palette.LightBlue700);
    // when an external state change moves us to the 2nd tab
    click(r.goToTab2);
    // Then tab2 is now actively styled
    expect(r.tabs_tab2()).toHaveStyleRule("color", Palette.LightBlue700);
  });

  it("should reset the active tab on blur", async () => {
    // Given we start out on tab1
    const r = await render(<TestTabs />);
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
    const r = await render(<TestTabs />);
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
