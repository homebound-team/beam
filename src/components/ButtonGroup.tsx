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
  const {buttonProps} = useButton(props, ref);
  const {isFocusVisible, focusProps} = useFocusRing(props);
  const buttonStyles = getButtonStyles();
  const focusRingStyles = defaultFocusRingStyles;

  return (
    <button
      ref={ref}
      {...buttonProps}
      {...focusProps}
      css={{...buttonReset, ...buttonStyles, ...(isFocusVisible ? focusRingStyles : {})}}
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
const disabledStyles = Css.add("cursor", "not-allowed").$;
const defaultFocusRingStyles = Css.add("boxShadow", `0px 0px 0px 2px ${Palette.White}, 0 0 0 4px ${Palette.Sky500}`).$;

function getButtonStyles() {
  return {
    ...Css.hPx(40).px2.$,
    ...Css.bgWhite.bCoolGray300.bw1.ba.coolGray900.fill(Palette.CoolGray900).$,
    "&:hover:not(:disabled):not(:active)": Css.bgCoolGray50.$,
    "&:disabled": {...disabledStyles, ...Css.bgWhite.coolGray300.fill(Palette.CoolGray300).$},
    "&:active:not(:disabled)": Css.bgCoolGray200.$,
    "&:first-of-type": Css.add("borderRadius", "4px 0 0 4px").add("borderRight", "none").$,
    "&:last-of-type": Css.add("borderRadius", "0 4px 4px 0").$,
    "&:not(:first-of-type):not(:last-of-type)": Css.add("borderRight", "none").$,
  };
}
