import React, { useRef } from "react";
import { useButton, useFocusRing, useHover } from "react-aria";
import { Icon, IconProps } from "src/components/Icon";
import { Css } from "src/Css";
import { Callback } from "src/types";

export interface ButtonGroupProps {
  buttons: ButtonGroupButton[];
  /** Disables all buttons in ButtonGroup */
  disabled?: boolean;
  size?: ButtonGroupSize;
}

export type ButtonGroupButton = {
  icon?: IconProps["icon"];
  text?: string;
  onClick?: Callback;
  /** Disables the button. Note we don't support the `disabled: ReactNode`/tooltip for now. */
  disabled?: boolean;
  /** Indicates the active/selected button, as in a tab or toggle. */
  active?: boolean;
};

export function ButtonGroup(props: ButtonGroupProps) {
  const { buttons, disabled = false, size = "sm" } = props;
  return (
    <div css={Css.mPx(4).$}>
      {buttons.map(({ disabled: buttonDisabled, ...buttonProps }, i) => (
        <GroupButton
          key={i}
          {...buttonProps}
          {...{
            // Disable the button if the ButtonGroup is disabled or if the current
            // button is disabled.
            disabled: disabled || buttonDisabled,
            size,
          }}
        />
      ))}
    </div>
  );
}

interface GroupButtonProps extends ButtonGroupButton {
  size: ButtonGroupSize;
}

function GroupButton(props: GroupButtonProps) {
  const { icon, text, active, onClick: onPress, disabled, size, ...otherProps } = props;
  const ariaProps = { onPress, isDisabled: disabled, ...otherProps };
  const ref = useRef(null);
  const { buttonProps, isPressed } = useButton(ariaProps, ref);
  const { isFocusVisible, focusProps } = useFocusRing();
  const { hoverProps, isHovered } = useHover(ariaProps);

  return (
    <button
      ref={ref}
      {...buttonProps}
      {...focusProps}
      {...hoverProps}
      css={{
        ...Css.buttonBase.$,
        ...getButtonStyles(),
        ...sizeStyles[size],
        ...(isFocusVisible ? defaultFocusRingStyles : {}),
        ...(active ? activeStyles : {}),
        ...(isPressed ? pressedStyles : isHovered ? hoverStyles : {}),
        ...(icon ? iconStyles[size] : {}),
      }}
    >
      {icon && <Icon icon={icon} />}
      {text}
    </button>
  );
}

const pressedStyles = Css.bgGray200.$;
const activeStyles = Css.bgGray300.$;
const hoverStyles = Css.bgGray100.$;
const defaultFocusRingStyles = Css.relative.z2.bshFocus.$;

function getButtonStyles() {
  return {
    ...Css.z1.px2.bgWhite.bGray300.bw1.ba.gray900.br0.$,
    "&:disabled": Css.gray400.cursorNotAllowed.bGray300.$,
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
