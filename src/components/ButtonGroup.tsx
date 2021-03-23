import React, { useRef } from "react";
import { Css } from "src/Css";
import { useButton, useFocusRing } from "react-aria";
import { Icon } from "src/components/Icon";
import { BeamButtonGroupProps, BeamButtonGroupButtonProps } from "src/interfaces"

export function ButtonGroup(props: BeamButtonGroupProps) {
  const { buttons, disabled = false } = props;
  return (
    <div css={Css.mPx(4).$}>
      { buttons.map((b, i) => <ButtonGroupButton key={i} {...{...b, disabled} } />) }
    </div>
  );
}

export function ButtonGroupButton(props: BeamButtonGroupButtonProps) {
  const { icon, text, onClick: onPress, disabled, ...otherProps } = props;
  const ariaProps = { onPress, isDisabled: disabled, ...otherProps };
  const ref = useRef(null);
  const { buttonProps, isPressed } = useButton(ariaProps, ref);
  const { isFocusVisible, focusProps } = useFocusRing(ariaProps);
  const buttonStyles = getButtonStyles();

  return (
    <button
      ref={ref}
      {...buttonProps}
      {...focusProps}
      css={{
        ...buttonReset,
        ...buttonStyles,
        ...(isFocusVisible ? defaultFocusRingStyles : {}),
        ...(isPressed ? activeStyles : {}),
        ...(icon ? iconStyles : {})
      }}
    >
      {icon && <Icon icon={icon}/>}
      {text}
    </button>
  );
}

const buttonReset = Css.p0.bsNone.cursorPointer.smEm.dif.itemsCenter.outline0.transition
  .add("font", "inherit")
  .add("boxSizing", "border-box").$;
const activeStyles = Css.bgCoolGray200.important.$;
const defaultFocusRingStyles = Css.relative.z2.bshFocus.$;
const iconStyles = Css.px1.$;

function getButtonStyles() {
  return {
    ...Css.z1.hPx(40).px2.bgWhite.bCoolGray300.bw1.ba.coolGray900.$,
    "&:hover:not(:disabled):not(:active)": Css.bgCoolGray50.$,
    "&:disabled": Css.coolGray200.cursorNotAllowed.bCoolGray200.$,
    "&:first-of-type": Css.add("borderRadius", "4px 0 0 4px").$,
    "&:last-of-type": Css.add("borderRadius", "0 4px 4px 0").$,
    "&:not(:first-of-type)": Css.mlPx(-1).$,
  };
}
