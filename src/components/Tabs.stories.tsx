import { Meta } from "@storybook/react";
import { Fragment, useState } from "react";
import { Css } from "src/Css";
import { Icon, Icons } from "./Icon";
import { getTabStyles, Tabs as TabsComponent } from "./Tabs";
import { testTabs, testTabsWithIcons } from "./testData";

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
        <TabsComponent tabs={testTabs} onChange={setActiveTab1} selected={activeTab1} />
      </div>
      <div css={Css.df.flexColumn.childGap1.$}>
        <h3>Tabs with icons</h3>
        <TabsComponent tabs={testTabsWithIcons} onChange={setActiveTab2} selected={activeTab2} />
      </div>
    </div>
  );
};
