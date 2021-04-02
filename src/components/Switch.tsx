import type { ToggleState } from "@react-stately/toggle";
import { useRef } from "react";
import { useFocusRing, useHover, useSwitch, VisuallyHidden } from "react-aria";
import { Palette } from "../Css";
import { Css, Icon } from "../index";
import type { BeamDisabledProps, BeamFocusableProps, BeamLabelProps, BeamOnChangeProps } from "../interfaces";

export interface SwitchProps extends BeamFocusableProps, BeamDisabledProps, BeamOnChangeProps<boolean>, BeamLabelProps {
  /** Whether the switch is selected */
  selected?: boolean;
  /** Whether to include icons like the check mark */
  withIcon?: boolean;
  /** Whether to render a compact version of Switch */
  compact?: boolean;
  /**
   * The value of the input element
   * TODO: @KoltonG match the pattern of when these are needed to be used. This
   * should not be on it's own. Any input needs a value for its group version.
   */
  value?: string;
}

export function Switch(props: SwitchProps) {
  const { selected: isSelected = false, disabled: isDisabled = false, ...otherProps } = props;
  const ariaProps = { isSelected, isDisabled, ...otherProps };
  const { onChange, withIcon, compact, label } = ariaProps;

  const state = useStatelessToggleState(isSelected, onChange);
  const ref = useRef(null);
  const { inputProps } = useSwitch(ariaProps, state, ref);
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
      <VisuallyHidden>
        <input ref={ref} {...inputProps} {...focusProps} />
      </VisuallyHidden>
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
      {label}
    </label>
  );
}

/** Styles */
// Element sizes
const toggleHeight = (isCompact: boolean) => (isCompact ? 16 : 24);
const toggleWidth = (isCompact: boolean) => (isCompact ? 44 : 40);
const circleDiameter = (isCompact: boolean) => (isCompact ? 14 : 20);

// Label styles
// TODO: @KoltonG Truss could use this
const switchLabelDefaultStyles = Css.cursorPointer.df.itemsCenter.gap2.w("max-content").smEm.$;
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

/** Stateless useToggleState */
function useStatelessToggleState(isSelected: boolean, onChange: (value: boolean) => void): ToggleState {
  return {
    isSelected,
    setSelected: onChange,
    toggle: () => onChange(!isSelected),
  };
}
