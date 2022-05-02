import { AriaButtonProps } from "@react-types/button";
import { ButtonHTMLAttributes, ReactNode, RefObject, useMemo, useRef } from "react";
import { useButton, useFocusRing, useHover } from "react-aria";
import { Link } from "react-router-dom";
import { Icon, IconProps, maybeTooltip, navLink, resolveTooltip } from "src/components";
import { Css } from "src/Css";
import { BeamButtonProps, BeamFocusableProps } from "src/interfaces";
import { isAbsoluteUrl, noop } from "src/utils";
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
    ...otherProps
  } = props;
  const showExternalLinkIcon = (typeof onPress === "string" && isAbsoluteUrl(onPress)) || openInNew;
  const isDisabled = !!disabled;
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
      onPress: typeof onPress === "string" ? noop : onPress,
      elementType: typeof onPress === "string" ? "a" : "button",
    },
    ref as RefObject<HTMLElement>,
  );
  const { isFocusVisible, focusProps } = useFocusRing(ariaProps);
  const { hoverProps, isHovered } = useHover(ariaProps);
  const { baseStyles, hoverStyles, disabledStyles, pressedStyles } = useMemo(
    () => getButtonStyles(variant, size),
    [variant, size],
  );
  const focusRingStyles = useMemo(() => (variant === "danger" ? Css.bshDanger.$ : Css.bshFocus.$), [variant]);

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
    css: {
      ...Css.buttonBase.$,
      ...baseStyles,
      ...(isHovered && !isPressed ? hoverStyles : {}),
      ...(isPressed ? pressedStyles : {}),
      ...(isDisabled ? { ...disabledStyles, ...Css.cursorNotAllowed.$ } : {}),
      ...(isFocusVisible ? focusRingStyles : {}),
    },
    ...tid,
  };

  const button =
    typeof onPress === "string" ? (
      isAbsoluteUrl(onPress) || openInNew || download ? (
        <a
          {...buttonAttrs}
          href={onPress}
          className={navLink}
          {...(download ? { download: "" } : { target: "_blank", rel: "noreferrer noopener" })}
        >
          {buttonContent}
        </a>
      ) : (
        <Link {...buttonAttrs} to={onPress} className={navLink}>
          {buttonContent}
        </Link>
      )
    ) : (
      <button {...buttonAttrs}>{buttonContent}</button>
    );

  // If we're disabled b/c of a non-boolean ReactNode, or the caller specified tooltip text, then show it in a tooltip
  return maybeTooltip({
    title: resolveTooltip(disabled, tooltip),
    placement: "top",
    children: button,
  });
}

function getButtonStyles(variant: ButtonVariant, size: ButtonSize) {
  if (variant === "text") {
    // The text variant does not support the 'size'. The 'size' prop only effects the button's height and padding which is not relevant for this variant.
    return variantStyles[variant];
  }
  return {
    ...variantStyles[variant],
    baseStyles: { ...variantStyles[variant].baseStyles, ...sizeStyles[size] },
  };
}

const variantStyles: Record<ButtonVariant, { baseStyles: {}; hoverStyles: {}; disabledStyles: {}; pressedStyles: {} }> =
  {
    primary: {
      baseStyles: Css.bgLightBlue700.white.$,
      hoverStyles: Css.bgLightBlue900.$,
      pressedStyles: Css.bgLightBlue500.$,
      disabledStyles: Css.bgLightBlue200.$,
    },

    secondary: {
      baseStyles: Css.bgWhite.bGray300.bw1.ba.gray800.$,
      hoverStyles: Css.bgGray100.$,
      pressedStyles: Css.bgGray200.$,
      disabledStyles: Css.bgWhite.gray400.$,
    },

    tertiary: {
      baseStyles: Css.bgTransparent.lightBlue700.$,
      hoverStyles: Css.bgGray100.$,
      pressedStyles: Css.lightBlue900.$,
      disabledStyles: Css.gray400.$,
    },

    danger: {
      baseStyles: Css.bgRed900.white.$,
      hoverStyles: Css.bgRed500.$,
      pressedStyles: Css.bgRed900.$,
      disabledStyles: Css.bgRed200.$,
    },

    text: {
      baseStyles: Css.lightBlue700.add("fontSize", "inherit").$,
      hoverStyles: {},
      pressedStyles: {},
      disabledStyles: Css.lightBlue300.$,
    },
  };

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

type ButtonSize = "sm" | "md" | "lg";
type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger" | "text";
