import { useButton, FocusRing } from "react-aria"
import type { AriaButtonProps } from "@react-types/button";
import { useRef } from "react";
import { Css, Palette, px } from "./Css";

interface ButtonProps extends AriaButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button(props: ButtonProps) {
  const ref = useRef(null);
  const { buttonProps } = useButton(props, ref);

  const { children, variant = "primary", size = "sm" } = props;

  return (
    <FocusRing focusRingClass="focusRing">
      <button ref={ref} {...buttonProps} css={{...buttonReset, ...variantStyles[variant], ...sizeStyles[size]}}>
        {children}
      </button>
    </FocusRing>
  );
}

const buttonReset = Css.p0.bsNone.cursorPointer.smEm.m(px(4))
  .add("font", "inherit")
  .add("boxSizing", "border-box")
  .add("outline", "inherit")
  .add("borderRadius", px(4)).$;

const disabledStyles = Css.add("cursor", "not-allowed").$;
const focusRingStyles = Css.add("boxShadow", `0px 0px 0px 2px ${Palette.White}, 0 0 0 4px ${Palette.Sky500}`).$;
const dangerFocusRingStyles = Css.add("boxShadow", `0px 0px 0px 2px ${Palette.White}, 0 0 0 4px ${Palette.Coral600}`).$;

const variantStyles: Record<ButtonVariant, {}> = {
  primary: {
    ...Css.bgSky500.white.$,
    "&:hover": Css.bgSky700.$,
    "&:disabled": {...disabledStyles, ...Css.bgSky200.$},
    "&.focusRing": focusRingStyles,
    "&:active": {...focusRingStyles, ...Css.bgSky700.$},
  },

  secondary: {
    ...Css.bgWhite.coolGray900.bCoolGray300.bw1.ba.$,
    "&:hover": Css.bgCoolGray50.$,
    "&:disabled": {...disabledStyles, ...Css.bgWhite.coolGray300.$},
    "&.focusRing": focusRingStyles,
    "&:active": {...focusRingStyles, ...Css.bgCoolGray50.$},
  },

  tertiary: {
    ...Css.add("background", "none").sky500.$,
    "&:hover": Css.bgCoolGray100.$,
    "&:disabled": { ...disabledStyles, ...Css.add("background", "none").coolGray300.$ },
    "&.focusRing": focusRingStyles,
    "&:active": {...focusRingStyles, ...Css.bgCoolGray100.$},
  },

  danger: {
    ...Css.bgCoral600.white.$,
    "&:hover": Css.bgCoral500.$,
    "&:disabled": {...disabledStyles, ...Css.bgCoral200.$},
    "&.focusRing": dangerFocusRingStyles,
    "&:active": {...dangerFocusRingStyles, ...Css.bgCoral500.$},
  }
}

const sizeStyles: Record<ButtonSize, {}> = {
  sm: Css.h(px(32)).px(px(12)).add("lineHeight", px(32)).$,
  md: Css.h(px(40)).px2.add("lineHeight", px(40)).$,
  lg: Css.h(px(48)).px3.add("lineHeight", px(48)).$,
};

type ButtonSize = "sm" | "md" | "lg";
type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger"
