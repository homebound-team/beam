import { CheckboxGroupState } from "@react-stately/checkbox";
import { useToggleState } from "@react-stately/toggle";
import { useRef } from "react";
import { useCheckbox, useCheckboxGroupItem, useFocusRing, useHover, VisuallyHidden } from "react-aria";
import { Css, Palette, px } from "src/Css";
import { BeamFocusableProps } from "src/interfaces";

export interface CheckboxProps extends BeamFocusableProps {
  /** Additional text displayed below label */
  description?: string;
  disabled?: boolean;
  /**
   * Indeterminism is presentational only.
   * The indeterminate visual representation remains regardless of user interaction.
   */
  indeterminate?: boolean;
  selected?: boolean;
  label: string;
  /** Handler that is called when the element's selection state changes. */
  onChange: (selected: boolean) => void;
  /** Required for CheckboxGroup option */
  value?: string;
  /** Required for CheckboxGroup option */
  groupState?: CheckboxGroupState;
}

export function Checkbox(props: CheckboxProps) {
  const {
    label,
    indeterminate: isIndeterminate = false,
    disabled: isDisabled = false,
    description,
    selected,
    groupState,
    value = "",
    ...otherProps
  } = props;
  const ariaProps = { isSelected: selected, isDisabled, isIndeterminate, value, ...otherProps };
  const ref = useRef(null);
  const state = useToggleState(ariaProps);
  const isSelected = state.isSelected;

  // Swap hooks depending on whether this checkbox is inside a CheckboxGroup.
  // This is a bit unorthodox. Typically, hooks cannot be called in a conditional,
  // but since the checkbox won't move in and out of a group, it should be safe.
  const { inputProps } = groupState
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      useCheckboxGroupItem({ ...ariaProps, "aria-label": label }, groupState, ref)
    : // eslint-disable-next-line react-hooks/rules-of-hooks
      useCheckbox({ ...ariaProps, "aria-label": label }, state, ref);
  const { isFocusVisible, focusProps } = useFocusRing(ariaProps);
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const markIcon = isIndeterminate ? dashSmall : isSelected ? checkmarkSmall : "";

  return (
    <div>
      <label css={Css.df.itemsCenter.$}>
        <VisuallyHidden>
          <input ref={ref} {...inputProps} {...focusProps} />
        </VisuallyHidden>
        <span
          {...hoverProps}
          css={{
            ...baseStyles,
            ...((isSelected || isIndeterminate) && selectedStyles(isHovered)),
            ...(isDisabled && disabledStyles),
            ...(isFocusVisible && focusRingStyles),
            ...(isHovered && hoverStyles),
            ...markStyles,
          }}
          aria-hidden="true"
        >
          {markIcon}
        </span>
        {label && <div css={labelStyles(isDisabled)}>{label}</div>}
      </label>
      {description && <div css={descStyles(isDisabled)}>{description}</div>}
    </div>
  );
}

const baseStyles = Css.hPx(16).wPx(16).relative.cursorPointer.ba.bGray300.br4.bgWhite.transition.$;
const disabledStyles = Css.bGray400.bGray100.cursorNotAllowed.$;
const selectedStyles = (isHovered: boolean) => Css.bLightBlue700.if(!isHovered).bgLightBlue700.else.bgLightBlue900.$;
const focusRingStyles = Css.bshFocus.$;
const hoverStyles = Css.bLightBlue900.$;
const markStyles = { svg: Css.absolute.topPx(-1).leftPx(-1).$ };
function labelStyles(isDisabled: boolean) {
  return Css.pl1.smEm.if(isDisabled).gray800.$;
}
function descStyles(isDisabled: boolean) {
  return Css.pl3.sm.gray700.maxw(px(312)).if(isDisabled).gray300.$;
}

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
