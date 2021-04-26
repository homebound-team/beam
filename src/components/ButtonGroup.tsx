import React, { useRef } from "react";
import { useButton, useFocusRing, useHover } from "react-aria";
import { Icon, IconProps } from "src/components/Icon";
import { Css } from "src/Css";
import { BeamButtonProps, BeamFocusableProps } from "src/interfaces";

interface ButtonGroupProps {
  disabled?: boolean;
  buttons: ButtonGroupButtonProps[];
  size?: ButtonGroupSize;
}

interface ButtonGroupButtonProps extends BeamButtonProps, BeamFocusableProps {
  text?: string;
  icon?: IconProps["icon"];
  // Active is used to indicate the active/selected button, as in a tab or toggle.
  active?: boolean;
  size?: ButtonGroupSize;
}

export function ButtonGroup(props: ButtonGroupProps) {
  const { buttons, disabled = false, size } = props;
  return (
    <div css={Css.mPx(4).$}>
      {buttons.map((b, i) => (
        <ButtonGroupButton key={i} {...{ ...b, disabled, size }} />
      ))}
    </div>
  );
}

export function ButtonGroupButton({
  icon,
  text,
  active,
  onClick: onPress,
  disabled,
  size = "sm",
  ...otherProps
}: ButtonGroupButtonProps) {
  const ariaProps = { onPress, isDisabled: disabled, ...otherProps };
  const ref = useRef(null);
  const { buttonProps, isPressed } = useButton(ariaProps, ref);
  const { isFocusVisible, focusProps } = useFocusRing(ariaProps);
  const { hoverProps, isHovered } = useHover(ariaProps);
  const baseButtonStyles = getButtonStyles();
  const sizeStyles = getSizeStyles[size];
  const iconStyles = getIconStyles[size];

  return (
    <button
      ref={ref}
      {...buttonProps}
      {...focusProps}
      {...hoverProps}
      css={{
        ...Css.buttonBase.$,
        ...baseButtonStyles,
        ...sizeStyles,
        ...(isFocusVisible ? defaultFocusRingStyles : {}),
        ...(active ? activeStyles : {}),
        ...(isPressed ? pressedStyles : isHovered ? hoverStyles : {}),
        ...(icon ? iconStyles : {}),
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
    ...Css.z1.px2.bgWhite.bGray300.bw1.ba.gray800.m0.br0.$,
    "&:disabled": Css.gray400.cursorNotAllowed.bGray300.$,
    // Our first button should have a rounded left border
    "&:first-of-type": Css.add("borderRadius", "4px 0 0 4px").$,
    // Our last button should have a rounded right border
    "&:last-of-type": Css.add("borderRadius", "0 4px 4px 0").$,
    // Nudge buttons one pixel to the left so they visually share a border
    "&:not(:first-of-type)": Css.mlPx(-1).$,
  };
}

const getSizeStyles: Record<ButtonGroupSize, {}> = {
  sm: Css.hPx(32).$,
  md: Css.hPx(40).$,
};

const getIconStyles: Record<ButtonGroupSize, {}> = {
  sm: Css.pxPx(4).$,
  md: Css.px1.$,
};

type ButtonGroupSize = "sm" | "md";
