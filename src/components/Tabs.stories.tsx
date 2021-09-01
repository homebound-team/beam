import { Meta } from "@storybook/react";
import { Fragment, useState } from "react";
import { Css } from "src/Css";
import { Icon } from "./Icon";
import { getTabStyles, Tab, TabContent, Tabs, TabsWithContent } from "./Tabs";
import { TabValue, TestTabContent, testTabs } from "./testData";

export default {
  title: "Components/Tabs",
  component: TabsWithContent,
  parameters: {
    // To better view the icon hover state
    backgrounds: { default: "white" },
  },
} as Meta;

export function TabBaseStates() {
  const styles = getTabStyles();
  return (
    <div css={Css.df.fdc.childGap2.$}>
      <div css={{ ...styles.baseStyles, ...styles.activeStyles }}>{getChildren("active")}</div>
      <div css={{ ...styles.baseStyles, ...styles.focusRingStyles }}>{getChildren("focus ring")}</div>
      <div css={styles.baseStyles}>{getChildren("default")}</div>
      <div css={{ ...styles.baseStyles, ...styles.disabledStyles }}>{getChildren("disabled")}</div>
      <div css={{ ...styles.baseStyles, ...styles.hoverStyles }}>{getChildren("hovered")}</div>
      <div css={{ ...styles.baseStyles, ...styles.activeHoverStyles }}>{getChildren("active hover")}</div>
    </div>
  );
}

export function TabsWithJustNames() {
  const [tab, setTab] = useState<TabValue>("tab1");
  return <TabsWithContent tabs={testTabs} onChange={setTab} selected={tab} ariaLabel="Sample Tabs" />;
}

export function TabsWithIconAndMargin() {
  const [tab, setTab] = useState<TabValue>("tab1");
  return <TabsWithContent tabs={tabsWithIconsAndContent} onChange={setTab} selected={tab} contentXss={Css.m3.$} />;
}

export function TabsSeparateFromContent() {
  const [tab, setTab] = useState<TabValue>("tab1");
  return (
    <div>
      <Tabs tabs={testTabs} onChange={setTab} selected={tab} />
      <hr />
      <TabContent tabs={testTabs} selected={tab} />
    </div>
  );
}

export const TabsHiddenIfOnlyOneActive = () => {
  const testTabs: Tab<TabValue>[] = [
    { name: "Tab 1", value: "tab1", render: () => <TestTabContent title="Tab 1 Content" /> },
    { name: "Tab 2", value: "tab2", disabled: true, render: () => <TestTabContent title="Tab 2 Content" /> },
    { name: "Tab 3", value: "tab3", disabled: true, render: () => <TestTabContent title="Tab 3 Content" /> },
    { name: "Tab 4", value: "tab4", disabled: true, render: () => <TestTabContent title="Tab 4 Content" /> },
  ];
  return <TabsWithContent tabs={testTabs} onChange={() => {}} selected={"tab1"} ariaLabel="Sample Tabs" />;
};

const tabsWithIconsAndContent: Tab<TabValue>[] = [
  { name: "Tab 1", value: "tab1", icon: "camera", render: () => <TestTabContent title="Tab 1 Content" /> },
  { name: "Tab 2", value: "tab2", icon: "dollar", render: () => <TestTabContent title="Tab 2 Content" /> },
  { name: "Tab 3", value: "tab3", icon: "check", render: () => <TestTabContent title="Tab 3 Content" /> },
  { name: "Tab 4", value: "tab4", icon: "plus", render: () => <TestTabContent title="Tab 4 Content" /> },
];

function getChildren(label: string) {
  return (
    <Fragment>
      {label}
      <Icon icon="checkCircle" css={Css.ml1.$} />
    </Fragment>
  );
}
