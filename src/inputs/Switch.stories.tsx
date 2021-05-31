import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useState } from "react";
import { Css } from "../Css";
import {
  Switch as SwitchComponent,
  switchFocusStyles,
  switchHoverStyles,
  SwitchProps,
  switchSelectedHoverStyles,
} from "./Switch";
import { SwitchGroup, SwitchGroupProps } from "./SwitchGroup";

export default {
  component: SwitchComponent,
  title: "Inputs/Switch",
} as Meta<SwitchProps>;

export const Switch = () => {
  return (
    <div css={{ h1: Css.xl4Em.mb4.$, h2: Css.xl2Em.$ }}>
      <h1>Switch</h1>
      <div css={Css.df.gap4.flexColumn.$}>
        <h2>Switch</h2>
        <div css={Css.dg.gapPx(48).gtc("repeat(auto-fit, 365px)").$}>
          <div css={Css.dg.gtc("max-content max-content").gap("16px 32px").$}>
            <SwitchWrapper label="Remember me?" />
            <SwitchWrapper label="Remember me?" selected />
            <SwitchWrapper label="Remember me?" isHovered />
            <SwitchWrapper label="Remember me?" isHovered selected />
            <SwitchWrapper label="Remember me?" isFocused />
            <SwitchWrapper label="Remember me?" isFocused selected />
            <SwitchWrapper label="Remember me?" disabled />
          </div>
          <div css={Css.dg.gtc("max-content max-content").gap("16px 32px").$}>
            <SwitchWrapper label="Remember me?" withIcon />
            <SwitchWrapper label="Remember me?" withIcon selected />
            <SwitchWrapper label="Remember me?" withIcon isHovered />
            <SwitchWrapper label="Remember me?" withIcon isHovered selected />
            <SwitchWrapper label="Remember me?" withIcon isFocused />
            <SwitchWrapper label="Remember me?" withIcon isFocused selected />
            <SwitchWrapper label="Remember me?" withIcon disabled />
          </div>
          <div css={Css.dg.gtc("max-content max-content").gap("16px 32px").$}>
            <SwitchWrapper label="Remember me?" compact />
            <SwitchWrapper label="Remember me?" compact selected />
            <SwitchWrapper label="Remember me?" compact isHovered />
            <SwitchWrapper label="Remember me?" compact isHovered selected />
            <SwitchWrapper label="Remember me?" compact isFocused />
            <SwitchWrapper label="Remember me?" compact isFocused selected />
            <SwitchWrapper label="Remember me?" compact disabled />
          </div>
          <div css={Css.dg.gtc("max-content max-content").gap("16px 32px").$}>
            <SwitchWrapper label="Remember me?" withIcon compact />
            <SwitchWrapper label="Remember me?" withIcon compact selected />
            <SwitchWrapper label="Remember me?" withIcon compact isHovered />
            <SwitchWrapper label="Remember me?" withIcon compact isHovered selected />
            <SwitchWrapper label="Remember me?" withIcon compact isFocused />
            <SwitchWrapper label="Remember me?" withIcon compact isFocused selected />
            <SwitchWrapper label="Remember me?" withIcon compact disabled />
          </div>
        </div>
        <h2>Switch Group</h2>
        <div css={Css.dg.gapPx(48).$}>
          <div css={Css.df.gap("16px 32px").$}>
            <SwitchGroupWrapper label="Notifications" />
            <SwitchGroupWrapper label="Notifications" withIcon />
          </div>
          <div css={Css.df.gap("16px 32px").$}>
            <SwitchGroupWrapper compact label="Notifications" />
            <SwitchGroupWrapper compact label="Notifications" withIcon />
          </div>
        </div>
      </div>
    </div>
  );
};

type StoryStates = {
  isHovered?: boolean;
  isFocused?: boolean;
};

type SwitchWrapperProps = {
  /** Whether the element should receive focus on render. */
  autoFocus?: boolean;
  /** Whether to render a compact version of Switch */
  compact?: boolean;
  /** Whether the interactive element is disabled. */
  disabled?: boolean;
  /** Input label */
  label: string;
  /** Handler when the interactive element state changes. */
  onChange?: (value: boolean) => void;
  /** Whether the switch is selected */
  selected?: boolean;
  /** Whether to include icons like the check mark */
  withIcon?: boolean;
} & StoryStates;

function SwitchWrapper({ isHovered, isFocused, ...props }: SwitchWrapperProps) {
  const [selected, setSelected] = useState<boolean>(props.selected || false);

  return (
    <div
      css={{
        "label > div:nth-of-type(1)": {
          ...(isHovered && switchHoverStyles),
          ...(props.selected && isHovered && switchSelectedHoverStyles),
          ...(isFocused && switchFocusStyles),
        },
      }}
    >
      <SwitchComponent
        {...props}
        selected={selected}
        onChange={(value) => {
          action("onChange")(value);
          setSelected(value);
        }}
      />
    </div>
  );
}

function SwitchGroupWrapper({ compact, label, withIcon }: Pick<SwitchGroupProps, "label" | "compact" | "withIcon">) {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <SwitchGroup
      compact={compact}
      label={label}
      onChange={(value) => {
        action("onChange")(value);
        setSelected(value);
      }}
      options={[
        { label: "Weekly emails", value: "weekly" },
        { label: "Daily emails", value: "daily" },
      ]}
      values={selected}
      withIcon={withIcon}
    />
  );
}
