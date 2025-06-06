import { ReactNode, useRef } from "react";
import { useFocusRing, useHover, useSwitch, VisuallyHidden } from "react-aria";
import { resolveTooltip } from "src/components";
import { Label } from "src/components/Label";
import { usePresentationContext } from "src/components/PresentationContext";
import { Css, Palette } from "src/Css";
import { Icon } from "../components/Icon";
import { toToggleState, useTestIds } from "../utils";

export interface SwitchProps {
  /** Whether the element should receive focus on render. */
  autoFocus?: boolean;
  /** Whether to render a compact version of Switch */
  compact?: boolean;
  /** Whether the field is disabled. If a ReactNode, it's treated as a "disabled reason" that's shown in a tooltip. */
  disabled?: boolean | ReactNode;
  /** Input label */
  label: string;
  /** Where to put the label. */
  labelStyle?: "form" | "inline" | "filter" | "hidden" | "left" | "centered"; // TODO: Update `labelStyle` to make consistent with other `labelStyle` properties in the library
  /** Whether to hide the label */
  hideLabel?: boolean;
  /** Handler when the interactive element state changes. */
  onChange: (value: boolean) => void;
  /** Whether the switch is selected */
  selected: boolean;
  /** Whether to include icons like the check mark */
  withIcon?: boolean;
  /** Adds tooltip for the switch */
  tooltip?: ReactNode;
}

export function Switch(props: SwitchProps) {
  const { fieldProps } = usePresentationContext();
  const { labelLeftFieldWidth = "50%" } = fieldProps ?? {};
  const {
    selected: isSelected,
    disabled = false,
    onChange,
    withIcon,
    compact = false,
    label,
    labelStyle = "inline",
    hideLabel = false,
    ...otherProps
  } = props;
  const isDisabled = !!disabled;
  const ariaProps = { isSelected, isDisabled, ...otherProps };
  const state = toToggleState(isSelected, onChange);
  const ref = useRef(null);
  const { inputProps } = useSwitch({ ...ariaProps, "aria-label": label }, state, ref);
  const { isFocusVisible: isKeyboardFocus, focusProps } = useFocusRing(otherProps);
  const { hoverProps, isHovered } = useHover(ariaProps);
  const tooltip = resolveTooltip(disabled, props.tooltip);
  const tid = useTestIds(otherProps, label);

  return (
    <label
      {...hoverProps}
      css={{
        ...Css.relative.cursorPointer.df.wmaxc.usn.$,
        ...(labelStyle === "form" && Css.fdc.$),
        ...(labelStyle === "left" && Css.w100.aic.jcsb.$),
        ...(labelStyle === "inline" && Css.gap2.aic.$),
        ...(labelStyle === "filter" && Css.jcsb.gap1.aic.wa.sm.$),
        ...(labelStyle === "centered" && Css.fdc.aic.$),
        ...(isDisabled && Css.cursorNotAllowed.gray400.$),
      }}
    >
      {labelStyle !== "inline" && labelStyle !== "hidden" && (
        <div>
          <Label
            label={label}
            tooltip={tooltip}
            xss={Css.if(labelStyle === "filter").gray900.$}
            inline={labelStyle === "left" || labelStyle === "filter"}
          />
        </div>
      )}
      <div css={Css.if(labelStyle === "left").w(labelLeftFieldWidth).$}>
        {/* Background */}
        <div
          aria-hidden="true"
          css={{
            ...Css.wPx(toggleWidth(compact)).hPx(toggleHeight(compact)).bgGray200.br12.relative.transition.$,
            ...(isHovered && switchHoverStyles),
            ...(isKeyboardFocus && switchFocusStyles),
            ...(isDisabled && Css.bgGray300.$),
            ...(isSelected && Css.bgBlue700.$),
            ...(isSelected && isHovered && switchSelectedHoverStyles),
          }}
        >
          {/* Circle */}
          <div
            css={{
              ...switchCircleDefaultStyles(compact),
              ...(isDisabled && Css.bgGray100.$),
              ...(isSelected && switchCircleSelectedStyles(compact)),
            }}
          >
            {/* Icon */}
            {withIcon && (
              <Icon icon={isSelected ? "check" : "x"} color={isSelected ? Palette.Blue700 : Palette.Gray400} />
            )}
          </div>
        </div>
      </div>
      {/* Since we are using childGap, we must wrap the label in an element and
        match the height of the icon for horizontal alignment */}
      {labelStyle === "inline" && (
        <Label label={label} tooltip={tooltip} inline xss={Css.smMd.gray900.if(compact).add("lineHeight", "1").$} />
      )}
      <VisuallyHidden>
        <input ref={ref} {...inputProps} {...focusProps} {...tid} />
      </VisuallyHidden>
    </label>
  );
}

/** Styles */
// Element sizes
const toggleHeight = (isCompact: boolean) => (isCompact ? 16 : 24);
const toggleWidth = (isCompact: boolean) => (isCompact ? 32 : 40);
const circleDiameter = (isCompact: boolean) => (isCompact ? 12 : 20);

// Switcher/Toggle element styles
export const switchHoverStyles = Css.bgGray400.$;
export const switchFocusStyles = Css.bshFocus.$;
export const switchSelectedHoverStyles = Css.bgBlue900.$;

// Circle inside Switcher/Toggle element styles
function switchCircleDefaultStyles(isCompact: boolean) {
  return {
    ...Css.wPx(circleDiameter(isCompact))
      .hPx(circleDiameter(isCompact))
      .br100.bgWhite.bshBasic.absolute.leftPx(2)
      .topPx(2).transition.df.aic.jcc.$,
    svg: Css.hPx(toggleHeight(isCompact) / 2).wPx(toggleHeight(isCompact) / 2).$,
  };
}

/**
 * Affecting the `left` property due to transitions only working when there is
 * a previous value to work from.
 *
 * Calculation is as follows:
 * - `100%` is the toggle width
 * - `${circleDiameter(isCompact)}px` is the circle diameter
 * - `2px` is to keep 2px edge spacing.
 */
function switchCircleSelectedStyles(isCompact: boolean) {
  return Css.left(`calc(100% - ${circleDiameter(isCompact)}px - 2px);`).$;
}
