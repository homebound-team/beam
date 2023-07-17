import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useState } from "react";
import { Css } from "src/Css";
import { isPromise } from "src/utils";
import {
  ToggleButton as ToggleButtonComponent,
  ToggleButtonProps,
  toggleFocusStyles,
  toggleHoverStyles,
  togglePressStyles,
} from "./ToggleButton";

export default {
  component: ToggleButtonComponent,
  parameters: {
    backgrounds: { default: "white" },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=31580%3A99845",
    },
  },
} as Meta<ToggleButtonProps>;

export const ToggleButton = () => {
  return (
    <div css={{ h1: Css.xl4Sb.mb4.$, h2: Css.xl2Sb.$ }}>
      <h1>Toggle Button</h1>
      <div css={Css.df.gap4.fdc.aifs.$}>
        <ToggleButtonWrapper label="Inactive" />
        <ToggleButtonWrapper label="Hovered" isHovered />
        <ToggleButtonWrapper label="Pressed" isPressed />
        <ToggleButtonWrapper label="Active" selected />
        <ToggleButtonWrapper label="Focused" isFocused />
        <ToggleButtonWrapper label="Focused and active" isFocused selected />
        <ToggleButtonWrapper label="Disabled" disabled="Disabled reason" />
      </div>
    </div>
  );
};

export const AsyncToggleButton = () => {
  return (
    <div css={{ h1: Css.xl4Sb.mb4.$, h2: Css.xl2Sb.$ }}>
      <h1>Toggle Button</h1>
      <div css={Css.df.gap4.fdc.$}>
        <h3>Resolved (2s)</h3>
        <ToggleButtonWrapper
          label="Toggle button"
          onChange={async () => await new Promise((resolve) => setTimeout(resolve, 2000))}
        />
        <h3>Rejected</h3>
        <ToggleButtonWrapper
          label="Toggle button"
          onChange={async () => await new Promise((resolve, reject) => setTimeout(() => reject("Promise error"), 2000))}
        />
      </div>
    </div>
  );
};

type StoryStates = {
  isHovered?: boolean;
  isFocused?: boolean;
  isPressed?: boolean;
};

type ToggleButtonWrapperProps = Omit<ToggleButtonProps, "onChange" | "selected" | "onChange"> &
  StoryStates & {
    onChange?: ((selected: boolean) => void) | ((active: boolean) => Promise<void>);
    selected?: boolean;
  };

function ToggleButtonWrapper({ isHovered, isFocused, isPressed, onChange, ...props }: ToggleButtonWrapperProps) {
  const [selected, setSelected] = useState<boolean>(props.selected || false);
  return (
    <div
      css={{
        label: {
          ...(isHovered && toggleHoverStyles),
          ...(isPressed && togglePressStyles),
          ...(isFocused && toggleFocusStyles),
        },
      }}
    >
      <ToggleButtonComponent
        {...props}
        icon="bell"
        selected={selected}
        onChange={
          onChange
            ? (value) => {
                const result = onChange(value);
                setSelected(value);
                if (isPromise(result)) {
                  result.catch(() => setSelected(!value));
                }
                return result;
              }
            : (value) => {
                action("onChange")(value);
                setSelected(value);
              }
        }
      />
    </div>
  );
}
