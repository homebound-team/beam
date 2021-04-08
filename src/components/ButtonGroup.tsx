import React, { useRef } from "react";
import { useButton, useFocusRing, useHover } from "react-aria";
import { Icon, IconProps } from "src/components/Icon";
import { Css } from "src/Css";
import { BeamButtonProps, BeamFocusableProps } from "src/interfaces";

interface ButtonGroupProps {
  disabled?: boolean;
  buttons: ButtonGroupButtonProps[];
}

interface ButtonGroupButtonProps extends BeamButtonProps, BeamFocusableProps {
  text?: string;
  icon?: IconProps["icon"];
  active?: boolean;
}

export function ButtonGroup(props: ButtonGroupProps) {
  const { buttons, disabled = false } = props;
  return (
    <div css={Css.mPx(4).$}>
      {buttons.map((b, i) => (
        <ButtonGroupButton key={i} {...{ ...b, disabled }} />
      ))}
    </div>
  );
}

export function ButtonGroupButton({icon, text, active, onClick: onPress, disabled, ...otherProps}: ButtonGroupButtonProps) {
  const ariaProps = { onPress, isDisabled: disabled, ...otherProps };
  const ref = useRef(null);
  const { buttonProps, isPressed } = useButton(ariaProps, ref);
  const { isFocusVisible, focusProps } = useFocusRing(ariaProps);
  const { hoverProps, isHovered } = useHover(ariaProps);
  const buttonStyles = getButtonStyles();

  return (
    <button
      ref={ref}
      {...buttonProps}
      {...focusProps}
      {...hoverProps}
      css={{
        ...buttonReset,
        ...buttonStyles,
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

const buttonReset = Css.smEm.br4.dif.itemsCenter.outline0.transition.mPx(4).$;
const pressedStyles = Css.bgGray200.important.$;
const activeStyles = Css.bgGray300.$;
const hoverStyles = Css.bgGray100.$;
const defaultFocusRingStyles = Css.relative.z2.bshFocus.$;
const iconStyles = Css.px1.$;

function getButtonStyles() {
  return {
    ...Css.z1.hPx(40).px2.bgWhite.bGray300.bw1.ba.gray800.m0.br0.$,
    "&:disabled": Css.gray400.cursorNotAllowed.bGray300.$,
    // Our first button should have a rounded left border
    "&:first-of-type": Css.add("borderRadius", "4px 0 0 4px").$,
    // Our last button should have a rounded right border
    "&:last-of-type": Css.add("borderRadius", "0 4px 4px 0").$,
    // Nudge buttons one pixel to the left so they visually share a border
    "&:not(:first-of-type)": Css.mlPx(-1).$,
  };
}
