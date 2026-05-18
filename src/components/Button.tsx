import { AriaButtonProps } from "@react-types/button";
import { ButtonHTMLAttributes, ReactNode, RefObject, useMemo, useState } from "react";
import { useButton, useFocusRing, useHover } from "react-aria";
import { Icon, IconProps, Loader, maybeTooltip, navLink, resolveTooltip } from "src/components";
import { Css, Palette, Properties, Tokens } from "src/Css";
import { useGetRef } from "src/hooks/useGetRef";
import { BeamButtonProps, BeamFocusableProps } from "src/interfaces";
import { isAbsoluteUrl, isPromise, noop } from "src/utils";
import { getButtonOrLink } from "src/utils/getInteractiveElement";
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
  buttonRef?: RefObject<HTMLElement>;
  /** Allow for setting "submit" | "button" | "reset" on button element */
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  /** Denotes if this button is used to download a resource. Uses the anchor tag with the `download` attribute */
  download?: boolean;

  /** Additional text to further customize button during an async request is in progress. */
  labelInFlight?: string;
  /** Shows pressed/active styles (useful when a menu is open) */
  active?: boolean;
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
  const { buttonProps, isPressed } = useButton(
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
  const { baseStyles, hoverStyles, disabledStyles, pressedStyles, focusStyles } = useMemo(
    () => getButtonStyles(variant, size),
    [variant, size],
  );

  const buttonContent = (
    <>
      {icon && <Icon xss={iconStyles[size]} icon={icon} />}
      {labelInFlight && asyncInProgress ? labelInFlight : label}
      {(endAdornment || asyncInProgress) && (
        <span css={Css.ml1.$}>{asyncInProgress ? <Loader size={"xs"} /> : endAdornment}</span>
      )}
    </>
  );

  const buttonAttrs = {
    ref: ref as any,
    ...buttonProps,
    ...focusProps,
    ...hoverProps,
    className: asLink ? navLink : undefined,
    ...Css.props({
      ...Css.buttonBase.tt("inherit").$,
      ...baseStyles,
      ...(isHovered && !isPressed && !active ? hoverStyles : {}),
      ...(isPressed || active ? pressedStyles : {}),
      ...(isDisabled || asyncInProgress ? { ...disabledStyles, ...Css.cursorNotAllowed.$ } : {}),
      ...(isFocusVisible || forceFocusStyles ? focusStyles : {}),
    }),
    ...tid,
  };

  // If we're disabled b/c of a non-boolean ReactNode, or the caller specified tooltip text, then show it in a tooltip
  return maybeTooltip({
    title: resolveTooltip(disabled, tooltip),
    placement: "top",
    children: getButtonOrLink(buttonContent, onPress, buttonAttrs, openInNew, download),
  });
}

function getButtonStyles(variant: ButtonVariant, size: ButtonSize) {
  const styles = variantStyles[variant];
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
    pressedStyles: Properties;
    focusStyles: Properties;
  }
> = {
  primary: {
    baseStyles: Css.bgColor(Tokens.Primary).color(Tokens.OnPrimary).$,
    hoverStyles: Css.bgColor(Tokens.PrimaryHover).$,
    pressedStyles: Css.bgColor(Tokens.PrimaryPressed).$,
    disabledStyles: Css.bgColor(Tokens.ButtonPrimaryDisabledBg).color(Tokens.ButtonPrimaryDisabledFg).$,
    focusStyles: Css.bshFocus.$,
  },

  secondary: {
    baseStyles: Css.bgWhite.bcGray300.bw1.ba.blue600.$,
    hoverStyles: Css.bgColor(Tokens.NeutralFillHoverSubtle).$,
    pressedStyles: Css.bgColor(Tokens.NeutralFillPressed).$,
    disabledStyles: Css.bgWhite.blue300.$,
    focusStyles: Css.bshFocus.$,
  },

  secondaryBlack: {
    baseStyles: Css.bgWhite.bcGray300.bw1.ba.gray900.$,
    hoverStyles: Css.bgColor(Tokens.NeutralFillHoverStrong).color(Tokens.OnSurface).$,
    pressedStyles: Css.bgColor(Tokens.NeutralSurfacePressed).gray900.$,
    disabledStyles: Css.color(Tokens.ButtonGhostDisabledFg).$,
    focusStyles: Css.boxShadow(`0px 0px 0px 2px var(${Tokens.FocusRingInset}), 0px 0px 0px 4px ${Palette.Gray900}`).$,
  },

  tertiary: {
    baseStyles: Css.bgTransparent.color(Tokens.ButtonTertiaryFg).$,
    hoverStyles: Css.bgColor(Tokens.NeutralFillHoverStrong).color(Tokens.OnSurface).$,
    pressedStyles: Css.bgColor(Tokens.NeutralSurfacePressed).color(Tokens.ButtonTertiaryFgPressed).$,
    disabledStyles: Css.color(Tokens.ButtonGhostDisabledFg).$,
    focusStyles: Css.bshFocus.bgColor(Tokens.NeutralFillHoverStrong).color(Tokens.OnSurface).$,
  },

  tertiaryDanger: {
    baseStyles: Css.bgTransparent.color(Tokens.Danger).$,
    hoverStyles: Css.bgColor(Tokens.NeutralFillHoverStrong).color(Tokens.OnSurface).$,
    pressedStyles: Css.bgColor(Tokens.NeutralSurfacePressed).color(Tokens.DangerPressed).$,
    disabledStyles: Css.color(Tokens.ButtonGhostDisabledFg).$,
    focusStyles: Css.boxShadow(`0px 0px 0px 2px var(${Tokens.FocusRingInset}), 0px 0px 0px 4px ${Palette.Red500}`).$,
  },

  danger: {
    baseStyles: Css.bgRed600.white.$,
    hoverStyles: Css.bgRed700.$,
    pressedStyles: Css.bgRed800.$,
    disabledStyles: Css.bgColor(Tokens.ButtonDangerDisabledBg).color(Tokens.ButtonDangerDisabledFg).$,
    focusStyles: Css.bshDanger.$,
  },

  quaternary: {
    baseStyles: Css.bgTransparent.color(Tokens.ButtonGhostFg).$,
    hoverStyles: Css.bgColor(Tokens.NeutralFillHoverStrong).color(Tokens.OnSurface).$,
    pressedStyles: Css.bgColor(Tokens.NeutralSurfacePressed).gray900.$,
    disabledStyles: Css.color(Tokens.ButtonGhostDisabledFg).$,
    focusStyles: Css.boxShadow(`0px 0px 0px 2px var(${Tokens.FocusRingInset}), 0px 0px 0px 4px ${Palette.Gray900}`).$,
  },

  caution: {
    baseStyles: Css.bgYellow200.gray900.$,
    hoverStyles: Css.bgYellow300.$,
    pressedStyles: Css.bgYellow400.$,
    disabledStyles: Css.bgColor(Tokens.ButtonCautionDisabledBg).color(Tokens.ButtonCautionDisabledFg).$,
    focusStyles: Css.bshDanger.$,
  },

  text: {
    baseStyles: Css.color(Tokens.TextLinkDefault).add("fontSize", "inherit").$,
    hoverStyles: Css.color(Tokens.TextLinkHover).$,
    pressedStyles: Css.color(Tokens.TextLinkPressed).$,
    disabledStyles: Css.color(Tokens.TextLinkDisabled).$,
    focusStyles: Css.bshFocus.$,
  },
  textSecondary: {
    baseStyles: Css.blue600.add("fontSize", "inherit").$,
    hoverStyles: Css.bgGray100.$,
    pressedStyles: Css.blue600.$,
    disabledStyles: Css.bgWhite.blue300.$,
    focusStyles: Css.blue600.$,
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
export type ButtonVariant =
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
