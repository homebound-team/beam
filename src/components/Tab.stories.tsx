import { Meta } from "@storybook/react";
import { Fragment, useState } from "react";
import { Css } from "src/Css";
import { getTabStyles, Tab as TabComponent, TabList as TabListComponent, TabProps } from "src/index";
import { Icon, Icons } from "./Icon";

export default {
  title: "Components/Tab",
  component: TabComponent,
  args: {
    label: "Tab",
  },
  argTypes: {
    icon: { control: { type: "select", options: Object.keys(Icons) } },
  },
  parameters: {
    // To better view the icon hover state
    backgrounds: { default: "white" },
  },
} as Meta;

export function BaseStates() {
  const styles = getTabStyles();

  return (
    <div css={Css.df.flexColumn.childGap2.$}>
      <div css={{ ...styles.baseStyles, ...styles.activeStyles }}>{getChildren("active")}</div>
      <div css={{ ...styles.baseStyles, ...styles.focusStyles }}>{getChildren("focused")}</div>
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

export const Tab = (args: TabProps) => {
  return (
    <div css={Css.df.childGap2.$}>
      <div css={Css.df.flexColumn.childGap2.$}>
        <h2>Tab</h2>
        <TabComponent {...args} icon={undefined} />
        <TabComponent {...args} icon={undefined} active />
        <TabComponent {...args} icon={undefined} disabled />
      </div>
      <div css={Css.df.flexColumn.childGap2.$}>
        <h2>Tab with icon</h2>
        <TabComponent icon="checkCircle" {...args} />
        <TabComponent icon="checkCircle" {...args} active />
        <TabComponent icon="checkCircle" {...args} disabled />
      </div>
    </div>
  );
};

export const TabList = () => {
  const [activeTab, setActiveTab] = useState("tab2");

  return (
    <TabListComponent
      tabs={[
        { name: "Tab 1", value: "tab1", icon: "camera" },
        { name: "Tab 2", value: "tab2", icon: "dollar" },
        { name: "Tab 3", value: "tab3", icon: "check" },
        { name: "Tab 4", value: "tab4", icon: "plus" },
      ]}
      onChange={setActiveTab}
      selected={activeTab}
    />
  );
};
