import { useCheckbox } from "@react-aria/checkbox";
import { useFocusRing } from "@react-aria/focus";
import { useToggleState } from "@react-stately/toggle";
import { AriaCheckboxProps } from "@react-types/checkbox";
import { useRef } from "react";
import { Css, Palette } from "src/Css";

export interface CheckboxProps extends AriaCheckboxProps {}

export function Checkbox(props: CheckboxProps) {
  const { children, isSelected, isIndeterminate, isDisabled } = props;
  const ref = useRef(null);
  const state = useToggleState(props);
  const { inputProps } = useCheckbox(props, state, ref);
  const { isFocusVisible, focusProps } = useFocusRing(props);
  const markIcon = isIndeterminate ? smallDash : SmallCheckmark;

  return (
    <label css={Css.df.itemsCenter.$}>
      <input
        ref={ref}
        {...inputProps}
        {...focusProps}
        css={{
          ...checkboxReset,
          ...checkboxStyles,
          ...((isSelected || isIndeterminate) && filledStyle),
          ...(isFocusVisible && focusRingStyles),
        }}
      />
      <span css={markStyles}>{markIcon}</span>
      {children && <span css={Css.pl1.sm.if(!!isDisabled).coolGray300.$}>{children}</span>}
    </label>
  );
}
const checkboxReset = Css.add("appearance", "none").add("boxSizing", "border-box").$;
const checkboxStyles = { ...Css.m0.ba.bCoolGray300.br4.hPx(16).wPx(16).bgWhite.$, "&:disabled": Css.bgCoolGray300.$ };
const filledStyle = Css.bgSky500.bSky500.$;
const focusRingStyles = Css.outline0.add("boxShadow", `0px 0px 0px 2px ${Palette.White}, 0 0 0 4px ${Palette.Sky500}`)
  .$;
const markStyles = { ...Css.relative.$, "& svg": Css.absolute.topPx(-8).rightPx(0).$ };

export const SmallCheckmark = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6.66669 10.3907L4.47135 8.19533L3.52869 9.138L6.66669 12.276L13.138 5.80467L12.1954 4.862L6.66669 10.3907Z"
      fill={Palette.White}
    />
  </svg>
);

const smallDash = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="7.5" width="8" height="1.35" fill={Palette.White} />
  </svg>
);
