import { useMemo, useRef } from "react";
import { useButton, useFocusRing, useHover } from "react-aria";
import { Icon, IconProps } from "src";
import { Css } from "src/Css";
import { BeamButtonProps, BeamFocusableProps } from "src/interfaces";

export interface ButtonProps extends BeamButtonProps, BeamFocusableProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconProps["icon"];
}

export function Button({ onClick: onPress, disabled: isDisabled, ...otherProps }: ButtonProps) {
  const ariaProps = { onPress, isDisabled, ...otherProps };
  const { label, icon, variant = "primary", size = "sm" } = ariaProps;
  const ref = useRef(null);
  const { buttonProps, isPressed } = useButton(ariaProps, ref);
  const { isFocusVisible, focusProps } = useFocusRing(ariaProps);
  const { hoverProps, isHovered } = useHover(ariaProps);
  const { baseStyles, hoverStyles, disabledStyles, pressedStyles } = useMemo(() => getButtonStyles(variant, size), [
    variant,
    size,
  ]);
  const focusRingStyles = useMemo(() => (variant === "danger" ? Css.bshDanger.$ : Css.bshFocus.$), [variant]);

  return (
    <button
      ref={ref}
      {...buttonProps}
      {...focusProps}
      {...hoverProps}
      css={{
        ...buttonReset,
        ...baseStyles,
        ...(isHovered && !isPressed ? hoverStyles : {}),
        ...(isPressed ? pressedStyles : {}),
        ...(isDisabled ? { ...disabledStyles, ...Css.cursorNotAllowed.$ } : {}),
        ...(isFocusVisible ? focusRingStyles : {}),
      }}
    >
      {icon && <Icon xss={iconStyles[size]} icon={icon} />}
      {label}
    </button>
  );
}

function getButtonStyles(variant: ButtonVariant, size: ButtonSize) {
  // Handling tertiary separately as it only supports a single size button. The size it supports does not match styles of other buttons.
  if (variant === "tertiary") {
    return {
      ...variantStyles.tertiary,
      baseStyles: { ...variantStyles.tertiary.baseStyles, ...Css.hPx(40).px1.$ },
    };
  }

  return {
    ...variantStyles[variant],
    baseStyles: { ...variantStyles[variant].baseStyles, ...sizeStyles[size] },
  };
}

const buttonReset = Css.smEm.br4.dif.itemsCenter.outline0.transition.mPx(4).$;

const variantStyles: Record<
  ButtonVariant,
  { baseStyles: {}; hoverStyles: {}; disabledStyles: {}; pressedStyles: {} }
> = {
  primary: {
    baseStyles: Css.bgSky500.white.$,
    hoverStyles: Css.bgSky700.$,
    disabledStyles: Css.bgSky200.$,
    pressedStyles: Css.bgSky900.$,
  },

  secondary: {
    baseStyles: Css.bgWhite.bCoolGray300.bw1.ba.coolGray900.$,
    hoverStyles: Css.bgCoolGray50.$,
    disabledStyles: Css.bgWhite.coolGray300.$,
    pressedStyles: Css.bgCoolGray200.$,
  },

  tertiary: {
    baseStyles: Css.add("background", "none").sky500.$,
    hoverStyles: Css.bgCoolGray100.$,
    disabledStyles: Css.coolGray300.$,
    pressedStyles: Css.sky900.bgCoolGray100.$,
  },

  danger: {
    baseStyles: Css.bgCoral600.white.$,
    hoverStyles: Css.bgCoral500.$,
    disabledStyles: Css.bgCoral200.$,
    pressedStyles: Css.bgCoral700.$,
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
