import { Tab } from "./Tabs";

export const testTabs: Tab[] = [
  { name: "Tab 1", value: "tab1", render: () => <TabContent title="Tab 1 Content" /> },
  { name: "Tab 2", value: "tab2", render: () => <TabContent title="Tab 2 Content" /> },
  { name: "Tab 3", value: "tab3", disabled: true, render: () => <TabContent title="Tab 3 Content" /> },
  { name: "Tab 4", value: "tab4", render: () => <TabContent title="Tab 4 Content" /> },
];

export function TabContent({ title }: { title: string }) {
  return <div>{title}</div>;
}
