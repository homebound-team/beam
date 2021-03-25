import { CheckboxGroupState } from "@react-stately/checkbox";
import { useRef } from "react";
import { useCheckboxGroupItem, useFocusRing, useHover, VisuallyHidden } from "react-aria";
import { Css, Palette, px } from "src/Css";
import { CheckboxGroupItemOption } from "./CheckboxGroup";

interface CheckboxGroupItemProps extends CheckboxGroupItemOption {
  state: CheckboxGroupState;
}

export function CheckboxGroupItem(props: CheckboxGroupItemProps) {
  const {
    label,
    indeterminate: isIndeterminate = false,
    description,
    selected,
    value = "",
    state,
    ...otherProps
  } = props;
  const isDisabled = state.isDisabled || props.disabled || false;
  const ariaProps = { isSelected: selected, isDisabled, isIndeterminate, value, ...otherProps };
  const ref = useRef(null);

  const { inputProps } = useCheckboxGroupItem({ ...ariaProps, "aria-label": label }, state, ref);
  const { isFocusVisible, focusProps } = useFocusRing(ariaProps);
  const { hoverProps, isHovered } = useHover({ isDisabled });

  const isSelected = state.isSelected(ariaProps.value);
  const markIcon = isIndeterminate ? dashSmall : isSelected ? checkmarkSmall : "";

  return (
    <div>
      <label css={Css.df.itemsCenter.$}>
        <VisuallyHidden>
          <input ref={ref} {...inputProps} {...focusProps} />
        </VisuallyHidden>
        <span
          css={{
            ...baseStyles,
            ...((isSelected || isIndeterminate) && selectedStyles),
            ...(isDisabled && disabledStyles),
            ...(isFocusVisible && focusRingStyles),
            ...(isHovered && hoverStyles),
          }}
          aria-hidden="true"
          {...hoverProps}
        ></span>
        <span css={markStyles}>{markIcon}</span>
        {label && <div css={labelStyles(isDisabled)}>{label}</div>}
      </label>
      {description && <div css={descStyles}>{description}</div>}
    </div>
  );
}

const baseStyles = Css.hPx(16).wPx(16).cursorPointer.ba.bCoolGray300.br4.bgWhite.$;
const disabledStyles = Css.bCoolGray300.bgCoolGray100.cursorNotAllowed.$;
const selectedStyles = Css.bSky500.bgSky500.$;
const focusRingStyles = Css.bshFocus.$;
const hoverStyles = Css.bSky700.$;
const markStyles = { ...Css.relative.cursorPointer.$, "& svg": Css.absolute.topPx(-8).rightPx(0).$ };
function labelStyles(isDisabled: boolean) {
  return Css.pl1.smEm.if(isDisabled).coolGray300.$;
}
const descStyles = Css.pl3.sm.coolGray500.maxw(px(312)).$;

const checkmarkSmall = (
  <svg width="16" height="16">
    <path
      d="M6.66669 10.3907L4.47135 8.19533L3.52869 9.138L6.66669 12.276L13.138 5.80467L12.1954 4.862L6.66669 10.3907Z"
      fill={Palette.White}
    />
  </svg>
);

const dashSmall = (
  <svg width="16" height="16">
    <rect x="4" y="7.5" width="8" height="1.35" fill={Palette.White} />
  </svg>
);
