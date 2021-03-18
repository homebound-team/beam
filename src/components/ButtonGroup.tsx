import React, { useRef } from "react";
import { AriaButtonProps } from "@react-types/button";
import { Css, Palette } from "src/Css";
import { useButton, useFocusRing } from "react-aria";
import { Icon, IconProps } from "src/components/Icon";

interface ButtonGroupProps extends AriaButtonProps {
  isDisabled?: boolean;
  buttons: ButtonGroupButtonProps[];
}

export function ButtonGroup(props: ButtonGroupProps) {
  const { buttons, isDisabled = false } = props;
  return (
    <div css={Css.mPx(4).$}>
      { buttons.map((b) => <ButtonGroupButton {...{...b, isDisabled} } />) }
    </div>
  );
}

interface ButtonGroupButtonProps extends AriaButtonProps {
  text?: string;
  icon?: IconProps["icon"];
}

export function ButtonGroupButton(props: ButtonGroupButtonProps) {
  const { icon, text } = props;
  const ref = useRef(null);
  const { buttonProps, isPressed } = useButton(props, ref);
  const { isFocusVisible, focusProps } = useFocusRing(props);
  const buttonStyles = getButtonStyles();
  const focusRingStyles = defaultFocusRingStyles;

  return (
    <button
      ref={ref}
      {...buttonProps}
      {...focusProps}
      css={{
        ...buttonReset,
        ...buttonStyles,
        ...(isFocusVisible ? focusRingStyles : {}),
        ...(isPressed ? activeStyles : {}),
      }}
    >
      {icon && <Icon color="inherit" icon={icon}/>}
      {text}
    </button>
  );
}

const buttonReset = Css.p0.bsNone.cursorPointer.smEm.dif.itemsCenter
  .add("font", "inherit")
  .add("boxSizing", "border-box")
  .add("outline", "inherit").$;
const activeStyles = Css.bgCoolGray200.important.$;
const defaultFocusRingStyles = Css.relative.z2.add("boxShadow", `0px 0px 0px 2px ${Palette.White}, 0 0 0 4px ${Palette.Sky500}`).$;

function getButtonStyles() {
  return {
    ...Css.z1.hPx(40).px2.bgWhite.bCoolGray300.bw1.coolGray900.ba.fill(Palette.CoolGray900).$,
    "&:hover:not(:disabled):not(:active)": Css.bgCoolGray50.$,
    "&:disabled": Css.bgWhite.coolGray300.fill(Palette.CoolGray300).add("cursor", "not-allowed").$,
    "&:first-of-type": Css.add("borderRadius", "4px 0 0 4px").$,
    "&:last-of-type": Css.add("borderRadius", "0 4px 4px 0").$,
    "&:not(:first-of-type)": Css.mlPx(-1).$,
  };
}
