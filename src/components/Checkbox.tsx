import { useCheckbox } from "@react-aria/checkbox";
import { useFocusRing } from "@react-aria/focus";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { useToggleState } from "@react-stately/toggle";
import { AriaCheckboxProps } from "@react-types/checkbox";
import { useRef } from "react";
import { Css, Palette, px } from "src/Css";

interface CheckboxProps extends AriaCheckboxProps {
  description?: string;
}

export function Checkbox(props: CheckboxProps) {
  const { children, isIndeterminate = false, isDisabled = false, description } = props;
  const ref = useRef(null);
  const state = useToggleState(props);
  const { isSelected } = state;
  const { inputProps } = useCheckbox(props, state, ref);
  const { isFocusVisible, focusProps } = useFocusRing(props);
  const markIcon = isIndeterminate ? DashSmall : isSelected ? CheckmarkSmall : "";

  return (
    <div>
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
        {children && <div css={labelStyles(isDisabled)}>{children}</div>}
      </label>
      {description && <div css={descStyles}>{description}</div>}
    </div>
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
    .cursorPointer.ba.bCoolGray300.br4.bgWhite.if(isSelected || isIndeterminate)
    .bSky500.bgSky500.if(isDisabled).bCoolGray300.bgCoolGray100.cursorNotAllowed.$;
}
const focusRingStyles = Css.bshFocus.$;
const markStyles = { ...Css.relative.cursorPointer.$, "& svg": Css.absolute.topPx(-8).rightPx(0).$ };
function labelStyles(isDisabled: boolean) {
  return Css.pl1.sm.if(isDisabled).coolGray300.$;
}
const descStyles = Css.pl3.sm.coolGray500.maxw(px(312)).$;

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
