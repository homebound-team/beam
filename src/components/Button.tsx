import type { AriaButtonProps } from "@react-types/button";
import { useMemo, useRef } from "react";
import { useButton, useFocusRing } from "react-aria";
import { Icon, IconProps } from "src/components/Icon";
import { Css, Palette } from "src/Css";

interface ButtonProps extends AriaButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconProps["icon"];
}

export function Button(props: ButtonProps) {
  const { children, icon, variant = "primary", size = "sm" } = props;
  const ref = useRef(null);
  const { buttonProps } = useButton(props, ref);
  const { isFocusVisible, focusProps } = useFocusRing(props);
  const buttonStyles = useMemo(() => getButtonStyles(variant, size), [variant, size]);
  const focusRingStyles = useMemo(() => (variant === "danger" ? dangerFocusRingStyles : defaultFocusRingStyles), [
    variant,
  ]);

  return (
    <button
      ref={ref}
      {...buttonProps}
      {...focusProps}
      css={{ ...buttonReset, ...buttonStyles, ...(isFocusVisible ? focusRingStyles : {}) }}
    >
      {icon && <Icon xss={iconStyles[size]} icon={icon} />}
      {children}
    </button>
  );
}

const buttonReset = Css.p0.bsNone.cursorPointer.smEm.br4.dif.itemsCenter
  .mPx(4)
  .add("font", "inherit")
  .add("boxSizing", "border-box")
  .add("outline", "inherit").$;
const disabledStyles = Css.add("cursor", "not-allowed").$;
const defaultFocusRingStyles = Css.add("boxShadow", `0px 0px 0px 2px ${Palette.White}, 0 0 0 4px ${Palette.Sky500}`).$;
const dangerFocusRingStyles = Css.add("boxShadow", `0px 0px 0px 2px ${Palette.White}, 0 0 0 4px ${Palette.Coral600}`).$;

const variantStyles: Record<ButtonVariant, {}> = {
  primary: {
    ...Css.bgSky500.white.$,
    "&:hover:not(:disabled)": Css.bgSky700.$,
    "&:disabled": { ...disabledStyles, ...Css.bgSky200.$ },
    "&:active:not(:disabled)": Css.bgSky900.$,
  },

  secondary: {
    ...Css.bgWhite.bCoolGray300.bw1.ba.coolGray900.$,
    "&:hover:not(:disabled):not(:active)": Css.bgCoolGray50.$,
    "&:disabled": { ...disabledStyles, ...Css.bgWhite.coolGray300.$ },
    "&:active:not(:disabled)": Css.bgCoolGray200.$,
  },

  tertiary: {
    ...Css.add("background", "none").sky500.$,
    "&:hover:not(:disabled)": Css.bgCoolGray100.$,
    "&:disabled": { ...disabledStyles, ...Css.coolGray300.$ },
    "&:active:not(:disabled)": Css.sky900.$,
  },

  danger: {
    ...Css.bgCoral600.white.$,
    "&:hover:not(:disabled)": Css.bgCoral500.$,
    "&:disabled": { ...disabledStyles, ...Css.bgCoral200.$ },
    "&:active:not(:disabled)": Css.bgCoral700.$,
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

function getButtonStyles(variant: ButtonVariant, size: ButtonSize) {
  // Handling tertiary separately as it only supports a single size button. The size it supports does not match styles of other buttons.
  if (variant === "tertiary") {
    return {
      ...Css.hPx(40).px1.$,
      ...variantStyles.tertiary,
    };
  }

  return {
    ...sizeStyles[size],
    ...variantStyles[variant],
  };
}

type ButtonSize = "sm" | "md" | "lg";
type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger";
