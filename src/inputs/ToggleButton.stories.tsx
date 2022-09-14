import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useState } from "react";
import { isPromise } from "src/utils";
import { Css } from "src/Css";
import { ToggleButton as ToggleButtonComponent, ToggleButtonProps, toggleFocusStyles, toggleHoverStyles, togglePressStyles, toggleSelectedHoverStyles } from "./ToggleButton";

export default {
  component: ToggleButtonComponent,
  title: "Inputs/ToggleButton",
} as Meta<ToggleButtonProps>;

export const ToggleButton = () => {
  return (
    <div css={{ h1: Css.xl4Em.mb4.$, h2: Css.xl2Em.$ }}>
      <h1>Toggle Button</h1>
      <div css={Css.df.gap4.fdc.$}>
        <ToggleButtonWrapper label="Innactive" />
        <ToggleButtonWrapper label="Hovered" isHovered />
        <ToggleButtonWrapper label="Pressed" isPressed />
        <ToggleButtonWrapper label="Active" selected />
        <ToggleButtonWrapper label="Focused" isFocused />
        <ToggleButtonWrapper label="Focused and active" isFocused selected />
        <ToggleButtonWrapper label="Disabled" disabled="Disabled reason" />
      </div>
    </div>
  );
}

export const AsyncToggleButton = () => {
  return (
    <div css={{ h1: Css.xl4Em.mb4.$, h2: Css.xl2Em.$ }}>
      <h1>Toggle Button</h1>
      <div css={Css.df.gap4.fdc.$}>
        <h3>Resolved (2s)</h3>
        <ToggleButtonWrapper
          label="Toggle button"
          onClick={async () => await new Promise((resolve) => setTimeout(resolve, 2000))}
        />
        <h3>Rejected</h3>
        <ToggleButtonWrapper
          label="Toggle button"
          onClick={async () => new Promise((resolve, reject) => reject("Promise error")).catch(console.error)}
        />
      </div>
    </div>
  );
}

type StoryStates = {
  isHovered?: boolean;
  isFocused?: boolean;
  isPressed?: boolean;
}

type ToggleButtonWrapperProps = Omit<ToggleButtonProps, "onChange" | "selected" | "onClick"> &
  StoryStates & {
    onClick?: ((selected: boolean) => void) | ((active: boolean) => Promise<void>);
    selected?: boolean;
  };

function ToggleButtonWrapper({ isHovered, isFocused, isPressed, onClick, ...props}: ToggleButtonWrapperProps) {
  const [selected, setSelected] = useState<boolean>(props.selected || false);
  return (
    <div
      css={{
        "label > button:nth-of-type(1)": {
          ...(isHovered && toggleHoverStyles),
          ...(isPressed && togglePressStyles),
          ...(props.selected && isHovered && toggleSelectedHoverStyles),
          ...(isFocused && toggleFocusStyles),
        },
      }}
    >
      <ToggleButtonComponent
        {...props}
        icon="bell"
        selected={selected}
        onClick={onClick ? (value) => {
          const result = onClick(value);
          if (isPromise(result)) {
            result.finally(() => setSelected(value));
          }
          return result;
        } : (
          (value) => {
            action("onChange")(value);
            setSelected(value);
          }
        )}
      />
    </div>
  );
}