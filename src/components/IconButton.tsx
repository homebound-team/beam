import type { AriaButtonProps } from "@react-types/button";
import { type RefObject, useMemo } from "react";
import { useButton, useFocusRing, useHover } from "react-aria";
import type { BeamColor } from "src/colors";
import { Icon, type IconProps } from "src/components/Icon";
import { maybeTooltip, resolveTooltip } from "src/components/Tooltip";
import { Css, Tokens } from "src/Css";
import { navLink } from "src/css/CssReset";
import { useGetRef } from "src/hooks/useGetRef";
import type { BeamButtonProps, BeamFocusableProps } from "src/interfaces";
import { getButtonOrLink } from "src/utils/getInteractiveElement";
import { noop } from "src/utils/helpers";
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
  buttonRef?: RefObject<HTMLButtonElement | null>;
  /**
   * Opts into the smaller size: 18px instead of 28px, or 32px instead of 48px for `circle` so the ring still pads the icon. `outline` ignores this.
   * Treat these sizes as interim — IconButton is expected to be revisited with Design System.
   */
  compact?: boolean;
  /** Visual variant of the button. Defaults to "default". */
  variant?: IconButtonVariant;
  /** Indicates that the button is active/selected */
  active?: boolean;
  /** `content` scales the icon. `button` scales the whole control. */
  pressScale?: "content" | "button";
  /** Denotes if this button is used to download a resource. Uses the anchor tag with the `download` attribute */
  download?: boolean;
  /** Provides label for screen readers - Will become a required soon */
  label?: string;
  /** Leaves the button out of the tab order. Pointer and assistive tech can still use it. */
  excludeFromTabOrder?: boolean;
  /** Sets `aria-expanded` when the button shows or hides additional content. */
  "aria-expanded"?: boolean;
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
    pressScale = "content",
    compact = false,
    variant = "default",
    download = false,
    forceFocusStyles = false,
    label,
    preventTooltip = false,
    excludeFromTabOrder,
    "aria-expanded": ariaExpanded,
    __storyState,
  } = props;
  const isDisabled = !!disabled;
  const ariaProps = {
    onPress,
    isDisabled,
    autoFocus,
    excludeFromTabOrder,
    "aria-expanded": ariaExpanded,
    ...menuTriggerProps,
  };
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
    const { base, hover, focus } = variantStyles(variant, { compact });
    return {
      ...iconButtonStylesReset,
      ...base,
      ...(isHovered && hover),
      ...((isFocusVisible || forceFocusStyles) && focus),
      ...(isDisabled && iconButtonStylesDisabled),
      ...(bgColor && Css.bgColor(bgColor).$),
    };
  }, [isHovered, isFocusVisible, isDisabled, compact, variant, bgColor, forceFocusStyles]);
  const iconColor = isCircle ? circleIconColor : defaultIconColor;

  const buttonAttrs = {
    ...testIds,
    ...buttonProps,
    ...focusProps,
    ...hoverProps,
    className: typeof onPress === "string" ? navLink : undefined,
    ref: ref as any,
    // Sticky pressed state. The momentary press is `:active` in `iconButtonIconCss`.
    ...(active || __storyState?.pressed ? { "data-pressed": "" } : {}),
    ...Css.props({ ...styles, ...(pressScale === "button" ? iconButtonSelfPressCss : iconButtonPressMarker) }),
    "aria-label": label,
  };
  const buttonContent = (
    <span {...testIds.icon} css={pressScale === "button" ? iconButtonIconLayoutCss : iconButtonIconCss}>
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
    </span>
  );

  // If we're disabled b/c of a non-boolean ReactNode, or the caller specified tooltip text, then show it in a tooltip.
  // Unless opted out via `preventTooltip`, the `label` is also surfaced as the tooltip.
  return maybeTooltip({
    ...testIds.tooltip,
    title: resolveTooltip(disabled ?? (preventTooltip ? undefined : label), tooltip),
    placement: "top",
    children: getButtonOrLink(buttonContent, onPress, buttonAttrs, openInNew, download),
  });
}

// Press scales only the icon. `:active` is the pointer/keyboard press; `[data-pressed]` is the sticky state.
// 150ms + standard easing match motion tokens `duration.fast` and `easing.standard`.
// Truss names the marker class from this binding. The value is unused after the build-time transform.
const iconButtonPress: unique symbol = Symbol.for("iconButtonPress");
const iconButtonPressMarker = Css.markerOf(iconButtonPress).$;
const iconButtonIconLayoutCss = Css.dif.aic.jcc.$;
const iconButtonIconCss = Css.dif.aic.jcc
  .scale(1)
  .add("transition", "scale 150ms cubic-bezier(0.4, 0, 0.2, 1)")
  .when(iconButtonPress, "ancestor", ":active:not(:disabled):not([aria-disabled=true])")
  .scale(0.9)
  .end.when(iconButtonPress, "ancestor", "[data-pressed]:not(:disabled):not([aria-disabled=true])")
  .scale(0.9).$;
const iconButtonSelfPressCss = Css.scale(1)
  .add("transition", "scale 150ms cubic-bezier(0.4, 0, 0.2, 1)")
  .when(":active:not(:disabled):not([aria-disabled=true])")
  .scale(0.9)
  .end.when("[data-pressed]:not(:disabled):not([aria-disabled=true])")
  .scale(0.9).$;

const defaultIconColor = Tokens.OnSurface;
const circleIconColor = Tokens.OnSurfaceMuted;
const iconButtonStylesReset = Css.bcTransparent.bss.bgTransparent.cursorPointer.outline0.dif.aic.jcc.transition.$;
const iconButtonStylesDisabled = Css.cursorNotAllowed.bgColor(Tokens.SurfaceDisabled).$;
function variantStyles(variant: IconButtonVariant, { compact }: { compact: boolean }) {
  if (variant === "circle") {
    // Blue100/200 hover fills have no semantic tokens — keep palette for those.
    return {
      base: Css.br100
        .sqPx(compact ? 32 : 48)
        .bc(Tokens.FieldBorderDefault)
        .ba.bw1.df.jcc.aic.bgColor(Tokens.SurfaceRaised).$,
      hover: Css.bgColor(Tokens.SurfaceRaisedHover).$,
      focus: Css.bgColor(Tokens.SurfaceRaisedHover).bc(Tokens.FieldBorderFocus).$,
    };
  }
  if (variant === "outline") {
    return {
      base: Css.br8.wPx(42).hPx(40).bcGray300.ba.bw1.df.jcc.aic.bgColor(Tokens.SurfaceRaised).$,
      hover: Css.bgColor(Tokens.SurfaceRaisedHover).$,
      focus: Css.bshFocus.$,
    };
  }
  return {
    base: compact ? Css.sqPx(18).br4.bw1.$ : Css.sqPx(28).br8.bw2.$,
    hover: Css.bgColor(Tokens.NeutralFillHoverStrong).$,
    focus: Css.bc(Tokens.FieldBorderFocus).$,
  };
}
