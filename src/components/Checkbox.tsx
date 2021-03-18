import { useCheckbox } from "@react-aria/checkbox";
import { useFocusRing } from "@react-aria/focus";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { useToggleState } from "@react-stately/toggle";
import { AriaCheckboxProps } from "@react-types/checkbox";
import { useRef } from "react";
import { Css, Palette } from "src/Css";

export function Checkbox(props: AriaCheckboxProps) {
  const { children, isIndeterminate = false, isDisabled = false } = props;
  const ref = useRef(null);
  const state = useToggleState(props);
  const { isSelected } = state;
  const { inputProps } = useCheckbox(props, state, ref);
  const { isFocusVisible, focusProps } = useFocusRing(props);
  const markIcon = isIndeterminate ? DashSmall : isSelected ? CheckmarkSmall : "";

  return (
    <label css={Css.df.itemsCenter.$}>
      <VisuallyHidden>
        <input ref={ref} {...inputProps} {...focusProps} />
      </VisuallyHidden>
      <span
        css={{
          ...checkboxStyles({ isDisabled, isSelected, isIndeterminate }),
          ...(isFocusVisible && focusRingStyles),
        }}
        aria-hidden="true"
      ></span>
      <span css={markStyles}>{markIcon}</span>
      {children && <span css={labelStyles(isDisabled)}>{children}</span>}
    </label>
  );
}

interface ICheckboxStyles {
  isDisabled: boolean;
  isSelected: boolean;
  isIndeterminate: boolean;
}

function checkboxStyles({ isDisabled, isSelected, isIndeterminate }: ICheckboxStyles) {
  return Css.add("boxSizing", "border-box")
    .hPx(16)
    .wPx(16)
    .ba.bCoolGray300.br4.bgWhite.if(isSelected || isIndeterminate)
    .bSky500.bgSky500.if(isDisabled).bCoolGray300.bgCoolGray100.$;
}
const focusRingStyles = Css.add("boxShadow", `0px 0px 0px 2px ${Palette.White}, 0 0 0 4px ${Palette.Sky500}`).$;
const markStyles = { ...Css.relative.$, "& svg": Css.absolute.topPx(-8).rightPx(0).$ };
function labelStyles(isDisabled: boolean) {
  return Css.pl1.sm.if(isDisabled).coolGray300.$;
}

export const CheckmarkSmall = (
  <svg width="16" height="16">
    <path
      d="M6.66669 10.3907L4.47135 8.19533L3.52869 9.138L6.66669 12.276L13.138 5.80467L12.1954 4.862L6.66669 10.3907Z"
      fill={Palette.White}
    />
  </svg>
);

const DashSmall = (
  <svg width="16" height="16">
    <rect x="4" y="7.5" width="8" height="1.35" fill={Palette.White} />
  </svg>
);
