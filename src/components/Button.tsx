import { AriaButtonProps } from "@react-types/button";
import { ButtonHTMLAttributes, ReactNode, RefObject, useMemo, useRef } from "react";
import { useButton, useFocusRing, useHover } from "react-aria";
import { Link } from "react-router-dom";
import { useTestIds } from "src";
import { Icon, IconProps, maybeTooltip, navLink } from "src/components";
import { Css } from "src/Css";
import { BeamButtonProps, BeamFocusableProps } from "src/interfaces";
import { isAbsoluteUrl, noop } from "src/utils";

export interface ButtonProps extends BeamButtonProps, BeamFocusableProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconProps["icon"];
  /** Displays contents after the Button's label. Will be ignored for Buttons rendered as a link with an absolute URL */
  endAdornment?: ReactNode;
  /** HTML attributes to apply to the button element when it is being used to trigger a menu. */
  menuTriggerProps?: AriaButtonProps;
  buttonRef?: RefObject<HTMLElement>;
  /** Allow for setting "submit" | "button" | "reset" on button element */
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
}

export function Button(props: ButtonProps) {
  const { onClick: onPress, disabled, endAdornment, menuTriggerProps, tooltip, openInNew, ...otherProps } = props;
  const isDisabled = !!disabled;
  const ariaProps = { onPress, isDisabled, ...otherProps, ...menuTriggerProps };
  const { label, icon, variant = "primary", size = "sm", buttonRef } = ariaProps;
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
      {/* Do not apply endAdornment for links to Absolute URLs. Component will apply the 'linkExternal' icon as an endAdornment by default */}
      {!(typeof onPress === "string" && isAbsoluteUrl(onPress)) && endAdornment && (
        <span css={Css.ml1.$}>{endAdornment}</span>
      )}
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
      isAbsoluteUrl(onPress) || openInNew ? (
        <a {...buttonAttrs} href={onPress} className={navLink} target="_blank" rel="noreferrer noopener">
          {buttonContent}
          <span css={Css.ml1.$}>
            <Icon icon="linkExternal" />
          </span>
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
    title: isDisabled && typeof disabled !== "boolean" ? disabled : tooltip,
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
      baseStyles: Css.lightBlue700.$,
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
