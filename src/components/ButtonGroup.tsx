import React, { useRef } from "react";
import { Css } from "src/Css";
import {useButton, useFocusRing, useHover} from "react-aria";
import { Icon, IconProps } from "src/components/Icon";
import { BeamButtonProps, BeamFocusableProps } from "src/interfaces"

interface ButtonGroupProps {
  disabled?: boolean;
  buttons: ButtonGroupButtonProps[];
}

interface ButtonGroupButtonProps extends BeamButtonProps, BeamFocusableProps {
  text?: string;
  icon?: IconProps["icon"];
}

export function ButtonGroup(props: ButtonGroupProps) {
  const { buttons, disabled = false } = props;
  return (
    <div css={Css.mPx(4).$}>
      { buttons.map((b, i) => <ButtonGroupButton key={i} {...{...b, disabled} } />) }
    </div>
  );
}

export function ButtonGroupButton(props: ButtonGroupButtonProps) {
  const { icon, text, onClick: onPress, disabled, ...otherProps } = props;
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
        ...(isPressed ? activeStyles : isHovered ? hoverStyles : {}),
        ...(icon ? iconStyles : {})
      }}
    >
      {icon && <Icon icon={icon}/>}
      {text}
    </button>
  );
}

const buttonReset = Css.smEm.br4.dif.itemsCenter.outline0.transition.mPx(4).$;
const activeStyles = Css.bgCoolGray200.important.$;
const hoverStyles = Css.bgCoolGray50.$;
const defaultFocusRingStyles = Css.relative.z2.bshFocus.$;
const iconStyles = Css.px1.$;

function getButtonStyles() {
  return {
    ...Css.z1.hPx(40).px2.bgWhite.bCoolGray300.bw1.ba.coolGray900.m0.br0.$,
    "&:disabled": Css.coolGray200.cursorNotAllowed.bCoolGray200.$,
    // Our first button should have a rounded left border
    "&:first-of-type": Css.add("borderRadius", "4px 0 0 4px").$,
    // Our last button should have a rounded right border
    "&:last-of-type": Css.add("borderRadius", "0 4px 4px 0").$,
    // Nudge buttons one pixel to the left so they visually share a border
    "&:not(:first-of-type)": Css.mlPx(-1).$,
  };
}
