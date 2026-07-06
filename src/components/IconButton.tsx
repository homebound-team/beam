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
  /** Storybook-only visual state overrides for snapshotting pseudo-interactions. */
  __storyState?: {
    hovered?: boolean;
    focusVisible?: boolean;
    pressed?: boolean;
  };
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
    __storyState,
  } = props;
  const isDisabled = !!disabled;
  const ariaProps = { onPress, isDisabled, autoFocus, ...menuTriggerProps };
  const ref = useGetRef(buttonRef);
  const { buttonProps, isPressed: isPressedFromEvents } = useButton(
    {
      ...ariaProps,
      onPress: typeof onPress === "string" ? noop : onPress,
      elementType: typeof onPress === "string" ? "a" : "button",
    },
    ref,
  );
  const isPressed = __storyState?.pressed ?? isPressedFromEvents;
  const isPressing = isPressed || active;
  const { focusProps, isFocusVisible: isFocusVisibleFromEvents } = useFocusRing(ariaProps);
  const { hoverProps, isHovered: isHoveredFromEvents } = useHover(ariaProps);
  const isHovered = __storyState?.hovered ?? isHoveredFromEvents;
  const isFocusVisible = __storyState?.focusVisible ?? isFocusVisibleFromEvents;
  const testIds = useTestIds(props, icon);

  const isCircle = variant === "circle";
  const isOutline = variant === "outline";
  const styles = useMemo(() => {
    const variantKey = isCircle ? "circle" : isOutline ? "outline" : compact ? "compact" : "default";
    const { base, hover, focus, pressed } = variantStyles[variantKey];
    return {
      ...iconButtonStylesReset,
      ...base,
      ...(isHovered && hover),
      ...((isFocusVisible || forceFocusStyles) && focus),
      ...(isPressing && pressed),
      ...(isDisabled && iconButtonStylesDisabled),
      ...(bgColor && Css.bgColor(bgColor).$),
    };
  }, [isHovered, isFocusVisible, isDisabled, compact, isCircle, isOutline, isPressing, bgColor, forceFocusStyles]);
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
          ? Tokens.OnSurfaceDisabled
          : isOutline && isPressing
            ? Tokens.OnSurfaceRaisedPressed
            : isOutline && isHovered
              ? Tokens.OnSurfaceRaisedHover
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
const iconButtonStylesDisabled = Css.cursorNotAllowed.bgColor(Tokens.SurfaceDisabled).$;
const variantStyles = {
  default: {
    base: Css.hPx(28).wPx(28).br8.bw2.$,
    hover: Css.bgColor(Tokens.NeutralFillHoverStrong).$,
    focus: Css.bcBlue700.$,
    pressed: Css.bgColor(Tokens.NeutralFillHoverStrong).$,
  },
  compact: {
    base: Css.hPx(18).wPx(18).br4.bw1.$,
    hover: Css.bgColor(Tokens.NeutralFillHoverStrong).$,
    focus: Css.bcBlue700.$,
    pressed: Css.bgColor(Tokens.NeutralFillHoverStrong).$,
  },
  circle: {
    base: Css.br100.wPx(48).hPx(48).bcGray300.ba.bw1.df.jcc.aic.$,
    hover: Css.bgBlue100.bcBlue200.$,
    focus: Css.bgBlue100.bcBlue700.$,
    pressed: Css.bgGray200.bcGray200.$,
  },
  outline: {
    base: Css.br8.wPx(42).hPx(40).bcGray300.ba.bw1.df.jcc.aic.bgColor(Tokens.SurfaceRaised).$,
    hover: Css.bgColor(Tokens.SurfaceRaisedHover).$,
    focus: Css.bshFocus.$,
    pressed: Css.bgColor(Tokens.SurfaceRaisedPressed).$,
  },
} as const;
