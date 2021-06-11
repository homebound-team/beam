import { Meta } from "@storybook/react";
import { Fragment, useState } from "react";
import { Css } from "src/Css";
import { Icon } from "./Icon";
import { getTabStyles, Tab, TabsWithContent as TabsWithContentComponent } from "./Tabs";
import { TabContent, testTabs } from "./testData";

export default {
  title: "Components/Tabs",
  component: TabsWithContentComponent,
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

export const TabsWithContent = () => {
  const [selectedTab1, setSelectedTab1] = useState("tab1");
  const [selectedTab2, setSelectedTab2] = useState("tab1");

  return (
    <div css={Css.df.flexColumn.childGap3.$}>
      <div css={Css.df.flexColumn.childGap1.$}>
        <h3>Tabs</h3>
        <TabsWithContentComponent
          tabs={testTabs}
          onChange={setSelectedTab1}
          selected={selectedTab1}
          ariaLabel="Sample Tabs"
        />
      </div>
      <div css={Css.df.flexColumn.childGap1.$}>
        <h3>Tabs with icons</h3>
        <TabsWithContentComponent
          tabs={tabsWithIconsAndContent}
          onChange={setSelectedTab2}
          selected={selectedTab2}
          ariaLabel="Sample Tabs With Content"
          contentXss={Css.m3.$}
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
