import type { AriaButtonProps } from "@react-types/button";
import { type ButtonHTMLAttributes, type ReactNode, type RefObject, useMemo, useState } from "react";
import { useButton, useFocusRing, useHover } from "react-aria";
import { Icon, type IconProps } from "src/components/Icon";
import { Loader } from "src/components/Loader";
import { maybeTooltip, resolveTooltip } from "src/components/Tooltip";
import { Css, Palette, type Properties, Tokens } from "src/Css";
import { navLink } from "src/css/CssReset";
import { useGetRef } from "src/hooks/useGetRef";
import type { BeamButtonProps, BeamFocusableProps } from "src/interfaces";
import { getButtonOrLink } from "src/utils/getInteractiveElement";
import { isAbsoluteUrl, isPromise, noop } from "src/utils/helpers";
import { useTestIds } from "src/utils/useTestIds";
import { labelOr } from "./internal/OverlayTrigger";

export type ButtonProps = {
  label: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconProps["icon"] | null;
  /** Displays contents after the Button's label. Will be ignored for Buttons rendered as a link with an absolute URL */
  endAdornment?: ReactNode;
  /** HTML attributes to apply to the button element when it is being used to trigger a menu. */
  menuTriggerProps?: AriaButtonProps;
  buttonRef?: RefObject<HTMLElement | null>;
  /** Allow for setting "submit" | "button" | "reset" on button element */
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  /** Denotes if this button is used to download a resource. Uses the anchor tag with the `download` attribute */
  download?: boolean;

  /** Additional text to further customize button during an async request is in progress. */
  labelInFlight?: string;
  /** Keeps the pressed text scale applied (useful when a menu is open). */
  active?: boolean;
  /** Tint fill + border. Only applied when `variant` is `secondary`; ignored otherwise. */
  colorScheme?: ButtonColorScheme;
  /** Fills the container's width and centers the label. */
  fullWidth?: boolean;
  /** `content` scales the label. `button` scales the whole control. */
  pressScale?: "content" | "button";
} & BeamButtonProps &
  BeamFocusableProps;

export function Button(props: ButtonProps) {
  const {
    onClick: onPress,
    disabled,
    endAdornment,
    menuTriggerProps,
    tooltip,
    openInNew,
    download,
    forceFocusStyles = false,
    active = false,
    labelInFlight,
    colorScheme,
    fullWidth = false,
    pressScale = "content",
    ...otherProps
  } = props;
  const asLink = typeof onPress === "string";
  const showExternalLinkIcon = (asLink && isAbsoluteUrl(onPress)) || openInNew;
  const [asyncInProgress, setAsyncInProgress] = useState(false);
  const isDisabled = !!disabled;
  const ariaProps = { onPress, isDisabled: isDisabled || asyncInProgress, ...otherProps, ...menuTriggerProps };
  const {
    label,
    // Default the icon based on other properties.
    icon = download ? "download" : showExternalLinkIcon ? "linkExternal" : undefined,
    variant = "primary",
    size = "md",
    buttonRef,
  } = ariaProps;
  const ref = useGetRef(buttonRef);
  const tid = useTestIds(props, labelOr(ariaProps, "button"));
  const { buttonProps } = useButton(
    {
      ...ariaProps,
      onPress: asLink
        ? noop
        : (e) => {
            const result = onPress(e);
            if (isPromise(result)) {
              setAsyncInProgress(true);
              void result.finally(() => setAsyncInProgress(false));
            }
            return result;
          },
      elementType: asLink ? "a" : "button",
    },
    ref as RefObject<HTMLElement>,
  );
  const { isFocusVisible, focusProps } = useFocusRing(ariaProps);
  const { hoverProps, isHovered } = useHover(ariaProps);
  const { baseStyles, hoverStyles, disabledStyles, focusStyles } = useMemo(
    () => getButtonStyles(variant, size, colorScheme),
    [variant, size, colorScheme],
  );

  const buttonContent = (
    // Scales as one cluster so the icon stays aligned with the label. The button box does not scale.
    <span {...tid.content} css={pressScale === "button" ? buttonContentCss : buttonLabelCss}>
      {icon && <Icon xss={iconStyles[size]} icon={icon} />}
      {labelInFlight && asyncInProgress ? labelInFlight : label}
      {(endAdornment || asyncInProgress) && (
        <span css={Css.ml1.$}>{asyncInProgress ? <Loader size={"xs"} /> : endAdornment}</span>
      )}
    </span>
  );

  const buttonAttrs = {
    ref: ref as any,
    ...buttonProps,
    ...focusProps,
    ...hoverProps,
    className: asLink ? navLink : undefined,
    // Sticky pressed state (open menu). The momentary press is `:active` in `buttonLabelCss`.
    ...(active ? { "data-pressed": "" } : {}),
    ...Css.props({
      ...Css.buttonBase.tt("inherit").if(fullWidth).w100.jcc.$,
      ...baseStyles,
      ...(isHovered ? hoverStyles : {}),
      ...(isDisabled || asyncInProgress ? { ...disabledStyles, ...Css.cursorNotAllowed.$ } : {}),
      ...(isFocusVisible || forceFocusStyles ? focusStyles : {}),
      ...(pressScale === "button" ? buttonSelfPressCss : buttonPressMarker),
    }),
    ...tid,
  };

  // If we're disabled b/c of a non-boolean ReactNode, or the caller specified tooltip text, then show it in a tooltip
  return maybeTooltip({
    title: resolveTooltip(disabled, tooltip),
    placement: "bottom",
    children: getButtonOrLink(buttonContent, onPress, buttonAttrs, openInNew, download),
  });
}

// Press scales the label. `:active` is the pointer/keyboard press; `[data-pressed]` is the sticky `active` prop.
// 150ms + standard easing match motion tokens `duration.fast` and `easing.standard`.
// Truss names the marker class from this binding. The value is unused after the build-time transform.
const buttonPress: unique symbol = Symbol.for("buttonPress");
const buttonPressMarker = Css.markerOf(buttonPress).$;
const buttonContentCss = Css.dif.aic.$;
const buttonLabelCss = Css.dif.aic
  .scale(1)
  .add("transition", "scale 150ms cubic-bezier(0.4, 0, 0.2, 1)")
  .when(buttonPress, "ancestor", ":active:not(:disabled):not([aria-disabled=true])")
  .scale(0.95)
  .end.when(buttonPress, "ancestor", "[data-pressed]:not(:disabled):not([aria-disabled=true])")
  .scale(0.95).$;
const buttonSelfPressCss = Css.scale(1)
  .add("transition", "scale 150ms cubic-bezier(0.4, 0, 0.2, 1)")
  .when(":active:not(:disabled):not([aria-disabled=true])")
  .scale(0.95)
  .end.when("[data-pressed]:not(:disabled):not([aria-disabled=true])")
  .scale(0.95).$;

function getButtonStyles(variant: ButtonVariant, size: ButtonSize, colorScheme?: ButtonColorScheme) {
  const styles = variant === "secondary" && colorScheme ? colorSchemeStyles[colorScheme] : variantStyles[variant];
  if (variant === "text") {
    // The text variant does not support the 'size'. The `size` prop only effects the button's height and padding which is not relevant for this variant.
    return styles;
  }
  return {
    ...styles,
    baseStyles: Css.with(styles.baseStyles).with(sizeStyles[size]).$,
  };
}

const variantStyles: Record<
  ButtonVariant,
  {
    baseStyles: Properties;
    hoverStyles: Properties;
    disabledStyles: Properties;
    focusStyles: Properties;
  }
> = {
  // Design applies their "AI Bold" ramp to the existing primary button. They haven't specified
  // hover/disabled, so those ramps are extrapolated from it rather than design-sourced.
  ai: {
    baseStyles: Css.aiBoldBg.color(Tokens.OnPrimary).$,
    hoverStyles: Css.add("backgroundImage", `linear-gradient(270deg, ${Palette.Blue800}, ${Palette.Purple800})`).$,
    disabledStyles: Css.add(
      "backgroundImage",
      `linear-gradient(270deg, ${Palette.Blue200}, ${Palette.Purple200})`,
    ).color(Tokens.ButtonPrimaryDisabledFg).$,
    focusStyles: Css.bshFocus.$,
  },

  primary: {
    baseStyles: Css.bgColor(Tokens.Primary).color(Tokens.OnPrimary).$,
    hoverStyles: Css.bgColor(Tokens.PrimaryHover).$,
    disabledStyles: Css.bgColor(Tokens.ButtonPrimaryDisabledBg).color(Tokens.ButtonPrimaryDisabledFg).$,
    focusStyles: Css.bshFocus.$,
  },

  secondary: {
    baseStyles: Css.bgColor(Tokens.Surface).bc(Tokens.FieldBorderDefault).bw1.ba.color(Tokens.ButtonSecondaryFg).$,
    hoverStyles: Css.bgColor(Tokens.NeutralFillHoverSubtle).$,
    disabledStyles: Css.bgColor(Tokens.Surface).color(Tokens.TextLinkDisabled).$,
    focusStyles: Css.bshFocus.$,
  },

  secondaryBlack: {
    baseStyles: Css.bgColor(Tokens.Surface).bc(Tokens.FieldBorderDefault).bw1.ba.color(Tokens.OnSurface).$,
    hoverStyles: Css.bgColor(Tokens.NeutralFillHoverStrong).color(Tokens.OnSurface).$,
    disabledStyles: Css.color(Tokens.ButtonGhostDisabledFg).$,
    focusStyles: Css.boxShadow(`0px 0px 0px 2px ${Tokens.FocusRingInset}, 0px 0px 0px 4px ${Tokens.FocusRingMuted}`).$,
  },

  tertiary: {
    baseStyles: Css.bgTransparent.color(Tokens.ButtonTertiaryFg).$,
    hoverStyles: Css.bgColor(Tokens.NeutralFillHoverStrong).color(Tokens.OnSurface).$,
    disabledStyles: Css.color(Tokens.ButtonGhostDisabledFg).$,
    focusStyles: Css.bshFocus.bgColor(Tokens.NeutralFillHoverStrong).color(Tokens.OnSurface).$,
  },

  tertiaryDanger: {
    baseStyles: Css.bgTransparent.color(Tokens.Danger).$,
    hoverStyles: Css.bgColor(Tokens.NeutralFillHoverStrong).color(Tokens.OnSurface).$,
    disabledStyles: Css.color(Tokens.ButtonGhostDisabledFg).$,
    focusStyles: Css.boxShadow(`0px 0px 0px 2px ${Tokens.FocusRingInset}, 0px 0px 0px 4px ${Tokens.Danger}`).$,
  },

  danger: {
    // Fill ramp has no semantic tokens yet — keep palette; disabled/focus use tokens.
    baseStyles: Css.bgRed600.white.$,
    hoverStyles: Css.bgRed700.$,
    disabledStyles: Css.bgColor(Tokens.ButtonDangerDisabledBg).color(Tokens.ButtonDangerDisabledFg).$,
    focusStyles: Css.bshDanger.$,
  },

  quaternary: {
    baseStyles: Css.bgTransparent.color(Tokens.ButtonGhostFg).$,
    hoverStyles: Css.bgColor(Tokens.NeutralFillHoverStrong).color(Tokens.OnSurface).$,
    disabledStyles: Css.color(Tokens.ButtonGhostDisabledFg).$,
    focusStyles: Css.boxShadow(`0px 0px 0px 2px ${Tokens.FocusRingInset}, 0px 0px 0px 4px ${Tokens.FocusRingMuted}`).$,
  },

  caution: {
    // Fill ramp has no semantic tokens yet — keep palette; disabled/focus use tokens.
    baseStyles: Css.bgYellow200.gray900.$,
    hoverStyles: Css.bgYellow300.$,
    disabledStyles: Css.bgColor(Tokens.ButtonCautionDisabledBg).color(Tokens.ButtonCautionDisabledFg).$,
    focusStyles: Css.bshDanger.$,
  },

  text: {
    baseStyles: Css.color(Tokens.TextLinkDefault).add("fontSize", "inherit").$,
    hoverStyles: Css.color(Tokens.TextLinkHover).tdu.$,
    disabledStyles: Css.color(Tokens.TextLinkDisabled).$,
    focusStyles: Css.bshFocus.$,
  },
  textSecondary: {
    baseStyles: Css.color(Tokens.ButtonSecondaryFg).add("fontSize", "inherit").$,
    hoverStyles: Css.bgColor(Tokens.NeutralFillHoverSubtle).$,
    disabledStyles: Css.bgColor(Tokens.Surface).color(Tokens.TextLinkDisabled).$,
    focusStyles: Css.bshFocus.$,
  },
};

const colorSchemeStyles: Record<ButtonColorScheme, (typeof variantStyles)[ButtonVariant]> = {
  neutral: {
    baseStyles: Css.bgGray100.bcGray600.bw1.ba.color(Tokens.OnSurface).$,
    hoverStyles: Css.bgGray200.bcGray700.$,
    disabledStyles: Css.bgGray100.bcGray400.color(Tokens.TextLinkDisabled).$,
    focusStyles: Css.bshFocus.$,
  },
  info: {
    baseStyles: Css.bgBlue50.bcBlue600.bw1.ba.color(Tokens.OnSurface).$,
    hoverStyles: Css.bgBlue100.bcBlue700.$,
    disabledStyles: Css.bgBlue50.bcBlue300.color(Tokens.TextLinkDisabled).$,
    focusStyles: Css.bshFocus.$,
  },
  success: {
    baseStyles: Css.bgGreen50.bcGreen600.bw1.ba.color(Tokens.OnSurface).$,
    hoverStyles: Css.bgGreen100.bcGreen700.$,
    disabledStyles: Css.bgGreen50.bcGreen300.color(Tokens.TextLinkDisabled).$,
    focusStyles: Css.bshFocus.$,
  },
};

const sizeStyles: Record<ButtonSize, Properties> = {
  sm: Css.hPx(32).pxPx(12).$,
  md: Css.hPx(40).px2.$,
  lg: Css.hPx(48).px3.$,
};

const iconStyles: Record<ButtonSize, IconProps["xss"]> = {
  sm: Css.mrPx(4).$,
  md: Css.mr1.$,
  lg: Css.mrPx(10).$,
};

export type ButtonSize = "sm" | "md" | "lg";
export type ButtonColorScheme = "neutral" | "info" | "success";
export type ButtonVariant =
  | "ai"
  | "primary"
  | "secondary"
  | "secondaryBlack"
  | "tertiary"
  | "tertiaryDanger"
  | "caution"
  | "danger"
  | "quaternary"
  | "text"
  | "textSecondary";
