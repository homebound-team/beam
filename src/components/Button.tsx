import { AriaButtonProps } from "@react-types/button";
import { PressEvent } from "@react-types/shared";
import { ReactNode, RefObject, useMemo, useRef } from "react";
import { useButton, useFocusRing, useHover } from "react-aria";
import { Link } from "react-router-dom";
import { Icon, IconProps, navLink } from "src";
import { Tooltip } from "src/components/Tooltip";
import { Css } from "src/Css";
import { BeamButtonProps, BeamFocusableProps } from "src/interfaces";
import { isAbsoluteUrl, noop } from "src/utils";

export interface ButtonProps extends Omit<BeamButtonProps, "onClick">, BeamFocusableProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconProps["icon"];
  endAdornment?: ReactNode;
  /** HTML attributes to apply to the button element when it is being used to trigger a menu. */
  menuTriggerProps?: AriaButtonProps;
  buttonRef?: RefObject<HTMLElement>;
  /** If function, then it is the handler that is called when the press is released over the target. Otherwise if string, it is the URL path for the link */
  onClick?: ((e: PressEvent) => void) | string;
  /** Text to be shown via a tooltip when the user hovers over the button */
  tooltip?: ReactNode;
}

export function Button(props: ButtonProps) {
  const { onClick: onPress, disabled, endAdornment, menuTriggerProps, tooltip, ...otherProps } = props;
  const isDisabled = !!disabled;
  const ariaProps = { onPress, isDisabled, ...otherProps, ...menuTriggerProps };
  const { label, icon, variant = "primary", size = "sm", buttonRef } = ariaProps;
  const ref = buttonRef || useRef(null);
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
  };

  const button =
    typeof onPress === "string" ? (
      isAbsoluteUrl(onPress) ? (
        <a {...buttonAttrs} href={onPress} className={navLink} target="_blank" rel="noreferrer noopener">
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
  if ((isDisabled && typeof disabled !== "boolean") || tooltip) {
    return (
      <Tooltip title={isDisabled && typeof disabled !== "boolean" ? disabled : tooltip} placement="top">
        {button}
      </Tooltip>
    );
  }

  return button;
}

function getButtonStyles(variant: ButtonVariant, size: ButtonSize) {
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
type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger";
