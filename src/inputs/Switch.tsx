import { ReactNode, useRef } from "react";
import { useFocusRing, useHover, useSwitch, VisuallyHidden } from "react-aria";
import { maybeTooltip, resolveTooltip } from "src/components";
import { Label } from "src/components/Label";
import { Css, Palette } from "src/Css";
import { Icon } from "../components/Icon";
import { toToggleState } from "../utils";

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
  labelStyle?: "form" | "inline" | "filter" | "hidden" | "left"; // TODO: Update `labelStyle` to make consistent with other `labelStyle` properties in the library
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
    disabled = false,
    onChange,
    withIcon,
    compact = false,
    label,
    labelStyle = "inline",
    ...otherProps
  } = props;
  const isDisabled = !!disabled;
  const ariaProps = { isSelected, isDisabled, ...otherProps };
  const state = toToggleState(isSelected, onChange);
  const ref = useRef(null);
  const { inputProps } = useSwitch({ ...ariaProps, "aria-label": label }, state, ref);
  const { isFocusVisible: isKeyboardFocus, focusProps } = useFocusRing(otherProps);
  const { hoverProps, isHovered } = useHover(ariaProps);
  const tooltip = resolveTooltip(disabled);

  return maybeTooltip({
    title: tooltip,
    placement: "top",
    children: (
      <label
        {...hoverProps}
        css={{
          ...Css.relative.cursorPointer.df.w("max-content").smMd.selectNone.$,
          ...((labelStyle === "form" || labelStyle === "left") && Css.w100.fdr.gap1.jcsb.$),
          ...(labelStyle === "inline" && Css.gap2.aic.$),
          ...(labelStyle === "filter" && Css.jcsb.gap1.aic.w("auto").sm.$),
          ...(isDisabled && Css.cursorNotAllowed.gray400.$),
        }}
        aria-label={label}
      >
        {(labelStyle === "form" || labelStyle === "left") && <Label label={label} />}
        {labelStyle === "filter" && <span>{label}</span>}
        {/* Background */}
        <div css={Css.if(labelStyle === "left").w50.$}>
          <div
            aria-hidden="true"
            css={{
              ...Css.wPx(40).hPx(toggleHeight(compact)).bgGray200.br12.relative.transition.$,
              ...(isHovered && switchHoverStyles),
              ...(isKeyboardFocus && switchFocusStyles),
              ...(isDisabled && Css.bgGray300.$),
              ...(isSelected && Css.bgLightBlue700.$),
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
                <Icon icon={isSelected ? "check" : "x"} color={isSelected ? Palette.LightBlue700 : Palette.Gray400} />
              )}
            </div>
          </div>
        </div>
        {/* Since we are using childGap, we must wrap the label in an element and
        match the height of the icon for horizontal alignment */}
        {labelStyle === "inline" && (
          <span
            css={{
              // LineHeight is conditionally applied to handle compact version text alignment
              ...Css.if(compact).add("lineHeight", "1").$,
            }}
          >
            {label}
          </span>
        )}
        <VisuallyHidden>
          <input ref={ref} {...inputProps} {...focusProps} />
        </VisuallyHidden>
      </label>
    ),
  });
}

/** Styles */
// Element sizes
const toggleHeight = (isCompact: boolean) => (isCompact ? 16 : 24);
const circleDiameter = (isCompact: boolean) => (isCompact ? 12 : 20);

// Switcher/Toggle element styles
export const switchHoverStyles = Css.bgGray400.$;
export const switchFocusStyles = Css.bshFocus.$;
export const switchSelectedHoverStyles = Css.bgLightBlue900.$;

// Circle inside Switcher/Toggle element styles
const switchCircleDefaultStyles = (isCompact: boolean) => ({
  ...Css.wPx(circleDiameter(isCompact))
    .hPx(circleDiameter(isCompact))
    .br100.bgWhite.bshBasic.absolute.leftPx(2)
    .topPx(2).transition.df.aic.jcc.$,
  svg: Css.hPx(toggleHeight(isCompact) / 2).wPx(toggleHeight(isCompact) / 2).$,
});

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
