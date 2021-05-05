import { getNextTabValue } from "./Tabs";
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
