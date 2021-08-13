import { Tab } from "./Tabs";

export type TabValue = "tab1" | "tab2" | "tab3" | "tab4";

export const testTabs: Tab<TabValue>[] = [
  { name: "Tab 1", value: "tab1", render: () => <TestTabContent title="Tab 1 Content" /> },
  { name: "Tab 2", value: "tab2", render: () => <TestTabContent title="Tab 2 Content" /> },
  { name: "Tab 3", value: "tab3", disabled: true, render: () => <TestTabContent title="Tab 3 Content" /> },
  { name: "Tab 4", value: "tab4", render: () => <TestTabContent title="Tab 4 Content" /> },
];

export function TestTabContent({ title }: { title: string }) {
  return <div>{title}</div>;
}
