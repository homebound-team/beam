import { Tab } from "./Tabs";

export const testTabs: Tab[] = [
  { name: "Tab 1", value: "tab1" },
  { name: "Tab 2", value: "tab2" },
  { name: "Tab 3", value: "tab3", disabled: true },
  { name: "Tab 4", value: "tab4" },
];

export const testTabsWithIcons: Tab[] = [
  { name: "Tab 1", value: "tab1", icon: "camera" },
  { name: "Tab 2", value: "tab2", icon: "dollar" },
  { name: "Tab 3", value: "tab3", icon: "check" },
  { name: "Tab 4", value: "tab4", icon: "plus" },
];
