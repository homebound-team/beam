import { AriaButtonProps } from "@react-types/button";
import { ButtonHTMLAttributes, ReactNode, RefObject, useMemo, useRef, useState } from "react";
import { useButton, useFocusRing, useHover } from "react-aria";
import { Icon, IconProps, maybeTooltip, navLink, resolveTooltip } from "src/components";
import { Css, Palette } from "src/Css";
import { BeamButtonProps, BeamFocusableProps } from "src/interfaces";
import { isAbsoluteUrl, noop } from "src/utils";
import { getButtonOrLink } from "src/utils/getInteractiveElement";
import { useTestIds } from "src/utils/useTestIds";

export interface ButtonProps extends BeamButtonProps, BeamFocusableProps {
  label: string;
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
    ...otherProps
  } = props;
  const asLink = typeof onPress === "string";
  const showExternalLinkIcon = (asLink && isAbsoluteUrl(onPress)) || openInNew;
  const [isOnPressRunning, setOnPressRunning] = useState(false);
  const isDisabled = !!disabled || isOnPressRunning;
  const ariaProps = { onPress, isDisabled, ...otherProps, ...menuTriggerProps };
  const {
    label,
    // Default the icon based on other properties.
    icon = download ? "download" : showExternalLinkIcon ? "linkExternal" : undefined,
    variant = "primary",
    size = "sm",
    buttonRef,
  } = ariaProps;
  const ref = buttonRef || useRef(null);
  const tid = useTestIds(props, label);
  const { buttonProps, isPressed } = useButton(
    {
      ...ariaProps,
      onPress: asLink
        ? noop
        : (e) => {
            const result = onPress(e);
            if (isPromise(result)) {
              setOnPressRunning(true);
              result.finally(() => setOnPressRunning(false));
            }
            return result;
          },
      elementType: asLink ? "a" : "button",
    },
    ref as RefObject<HTMLElement>,
  );
  const { isFocusVisible, focusProps } = useFocusRing(ariaProps);
  const { hoverProps, isHovered } = useHover(ariaProps);
  const { baseStyles, hoverStyles, disabledStyles, pressedStyles } = useMemo(
    () => getButtonStyles(variant, size, contrast),
    [variant, size, contrast],
  );
  const focusStyles = useMemo(
    () =>
      !contrast
        ? variant === "danger"
          ? Css.bshDanger.$
          : Css.bshFocus.$
        : Css.boxShadow(`0 0 0 2px ${variant === "tertiary" ? Palette.LightBlue700 : Palette.White}`).if(
            variant === "tertiary",
          ).bgGray700.white.$,
    [variant, contrast],
  );

  const buttonContent = (
    <>
      {icon && <Icon xss={iconStyles[size]} icon={icon} />}
      {label}
      {endAdornment && <span css={Css.ml1.$}>{endAdornment}</span>}
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
      ...(isDisabled ? { ...disabledStyles, ...Css.cursorNotAllowed.$ } : {}),
      ...(isFocusVisible ? focusStyles : {}),
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

const variantStyles: (
  contrast: boolean,
) => Record<ButtonVariant, { baseStyles: {}; hoverStyles: {}; disabledStyles: {}; pressedStyles: {} }> = (
  contrast,
) => ({
  primary: {
    baseStyles: Css.bgLightBlue700.white.if(contrast).bgLightBlue400.$,
    hoverStyles: Css.bgLightBlue900.if(contrast).bgLightBlue500.$,
    pressedStyles: Css.bgLightBlue500.if(contrast).bgLightBlue900.$,
    disabledStyles: Css.bgLightBlue200.if(contrast).gray600.bgLightBlue900.$,
  },

  secondary: {
    baseStyles: Css.bgWhite.bGray300.bw1.ba.gray800.$,
    hoverStyles: Css.bgGray100.if(contrast).bgGray300.$,
    pressedStyles: Css.bgGray200.if(contrast).bgGray100.$,
    disabledStyles: Css.bgWhite.gray400.$,
  },

  tertiary: {
    baseStyles: Css.bgTransparent.lightBlue700.if(contrast).lightBlue400.$,
    hoverStyles: Css.bgGray100.if(contrast).bgGray700.white.$,
    pressedStyles: Css.lightBlue900.if(contrast).bgWhite.gray900.$,
    disabledStyles: Css.gray400.if(contrast).gray700.$,
  },

  danger: {
    baseStyles: Css.bgRed900.white.if(contrast).bgRed800.$,
    hoverStyles: Css.bgRed500.if(contrast).bgRed600.$,
    pressedStyles: Css.bgRed900.if(contrast).bgRed800.$,
    disabledStyles: Css.bgRed200.if(contrast).bgRed900.gray600.$,
  },

  text: {
    baseStyles: Css.lightBlue700.add("fontSize", "inherit").if(contrast).lightBlue400.$,
    hoverStyles: Css.lightBlue600.if(contrast).lightBlue300.$,
    pressedStyles: Css.lightBlue700.if(contrast).lightBlue200.$,
    disabledStyles: Css.lightBlue300.if(contrast).lightBlue700.$,
  },
});

const sizeStyles: Record<ButtonSize, {}> = {
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
export type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger" | "text";

function isPromise(obj: void | Promise<void>): obj is Promise<void> {
  return typeof obj === "object" && "then" in obj && typeof obj.then === "function";
}
