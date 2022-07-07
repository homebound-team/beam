import { RefObject, useMemo, useRef } from "react";
import { mergeProps, useButton, useFocusRing, useHover } from "react-aria";
import { Link } from "react-router-dom";
import type { IconKey } from "src/components";
import { navLink } from "src/components";
import { Css } from "src/Css";
import { BeamFocusableProps } from "src/interfaces";
import { isAbsoluteUrl } from "src/utils";
import { Icon } from "./Icon";

export interface NavLinkProps extends BeamFocusableProps {
  /** active indicates the user is on the current page */
  active?: boolean;
  disabled?: boolean;
  href: string;
  label: string;
  icon?: IconKey;
  variant: NavLinkVariant;
  openInNew?: boolean;
  contrast?: boolean;
}

type NavLinkVariant = "side" | "global";

export function NavLink(props: NavLinkProps) {
  const { disabled: isDisabled, label, openInNew, contrast=false, ...otherProps } = props;
  const ariaProps = { children: label, isDisabled, ...otherProps };
  const { href, active = false, icon = false, variant } = ariaProps;
  const ref = useRef() as RefObject<HTMLAnchorElement>;
  const { buttonProps, isPressed } = useButton({ ...ariaProps, elementType: "a" }, ref);
  // remove `type=button` from being passed into the component, as it causes style issues in Safari.
  const { type, ...otherButtonProps } = buttonProps;
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const { isFocusVisible, focusProps } = useFocusRing(ariaProps);

  const { baseStyles, activeStyles, focusRingStyles, hoverStyles, disabledStyles, pressedStyles } = useMemo(
    () => getNavLinkStyles(variant, contrast),
    [variant, contrast],
  );

  const external = isAbsoluteUrl(href) || openInNew;

  const linkAttributes = {
    className: navLink,
    ref: ref,
    rel: external ? "noopener noreferrer" : undefined,
    /** does not focus if disabled */
    tabIndex: isDisabled ? -1 : 0,
    target: external ? "_blank" : undefined,
    /** aria-current represents the current page within a set of pages */
    "aria-current": active ? ("page" as const) : undefined,
    css: {
      ...baseStyles,
      ...(active && activeStyles),
      ...(isDisabled && disabledStyles),
      ...(isFocusVisible && focusRingStyles),
      ...(isHovered && hoverStyles),
      ...(isPressed && pressedStyles),
    },
  };

  const linkContent = (
    <>
      {label}
      {icon && (
        <span css={Css.ml1.$}>
          <Icon icon={icon} />
        </span>
      )}
    </>
  );

  return external ? (
    <a href={href} {...mergeProps(otherButtonProps, focusProps, hoverProps)} {...linkAttributes}>
      {linkContent}
    </a>
  ) : (
    <Link to={href} {...mergeProps(otherButtonProps, focusProps, hoverProps)} {...linkAttributes}>
      {linkContent}
    </Link>
  );
}

export function getNavLinkStyles(variant: NavLinkVariant, contrast: boolean) {
  return navLinkVariantStyles(contrast)[variant];
}

const baseStyles = Css.df.aic.hPx(32).pyPx(6).px1.br4.smEm.outline0.$;

const navLinkVariantStyles: (
  contrast: boolean
) => Record<NavLinkVariant, { baseStyles: {}; hoverStyles: {}; disabledStyles: {}; focusRingStyles: {}; activeStyles: {}; pressedStyles: {} }> = (
  contrast,
) => ({
  side: {
    baseStyles: { ...baseStyles, ...Css.gray700.if(contrast).gray600.$ },
    activeStyles: Css.lightBlue700.bgLightBlue50.if(contrast).white.bgGray700.$,
    disabledStyles: Css.gray400.cursorNotAllowed.if(contrast).gray800.$,
    focusRingStyles: Css.bgLightBlue50.bshFocus.if(contrast).bgGray700.white.$,
    hoverStyles: Css.gray700.bgGray100.if(contrast).bgGray800.gray600.$,
    pressedStyles: Css.gray700.bgGray200.if(contrast).bgGray200.gray800.$,
  },
  global: {
    baseStyles: { ...baseStyles, ...Css.add("width", "max-content").gray500.$ },
    activeStyles: Css.white.bgGray900.$,
    disabledStyles: Css.gray400.cursorNotAllowed.$,
    focusRingStyles: Css.gray500.bgGray900.add(
      "boxShadow",
      `0px 1px 2px rgba(0, 0, 0, 0.05), 0px 0px 0px 2px #242424, 0px 0px 0px 4px #0EA5E9`,
    ).$,
    hoverStyles: Css.gray500.bgGray900.$,
    pressedStyles: Css.gray500.bgGray700.$,
  }
});
