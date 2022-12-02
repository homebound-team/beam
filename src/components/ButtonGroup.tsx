import React, { ReactNode, useRef } from "react";
import { useButton, useFocusRing, useHover } from "react-aria";
import { Icon, IconProps } from "src/components/Icon";
import { maybeTooltip, resolveTooltip } from "src/components/Tooltip";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

export interface ButtonGroupProps {
  buttons: ButtonGroupButton[];
  /** Disables all buttons in ButtonGroup */
  disabled?: boolean;
  size?: ButtonGroupSize;
}

export type ButtonGroupButton = {
  icon?: IconProps["icon"];
  text?: string;
  onClick?: VoidFunction;
  /** Disables the button. Pass a ReactNode to disable the button and show a tooltip */
  disabled?: boolean | ReactNode;
  /** Indicates the active/selected button, as in a tab or toggle. */
  active?: boolean;
  /** Adds tooltip to the button */
  tooltip?: ReactNode;
};

export function ButtonGroup(props: ButtonGroupProps) {
  const { buttons, disabled = false, size = "sm" } = props;
  const tid = useTestIds(props, "buttonGroup");
  return (
    <div {...tid} css={{ ...Css.df.$, ...sizeStyles[size] }}>
      {buttons.map(({ disabled: buttonDisabled, ...buttonProps }, i) => (
        // Disable the button if the ButtonGroup is disabled or if the current button is disabled.
        <GroupButton key={i} {...buttonProps} disabled={disabled || buttonDisabled} size={size} {...tid} />
      ))}
    </div>
  );
}

interface GroupButtonProps extends ButtonGroupButton {
  size: ButtonGroupSize;
}

function GroupButton(props: GroupButtonProps) {
  const { icon, text, active, onClick: onPress, disabled, size, tooltip, ...otherProps } = props;
  const ariaProps = { onPress, isDisabled: !!disabled, ...otherProps };
  const ref = useRef(null);
  const { buttonProps, isPressed } = useButton(ariaProps, ref);
  const { isFocusVisible, focusProps } = useFocusRing();
  const { hoverProps, isHovered } = useHover(ariaProps);
  const tid = useTestIds(props);

  return (
    <span css={getButtonStyles()}>
      {maybeTooltip({
        title: resolveTooltip(disabled, tooltip),
        placement: "top",
        children: (
          <button
            ref={ref}
            {...buttonProps}
            {...focusProps}
            {...hoverProps}
            css={{
              ...Css.buttonBase.px2.br0.$,
              "&:disabled": Css.gray400.cursorNotAllowed.bGray300.$,
              ...sizeStyles[size],
              ...(isFocusVisible ? defaultFocusRingStyles : {}),
              ...(active ? activeStyles : {}),
              ...(isPressed ? pressedStyles : isHovered ? hoverStyles : {}),
              ...(icon ? iconStyles[size] : {}),
            }}
            {...tid[defaultTestId(text ?? icon ?? "button")]}
          >
            {icon && <Icon icon={icon} />}
            {text}
          </button>
        ),
      })}
    </span>
  );
}

const pressedStyles = Css.bgGray200.$;
const activeStyles = Css.bgGray300.$;
const hoverStyles = Css.bgGray100.$;
const defaultFocusRingStyles = Css.relative.z2.bshFocus.$;

function getButtonStyles() {
  return {
    ...Css.z1.bgWhite.bGray300.bw1.ba.gray900.br0.overflowHidden.$,
    // Our first button should have a rounded left border
    "&:first-of-type": Css.add("borderRadius", "4px 0 0 4px").$,
    // Our last button should have a rounded right border
    "&:last-of-type": Css.add("borderRadius", "0 4px 4px 0").$,
    // Nudge buttons one pixel to the left so they visually share a border
    "&:not(:first-of-type)": Css.mlPx(-1).$,
  };
}

const sizeStyles: Record<ButtonGroupSize, {}> = {
  sm: Css.hPx(32).$,
  md: Css.hPx(40).$,
};

const iconStyles: Record<ButtonGroupSize, {}> = {
  sm: Css.pxPx(4).$,
  md: Css.px1.$,
};

type ButtonGroupSize = "sm" | "md";
