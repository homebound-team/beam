import { useButton, useFocusRing } from "react-aria"
import type { AriaButtonProps } from "@react-types/button";
import {useMemo, useRef} from "react";
import { Css, Palette, px } from "./Css";
import {Icon, IconKey, IconXss} from "./Icon";

interface ButtonProps extends AriaButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconKey
}

export function Button(props: ButtonProps) {
  const { children, icon, variant = "primary", size = "sm" } = props;
  const ref = useRef(null);
  const { buttonProps } = useButton(props, ref);
  const { isFocusVisible, focusProps } = useFocusRing(props);
  const buttonStyles = useMemo(() => getButtonStyles(variant, size), [variant, size])
  const focusRingStyles = useMemo(() => variant === "danger" ? dangerFocusRingStyles : defaultFocusRingStyles, [variant]);

  return (
    <button ref={ref} {...buttonProps} {...focusProps} css={{...buttonReset, ...buttonStyles, ...(isFocusVisible ? focusRingStyles : {})}}>
      {icon && (
        <Icon xss={iconStyles[size]} color="inherit" icon={icon} />
      )}
      {children}
    </button>
  );
}

const buttonReset = Css.p0.bsNone.cursorPointer.smEm.m(px(4)).dif.itemsCenter
  .add("font", "inherit")
  .add("boxSizing", "border-box")
  .add("outline", "inherit")
  .add("borderRadius", px(4)).$;
const disabledStyles = Css.add("cursor", "not-allowed").$;
const defaultFocusRingStyles = Css.add("boxShadow", `0px 0px 0px 2px ${Palette.White}, 0 0 0 4px ${Palette.Sky500}`).$;
const dangerFocusRingStyles = Css.add("boxShadow", `0px 0px 0px 2px ${Palette.White}, 0 0 0 4px ${Palette.Coral600}`).$;

const variantStyles: Record<ButtonVariant, {}> = {
  primary: {
    ...Css.bgSky500.white.add("fill", Palette.White).$,
    "&:hover:not(:disabled)": Css.bgSky700.$,
    "&:disabled": {...disabledStyles, ...Css.bgSky200.$},
    "&:active:not(:disabled)": Css.bgSky900.$,
  },

  secondary: {
    ...Css.bgWhite.bCoolGray300.bw1.ba.coolGray900.add("fill", Palette.CoolGray900).$,
    "&:hover:not(:disabled)": Css.bgCoolGray50.$,
    "&:disabled": {...disabledStyles, ...Css.bgWhite.coolGray300.add("fill", Palette.CoolGray300).$},
    "&:active:not(:disabled)": Css.bgCoolGray200.$,
  },

  tertiary: {
    ...Css.add("background", "none").sky500.add("fill", Palette.Sky500).$,
    "&:hover:not(:disabled)": Css.bgCoolGray100.$,
    "&:disabled": {...disabledStyles, ...Css.coolGray300.add("fill", Palette.CoolGray300).$},
    "&:active:not(:disabled)": Css.sky900.add("fill", Palette.Sky900).$,
  },

  danger: {
    ...Css.bgCoral600.white.add("fill", Palette.White).$,
    "&:hover:not(:disabled)": Css.bgCoral500.$,
    "&:disabled": {...disabledStyles, ...Css.bgCoral200.$},
    "&:active:not(:disabled)": Css.bgCoral700.$,
  }
}

const sizeStyles: Record<ButtonSize, {}> = {
  sm: Css.h(px(32)).px(px(12)).$,
  md: Css.h(px(40)).px2.$,
  lg: Css.h(px(48)).px3.$,
};

const iconStyles: Record<ButtonSize, IconXss> = {
  sm: Css.mr(px(4)).$,
  md: Css.mr1.$,
  lg: Css.mr(px(10)).$,
};

function getButtonStyles(variant: ButtonVariant, size: ButtonSize) {
  // Handling tertiary separately as it only supports a single size button. The size it supports does not match styles of other buttons.
  if (variant === "tertiary") {
    return {
      ...Css.h(px(40)).px1.$,
      ...variantStyles.tertiary,
    };
  }

  return {
    ...sizeStyles[size],
    ...variantStyles[variant],
  }
}

type ButtonSize = "sm" | "md" | "lg";
type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger"
