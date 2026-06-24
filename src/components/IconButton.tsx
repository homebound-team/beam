import { AriaButtonProps } from "@react-types/button";
import { RefObject, useMemo } from "react";
import { useButton, useFocusRing, useHover } from "react-aria";
import { BeamColor } from "src/colors";
import { Icon, IconProps, maybeTooltip, navLink, resolveTooltip } from "src/components";
import { Css, Palette, Tokens } from "src/Css";
import { useGetRef } from "src/hooks/useGetRef";
import { BeamButtonProps, BeamFocusableProps } from "src/interfaces";
import { noop } from "src/utils";
import { getButtonOrLink } from "src/utils/getInteractiveElement";
import { useTestIds } from "src/utils/useTestIds";

export type IconButtonVariant = "default" | "circle" | "outline";

export type IconButtonProps = {
  /** The icon to use within the button. */
  icon: IconProps["icon"];
  color?: BeamColor;
  bgColor?: BeamColor;
  /** The size of the icon, in increments, defaults to 3 which is 24px. */
  inc?: number;
  /** HTML attributes to apply to the button element when it is being used to trigger a menu. */
  menuTriggerProps?: AriaButtonProps;
  buttonRef?: RefObject<HTMLButtonElement>;
  /** Whether to show a 16x16px version of the IconButton */
  compact?: boolean;
  /** Visual variant of the button. Defaults to "default". */
  variant?: IconButtonVariant;
  /** Indicates that the button is active/selected */
  active?: boolean;
  /** Denotes if this button is used to download a resource. Uses the anchor tag with the `download` attribute */
  download?: boolean;
  /** Provides label for screen readers - Will become a required soon */
  label?: string;
  /**
   * By default the `label` is also surfaced as a hover tooltip. Set this to keep the `aria-label`
   * for screen readers without showing the tooltip. An explicit `tooltip` or disabled reason still shows.
   */
  preventTooltip?: boolean;
} & BeamButtonProps &
  BeamFocusableProps;

export function IconButton(props: IconButtonProps) {
  const {
    onClick: onPress,
    disabled,
    color,
    bgColor,
    icon,
    autoFocus,
    inc,
    buttonRef,
    tooltip,
    menuTriggerProps,
    openInNew,
    active = false,
    compact = false,
    variant = "default",
    download = false,
    forceFocusStyles = false,
    label,
    preventTooltip = false,
  } = props;
  const isDisabled = !!disabled;
  const ariaProps = { onPress, isDisabled, autoFocus, ...menuTriggerProps };
  const ref = useGetRef(buttonRef);
  const { buttonProps } = useButton(
    {
      ...ariaProps,
      onPress: typeof onPress === "string" ? noop : onPress,
      elementType: typeof onPress === "string" ? "a" : "button",
    },
    ref,
  );
  const { focusProps, isFocusVisible } = useFocusRing(ariaProps);
  const { hoverProps, isHovered } = useHover(ariaProps);
  const testIds = useTestIds(props, icon);

  const isCircle = variant === "circle";
  const isOutline = variant === "outline";
  const styles = useMemo(() => {
    const variantKey = isCircle ? "circle" : isOutline ? "outline" : compact ? "compact" : "default";
    const vs = variantStyles[variantKey];
    return {
      ...iconButtonStylesReset,
      ...vs.base,
      ...(isHovered && vs.hover),
      ...((isFocusVisible || forceFocusStyles) && vs.focus),
      ...(active && vs.pressed),
      ...(isDisabled && iconButtonStylesDisabled),
      ...(bgColor && Css.bgColor(bgColor).$),
    };
  }, [isHovered, isFocusVisible, isDisabled, compact, isCircle, isOutline, active, bgColor, forceFocusStyles]);
  const iconColor = isCircle ? circleIconColor : defaultIconColor;

  const buttonAttrs = {
    ...testIds,
    ...buttonProps,
    ...focusProps,
    ...hoverProps,
    className: typeof onPress === "string" ? navLink : undefined,
    ref: ref as any,
    ...Css.props(styles),
    "aria-label": label,
  };
  const buttonContent = (
    <Icon
      icon={icon}
      color={
        color ||
        (isDisabled
          ? Tokens.TextDisabled
          : isCircle && (isHovered || active || isFocusVisible)
            ? defaultIconColor
            : iconColor)
      }
      bgColor={bgColor}
      inc={compact ? 2 : isCircle ? 2.5 : inc}
    />
  );

  // If we're disabled b/c of a non-boolean ReactNode, or the caller specified tooltip text, then show it in a tooltip.
  // Unless opted out via `preventTooltip`, the `label` is also surfaced as the tooltip.
  return maybeTooltip({
    title: resolveTooltip(disabled ?? (preventTooltip ? undefined : label), tooltip),
    placement: "top",
    children: getButtonOrLink(buttonContent, onPress, buttonAttrs, openInNew, download),
  });
}

const defaultIconColor = Tokens.OnSurface;
const circleIconColor = Palette.Gray700;
const iconButtonStylesReset = Css.bcTransparent.bss.bgTransparent.cursorPointer.outline0.dif.aic.jcc.transition.$;
const iconButtonNormal = Css.hPx(28).wPx(28).br8.bw2.$;
const iconButtonCompact = Css.hPx(18).wPx(18).br4.bw1.$;
const iconButtonCircle = Css.br100.wPx(48).hPx(48).bcGray300.ba.bw1.df.jcc.aic.$;
const iconButtonOutline = Css.br8.wPx(42).hPx(40).bgColor(Tokens.Surface).bcGray300.ba.bw1.df.jcc.aic.$;
/** Semantic hover fill; contrast is driven by `--b-*` when inside {@link ContrastScope}. */
const iconButtonTokenHover = Css.bgColor(Tokens.NeutralFillHoverStrong).$;
export const iconButtonStylesHover = Css.bgGray200.$;
export const iconButtonContrastStylesHover = iconButtonTokenHover;
export const iconButtonCircleStylesHover = Css.bgBlue100.bcBlue200.$;
const iconButtonOutlineStylesHover = Css.bgGray100.$;
const iconButtonOutlineStylesFocus = Css.boxShadow(`0 0 0 2px #ffffff, 0 0 0 5px var(${Tokens.Primary})`).$;
const iconButtonStylesFocus = Css.bcBlue700.$;
const iconButtonCircleStylesFocus = Css.bgBlue100.bcBlue700.$;
const iconButtonStylesDisabled = Css.cursorNotAllowed.$;
const activeStylesCircle = Css.bgGray200.bcGray200.$;
const activeStylesOutline = Css.bgGray200.$;
const variantStyles = {
  default: {
    base: iconButtonNormal,
    hover: iconButtonTokenHover,
    focus: iconButtonStylesFocus,
    pressed: iconButtonTokenHover,
  },
  compact: {
    base: iconButtonCompact,
    hover: iconButtonTokenHover,
    focus: iconButtonStylesFocus,
    pressed: iconButtonTokenHover,
  },
  circle: {
    base: iconButtonCircle,
    hover: iconButtonCircleStylesHover,
    focus: iconButtonCircleStylesFocus,
    pressed: activeStylesCircle,
  },
  outline: {
    base: iconButtonOutline,
    hover: iconButtonOutlineStylesHover,
    focus: iconButtonOutlineStylesFocus,
    pressed: activeStylesOutline,
  },
} as const;
