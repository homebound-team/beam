import { Meta } from "@storybook/react";
import { Fragment, useState } from "react";
import { Css } from "src/Css";
import { Icon, Icons } from "./Icon";
import { getTabStyles, Tab, Tabs as TabsComponent, TabsWithContent } from "./Tabs";
import { TabContent, testTabs } from "./testData";

export default {
  title: "Components/Tabs",
  component: TabsComponent,
  args: {
    label: "Tabs",
  },
  argTypes: {
    icon: { control: { type: "select", options: Object.keys(Icons) } },
  },
  parameters: {
    // To better view the icon hover state
    backgrounds: { default: "white" },
  },
} as Meta;

export function TabBaseStates() {
  const styles = getTabStyles();

  return (
    <div css={Css.df.flexColumn.childGap2.$}>
      <div css={{ ...styles.baseStyles, ...styles.activeStyles }}>{getChildren("active")}</div>
      <div css={{ ...styles.baseStyles, ...styles.focusRingStyles }}>{getChildren("focus ring")}</div>
      <div css={styles.baseStyles}>{getChildren("default")}</div>
      <div css={{ ...styles.baseStyles, ...styles.disabledStyles }}>{getChildren("disabled")}</div>
      <div css={{ ...styles.baseStyles, ...styles.hoverStyles }}>{getChildren("hovered")}</div>
      <div css={{ ...styles.baseStyles, ...styles.activeHoverStyles }}>{getChildren("active hover")}</div>
    </div>
  );
}

function getChildren(label: string) {
  return (
    <Fragment>
      {label}
      <Icon icon="checkCircle" css={Css.ml1.$} />
    </Fragment>
  );
}

export const Tabs = () => {
  const [activeTab1, setActiveTab1] = useState("tab1");
  const [activeTab2, setActiveTab2] = useState("tab1");

  return (
    <div css={Css.df.flexColumn.childGap3.$}>
      <div css={Css.df.flexColumn.childGap1.$}>
        <h3>Tabs</h3>
        <TabsWithContent tabs={testTabs} onChange={setActiveTab1} selected={activeTab1} ariaLabel="Sample Tabs" />
      </div>
      <div css={Css.df.flexColumn.childGap1.$}>
        <h3>Tabs with icons</h3>
        <TabsWithContent
          tabs={tabsWithIconsAndContent}
          onChange={setActiveTab2}
          selected={activeTab2}
          ariaLabel="Sample Tabs With Content"
        />
      </div>
    </div>
  );
};

const tabsWithIconsAndContent: Tab[] = [
  { name: "Tab 1", value: "tab1", icon: "camera", render: () => <TabContent title="Tab 1 Content" /> },
  { name: "Tab 2", value: "tab2", icon: "dollar", render: () => <TabContent title="Tab 2 Content" /> },
  { name: "Tab 3", value: "tab3", icon: "check", render: () => <TabContent title="Tab 3 Content" /> },
  { name: "Tab 4", value: "tab4", icon: "plus", render: () => <TabContent title="Tab 4 Content" /> },
];
