import { ReactNode } from "react";
import { TabWithContent } from "./Tabs";

export type TabValue = "tab1" | "tab2" | "tab3" | "tab4";

export const testTabs: TabWithContent<TabValue>[] = [
  { name: "Tab 1", value: "tab1", render: () => <TestTabContent content="Tab 1 Content" /> },
  { name: "Tab 2", value: "tab2", render: () => <TestTabContent content="Tab 2 Content" /> },
  { name: "Tab 3", value: "tab3", disabled: true, render: () => <TestTabContent content="Tab 3 Content" /> },
  { name: "Tab 4", value: "tab4", render: () => <TestTabContent content="Tab 4 Content" /> },
];

export function TestTabContent({ content }: { content: ReactNode }) {
  return <div>{content}</div>;
}
