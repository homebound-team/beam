import { Meta } from "@storybook/react";
import { Fragment } from "react";
import { Css } from "src/Css";
import { getTabsStyles, Tab, TabsProps } from "src/index";
import { Icon, Icons } from "./Icon";
import { LocalTabs } from "./Tab";

export default {
  title: "Components/Tab",
  component: Tab,
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
  const styles = getTabsStyles("side");

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

export const TabComponent = (args: TabsProps) => {
  return (
    <div css={Css.df.childGap2.$}>
      <div css={Css.df.flexColumn.childGap2.$}>
        <h2>Tab</h2>
        <Tab {...args} icon={undefined} />
        <Tab {...args} icon={undefined} active />
        <Tab {...args} icon={undefined} disabled />
      </div>
      <div css={Css.df.flexColumn.childGap2.$}>
        <h2>Tab with icon</h2>
        <Tab icon="checkCircle" {...args} />
        <Tab icon="checkCircle" {...args} active />
        <Tab icon="checkCircle" {...args} disabled />
      </div>
    </div>
  );
};

export const TabGroup = () => {
  return (
    <LocalTabs
      tabs={[
        { name: "Active Tab", value: "tab1", icon: "camera" },
        { name: "Tab 2", value: "tab2", icon: "dollar" },
        { name: "Tab 3", value: "tab3", icon: "check" },
      ]}
      onChange={() => {}}
      selected="tab1"
    />
  );
};
