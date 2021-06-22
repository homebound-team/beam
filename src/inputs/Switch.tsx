import { useRef } from "react";
import { useFocusRing, useHover, useSwitch, VisuallyHidden } from "react-aria";
import { Palette } from "../Css";
import { Css, Icon } from "../index";
import { toToggleState } from "../utils";

export interface SwitchProps {
  /** Whether the element should receive focus on render. */
  autoFocus?: boolean;
  /** Whether to render a compact version of Switch */
  compact?: boolean;
  /** Whether the interactive element is disabled. */
  disabled?: boolean;
  /** Input label */
  label: string;
  /** Handler when the interactive element state changes. */
  onChange: (value: boolean) => void;
  /** Whether the switch is selected */
  selected: boolean;
  /** Whether to include icons like the check mark */
  withIcon?: boolean;
}

export function Switch(props: SwitchProps) {
  const {
    selected: isSelected,
    disabled: isDisabled = false,
    onChange,
    withIcon,
    compact = false,
    label,
    ...otherProps
  } = props;
  const ariaProps = { isSelected, isDisabled, ...otherProps };
  const state = toToggleState(isSelected, onChange);
  const ref = useRef(null);
  const { inputProps } = useSwitch({ ...ariaProps, "aria-label": label }, state, ref);
  const { isFocusVisible: isKeyboardFocus, focusProps } = useFocusRing(otherProps);
  const { hoverProps, isHovered } = useHover(ariaProps);

  return (
    <label
      {...hoverProps}
      css={{
        ...switchLabelDefaultStyles,
        ...(isDisabled && switchLabelDisabledStyles),
      }}
    >
      {/* Background */}
      <div
        aria-hidden="true"
        css={{
          ...switchDefaultStyles(compact),
          ...(isHovered && switchHoverStyles),
          ...(isKeyboardFocus && switchFocusStyles),
          ...(isDisabled && switchDisabledStyles),
          ...(isSelected && switchSelectedStyles),
          ...(isSelected && isHovered && switchSelectedHoverStyles),
        }}
      >
        {/* Circle */}
        <div
          css={{
            ...switchCircleDefaultStyles(compact),
            ...(isDisabled && switchCircleDisabledStyles),
            ...(isSelected && switchCircleSelectedStyles(compact)),
          }}
        >
          {/* Icon */}
          {withIcon && (
            <Icon icon={isSelected ? "check" : "x"} color={isSelected ? Palette.LightBlue700 : Palette.Gray400} />
          )}
        </div>
      </div>
      {/* Since we are using childGap, we must wrap the label in an element and
      match the height of the icon for horizontal alignment */}
      <span css={switchTextStyles(compact)}>{label}</span>
      <VisuallyHidden>
        <input ref={ref} {...inputProps} {...focusProps} />
      </VisuallyHidden>
    </label>
  );
}

/** Styles */
// Element sizes
const toggleHeight = (isCompact: boolean) => (isCompact ? 16 : 24);
const toggleWidth = (isCompact: boolean) => (isCompact ? 44 : 40);
const circleDiameter = (isCompact: boolean) => (isCompact ? 14 : 20);

// Label styles
const switchLabelDefaultStyles = Css.relative.cursorPointer.df.itemsCenter.childGap2.w("max-content").smEm.selectNone.$;
const switchLabelDisabledStyles = Css.cursorNotAllowed.gray400.$;

// Switcher/Toggle element styles
const switchDefaultStyles = (isCompact: boolean) =>
  Css.wPx(toggleWidth(isCompact)).hPx(toggleHeight(isCompact)).bgGray200.br12.relative.transition.$;
export const switchHoverStyles = Css.bgGray400.$;
export const switchFocusStyles = Css.bshFocus.$;
const switchDisabledStyles = Css.bgGray300.$;
const switchSelectedStyles = Css.bgLightBlue700.$;
export const switchSelectedHoverStyles = Css.bgLightBlue900.$;

// Circle inside Switcher/Toggle element styles
const switchCircleDefaultStyles = (isCompact: boolean) => ({
  ...Css.wPx(circleDiameter(isCompact))
    .hPx(circleDiameter(isCompact))
    .br100.bgWhite.bshBasic.absolute.leftPx(2)
    .topPx(isCompact ? 1 : 2).transition.df.itemsCenter.justifyCenter.$,
  svg: Css.hPx(toggleHeight(isCompact) / 2).wPx(toggleHeight(isCompact) / 2).$,
});
const switchCircleDisabledStyles = Css.bgGray100.$;

/**
 * Affecting the `left` property due to transitions only working when there is
 * a previous value to work from.
 *
 * Calculation is as follow:
 * - `100%` is the toggle width
 * - `${circleDiameter(isCompact)}px` is the circle diameter
 * - `2px` is to keep 2px edge spacing.
 */
const switchCircleSelectedStyles = (isCompact: boolean) =>
  Css.left(`calc(100% - ${circleDiameter(isCompact)}px - 2px);`).$;

const switchTextStyles = (isCompact: boolean) =>
  // LineHeight is conditionally applied to handle compact version text alignment
  Css.hPx(toggleHeight(isCompact)).if(isCompact).add("lineHeight", "1").$;
