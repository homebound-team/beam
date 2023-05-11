import { AriaButtonProps } from "@react-types/button";
import { RefObject, useMemo } from "react";
import { mergeProps, useButton, useFocusRing, useHover } from "react-aria";
import type { IconKey } from "src/components";
import { navLink } from "src/components";
import { Css, Properties } from "src/Css";
import { useGetRef } from "src/hooks/useGetRef";
import { BeamFocusableProps } from "src/interfaces";
import { getButtonOrLink } from "src/utils/getInteractiveElement";
import { Icon } from "./Icon";

export interface NavLinkProps extends BeamFocusableProps {
  /** active indicates the user is on the current page */
  active?: boolean;
  disabled?: boolean;
  /** if `href` isn't provided, it is treated as a <button> */
  href?: string;
  label: string;
  icon?: IconKey;
  variant: NavLinkVariant;
  openInNew?: boolean;
  contrast?: boolean;
  /** HTML attributes to apply to the button element when it is being used to trigger a menu. */
  menuTriggerProps?: AriaButtonProps;
  buttonRef?: RefObject<HTMLElement>;
}

type NavLinkVariant = "side" | "global" | "normal";

export function NavLink(props: NavLinkProps) {
  const {
    disabled: isDisabled,
    label,
    openInNew,
    contrast = false,
    menuTriggerProps,
    buttonRef,
    ...otherProps
  } = props;
  const ariaProps = { children: label, isDisabled, ...menuTriggerProps, ...otherProps };
  const { href, active = false, icon = false, variant } = ariaProps;
  const ref = useGetRef(buttonRef);
  const { buttonProps, isPressed } = useButton({ ...ariaProps, elementType: href ? "a" : "button" }, ref);
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const { isFocusVisible, focusProps } = useFocusRing(ariaProps);

  const { baseStyles, activeStyles, focusRingStyles, hoverStyles, disabledStyles, pressedStyles } = useMemo(
    () => getNavLinkStyles(variant, contrast),
    [variant, contrast],
  );

  const linkAttributes = {
    className: navLink,
    ref: ref,
    /** does not focus if disabled */
    tabIndex: isDisabled ? -1 : 0,
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

  return getButtonOrLink(linkContent, href, { ...mergeProps(buttonProps, focusProps, hoverProps), ...linkAttributes });
}

export function getNavLinkStyles(variant: NavLinkVariant, contrast: boolean) {
  return navLinkVariantStyles(contrast)[variant];
}

const baseStyles = Css.df.aic.hPx(32).pyPx(6).br4.smMd.outline0.$;

const navLinkVariantStyles: (contrast: boolean) => Record<
  NavLinkVariant,
  {
    baseStyles: Properties;
    hoverStyles: Properties;
    disabledStyles: Properties;
    focusRingStyles: Properties;
    activeStyles: Properties;
    pressedStyles: Properties;
  }
> = (contrast) => ({
  side: {
    baseStyles: { ...baseStyles, ...Css.gray700.if(contrast).gray600.px1.$ },
    activeStyles: Css.lightBlue700.bgLightBlue50.if(contrast).white.bgGray700.$,
    disabledStyles: Css.gray400.cursorNotAllowed.if(contrast).gray800.$,
    focusRingStyles: Css.bgLightBlue50.bshFocus.if(contrast).bgGray700.white.$,
    hoverStyles: Css.gray700.bgGray100.if(contrast).bgGray800.gray600.$,
    pressedStyles: Css.gray700.bgGray200.if(contrast).bgGray200.gray800.$,
  },
  global: {
    baseStyles: { ...baseStyles, ...Css.add("width", "max-content").gray500.px1.$ },
    activeStyles: Css.white.bgGray900.$,
    disabledStyles: Css.gray400.cursorNotAllowed.$,
    focusRingStyles: Css.gray500.bgGray900.add(
      "boxShadow",
      `0px 1px 2px rgba(0, 0, 0, 0.05), 0px 0px 0px 2px #242424, 0px 0px 0px 4px #0EA5E9`,
    ).$,
    hoverStyles: Css.gray500.bgGray900.$,
    pressedStyles: Css.gray500.bgGray700.$,
  },
  normal: {
    baseStyles: { ...baseStyles, ...Css.gray700.if(contrast).gray600.$ },
    activeStyles: Css.lightBlue700.bgLightBlue50.if(contrast).white.bgGray700.$,
    disabledStyles: Css.gray400.cursorNotAllowed.if(contrast).gray800.$,
    focusRingStyles: Css.bgLightBlue50.bshFocus.if(contrast).bgGray700.white.$,
    hoverStyles: Css.gray700.bgGray100.if(contrast).bgGray800.gray600.$,
    pressedStyles: Css.gray700.bgGray200.if(contrast).bgGray200.gray800.$,
  }
});
