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
  onChange?: (selected: boolean) => void;
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
  const checkboxProps = { ...ariaProps, "aria-label": label };
  const ref = useRef(null);
  const toggleState = useToggleState(ariaProps);
  const isSelected = toggleState.isSelected;
  const { isFocusVisible, focusProps } = useFocusRing(ariaProps);
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const markIcon = isIndeterminate ? dashSmall : isSelected ? checkmarkSmall : "";

  // Swap hooks depending on whether this checkbox is inside a CheckboxGroup.
  // This is a bit unorthodox. Typically, hooks cannot be called in a conditional,
  // but since the checkbox won't move in and out of a group, it should be safe.
  const { inputProps } = groupState
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      useCheckboxGroupItem(checkboxProps, groupState, ref)
    : // eslint-disable-next-line react-hooks/rules-of-hooks
      useCheckbox(checkboxProps, toggleState, ref);

  return (
    <label css={Css.df.cursorPointer.if(isDisabled).cursorNotAllowed.$}>
      <VisuallyHidden>
        <input ref={ref} {...inputProps} {...focusProps} />
      </VisuallyHidden>
      <span
        {...hoverProps}
        css={{
          ...baseStyles,
          ...((isSelected || isIndeterminate) && filledBoxStyles),
          ...((isSelected || isIndeterminate) && isHovered && filledBoxHoverStyles),
          ...(isDisabled && disabledBoxStyles),
          ...(isFocusVisible && focusRingStyles),
          ...(isHovered && hoverBorderStyles),
          ...markStyles,
        }}
        aria-hidden="true"
      >
        {markIcon}
      </span>
      <div css={Css.ml1.$}>
        {label && <div css={{ ...labelStyles, ...(isDisabled && disabledFont) }}>{label}</div>}
        {description && <div css={{ ...descStyles, ...(isDisabled && disabledFont) }}>{description}</div>}
      </div>
    </label>
  );
}

const baseStyles = Css.hPx(16).wPx(16).relative.ba.bGray300.br4.bgWhite.transition.topPx(2).$;
const filledBoxStyles = Css.bLightBlue700.bgLightBlue700.$;
const filledBoxHoverStyles = Css.bgLightBlue900.$;
const disabledBoxStyles = Css.bGray400.bGray100.$;
const disabledFont = Css.gray300.$;
const focusRingStyles = Css.bshFocus.$;
const hoverBorderStyles = Css.bLightBlue900.$;
const markStyles = { svg: Css.absolute.topPx(-1).leftPx(-1).$ };
const labelStyles = Css.smEm.$;
const descStyles = Css.sm.gray700.maxw(px(312)).$;

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
