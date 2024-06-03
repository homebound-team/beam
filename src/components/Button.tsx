import { AriaButtonProps } from "@react-types/button";
import { ButtonHTMLAttributes, ReactNode, RefObject, useMemo, useState } from "react";
import { useButton, useFocusRing, useHover } from "react-aria";
import { Icon, IconProps, Loader, maybeTooltip, navLink, resolveTooltip } from "src/components";
import { Css, Palette, Properties } from "src/Css";
import { useGetRef } from "src/hooks/useGetRef";
import { BeamButtonProps, BeamFocusableProps } from "src/interfaces";
import { isAbsoluteUrl, isPromise, noop } from "src/utils";
import { getButtonOrLink } from "src/utils/getInteractiveElement";
import { useTestIds } from "src/utils/useTestIds";
import { labelOr } from "./internal/OverlayTrigger";

export interface ButtonProps extends BeamButtonProps, BeamFocusableProps {
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
  contrast?: boolean;

  /** Additional text to further customize button during an async request is in progress. */
  labelInFlight?: string;
}

export function Button(props: ButtonProps) {
  const {
    onClick: onPress,
    disabled,
    endAdornment,
    menuTriggerProps,
    tooltip,
    openInNew,
    download,
    contrast = false,
    forceFocusStyles = false,
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
    size = "sm",
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
              result.finally(() => setAsyncInProgress(false));
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
    () => getButtonStyles(variant, size, contrast),
    [variant, size, contrast],
  );

  const buttonContent = (
    <>
      {icon && <Icon xss={iconStyles[size]} icon={icon} />}
      {labelInFlight && asyncInProgress ? labelInFlight : label}
      {(endAdornment || asyncInProgress) && (
        <span css={Css.ml1.$}>{asyncInProgress ? <Loader size={"xs"} contrast={contrast} /> : endAdornment}</span>
      )}
    </>
  );

  const buttonAttrs = {
    ref: ref as any,
    ...buttonProps,
    ...focusProps,
    ...hoverProps,
    className: asLink ? navLink : undefined,
    css: {
      ...Css.buttonBase.tt("inherit").$,
      ...baseStyles,
      ...(isHovered && !isPressed ? hoverStyles : {}),
      ...(isPressed ? pressedStyles : {}),
      ...(isDisabled || asyncInProgress ? { ...disabledStyles, ...Css.cursorNotAllowed.$ } : {}),
      ...(isFocusVisible || forceFocusStyles ? focusStyles : {}),
    },
    ...tid,
  };

  // If we're disabled b/c of a non-boolean ReactNode, or the caller specified tooltip text, then show it in a tooltip
  return maybeTooltip({
    title: resolveTooltip(disabled, tooltip),
    placement: "top",
    children: getButtonOrLink(buttonContent, onPress, buttonAttrs, openInNew, download),
  });
}

function getButtonStyles(variant: ButtonVariant, size: ButtonSize, contrast: boolean) {
  const styles = variantStyles(contrast)[variant];
  if (variant === "text") {
    // The text variant does not support the 'size'. The 'size' prop only effects the button's height and padding which is not relevant for this variant.
    return styles;
  }
  return {
    ...styles,
    baseStyles: { ...styles.baseStyles, ...sizeStyles[size] },
  };
}

const variantStyles: (contrast: boolean) => Record<
  ButtonVariant,
  {
    baseStyles: Properties;
    hoverStyles: Properties;
    disabledStyles: Properties;
    pressedStyles: Properties;
    focusStyles: Properties;
  }
> = (contrast) => ({
  primary: {
    baseStyles: Css.bgBlue600.white.$,
    hoverStyles: Css.bgBlue700.$,
    pressedStyles: Css.bgBlue800.$,
    disabledStyles: Css.bgBlue200.if(contrast).gray600.bgBlue900.$,
    focusStyles: Css.bshFocus.if(contrast).boxShadow(`0 0 0 2px ${Palette.White}`).$,
  },

  secondary: {
    baseStyles: Css.bgWhite.bcGray300.bw1.ba.gray800.$,
    hoverStyles: Css.bgGray100.if(contrast).bgGray300.$,
    pressedStyles: Css.bgGray200.if(contrast).bgGray100.$,
    disabledStyles: Css.bgWhite.gray400.$,
    focusStyles: Css.bshFocus.if(contrast).boxShadow(`0 0 0 2px ${Palette.White}`).$,
  },

  tertiary: {
    baseStyles: Css.bgTransparent.blue600.if(contrast).white.$,
    hoverStyles: Css.bgGray100.if(contrast).bgGray700.white.$,
    pressedStyles: Css.blue800.if(contrast).bgWhite.gray900.$,
    disabledStyles: Css.gray400.if(contrast).gray700.$,
    focusStyles: Css.bshFocus.if(contrast).boxShadow(`0 0 0 2px ${Palette.Blue400}`).bgGray700.white.$,
  },

  tertiaryDanger: {
    baseStyles: Css.bgTransparent.red600.if(contrast).red400.$,
    hoverStyles: Css.bgGray100.if(contrast).bgGray700.white.$,
    pressedStyles: Css.red800.if(contrast).bgWhite.gray900.$,
    disabledStyles: Css.gray400.if(contrast).gray700.$,
    focusStyles: Css.boxShadow(`0px 0px 0px 2px ${Palette.White}, 0px 0px 0px 4px ${Palette.Red500}`)
      .if(contrast)
      .boxShadow(`0px 0px 0px 2px ${Palette.Red500}`).$,
  },

  danger: {
    baseStyles: Css.bgRed600.white.$,
    hoverStyles: Css.bgRed700.$,
    pressedStyles: Css.bgRed800.$,
    disabledStyles: Css.bgRed200.if(contrast).bgRed900.gray600.$,
    focusStyles: Css.bshDanger.if(contrast).boxShadow(`0 0 0 2px ${Palette.White}`).$,
  },

  text: {
    baseStyles: Css.blue700.add("fontSize", "inherit").if(contrast).blue400.$,
    hoverStyles: Css.blue600.if(contrast).blue300.$,
    pressedStyles: Css.blue700.if(contrast).blue200.$,
    disabledStyles: Css.blue300.if(contrast).blue700.$,
    focusStyles: Css.bshFocus.if(contrast).boxShadow(`0 0 0 2px ${Palette.White}`).$,
  },
  // Todo: handle contrast variant
  textSecondary: {
    baseStyles: Css.gray900.add("fontSize", "inherit").$,
    hoverStyles: Css.bgGray100.$,
    pressedStyles: Css.gray900.$,
    disabledStyles: Css.bgWhite.gray400.$,
    focusStyles: Css.gray900.$,
  },
});

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
  | "tertiary"
  | "tertiaryDanger"
  | "danger"
  | "text"
  | "textSecondary";
