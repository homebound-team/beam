import { RefObject, useMemo, useRef } from "react";
import { mergeProps, useButton, useFocusRing, useHover } from "react-aria";
import type { IconKey } from "src/components";
import { navLink } from "src/components";
import { Css } from "src/Css";
import { BeamFocusableProps } from "src/interfaces";
import { Icon } from "./Icon";

export interface NavLinkProps extends BeamFocusableProps {
  /** active indicates the user is on the current page */
  active?: boolean;
  disabled?: boolean;
  href: string;
  label: string;
  icon?: IconKey;
  variant: NavLinkVariant;
  /**
   * Target and rel attributes are added for external links
   * TODO: maybe infer this property based on the href */
  external?: boolean;
}

type NavLinkVariant = "side" | "global";

export function NavLink(props: NavLinkProps) {
  const { disabled: isDisabled, label, external, ...otherProps } = props;
  const ariaProps = { children: label, isDisabled, ...otherProps };
  const { href, active = false, icon = false, variant } = ariaProps;
  const ref = useRef() as RefObject<HTMLAnchorElement>;
  const { buttonProps, isPressed } = useButton({ ...ariaProps, elementType: "a" }, ref);
  // remove `type=button` from being passed into the component, as it causes style issues in Safari.
  const { type, ...otherButtonProps } = buttonProps;
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const { isFocusVisible, focusProps } = useFocusRing(ariaProps);

  const { baseStyles, activeStyles, focusRingStyles, hoverStyles, disabledStyles, pressedStyles } = useMemo(
    () => getNavLinkStyles(variant),
    [variant],
  );

  const target = external ? "_blank" : undefined;
  const rel = external ? "noopener noreferrer" : undefined;

  return (
    <a
      {...mergeProps(otherButtonProps, focusProps, hoverProps)}
      className={navLink}
      href={href}
      ref={ref}
      rel={rel}
      /** does not focus if disabled */
      tabIndex={isDisabled ? -1 : 0}
      target={target}
      /** aria-current represents the current page within a set of pages */
      aria-current={active && `page`}
      css={{
        ...baseStyles,
        ...(active && activeStyles),
        ...(isDisabled && disabledStyles),
        ...(isFocusVisible && focusRingStyles),
        ...(isHovered && hoverStyles),
        ...(isPressed && pressedStyles),
      }}
    >
      {label}
      {icon && (
        <span css={Css.ml1.$}>
          <Icon icon={icon} />
        </span>
      )}
    </a>
  );
}

export function getNavLinkStyles(variant: NavLinkVariant) {
  return navLinkVariantStyles[variant];
}

const baseStyles = Css.df.aic.hPx(32).pyPx(6).px1.br4.smEm.outline0.$;

const navLinkVariantStyles: Record<
  NavLinkVariant,
  { baseStyles: {}; hoverStyles: {}; disabledStyles: {}; focusRingStyles: {}; activeStyles: {}; pressedStyles: {} }
> = {
  side: {
    baseStyles: { ...baseStyles, ...Css.gray700.$ },
    activeStyles: Css.lightBlue700.bgLightBlue50.$,
    disabledStyles: Css.gray400.cursorNotAllowed.$,
    focusRingStyles: Css.bgLightBlue50.bshFocus.$,
    hoverStyles: Css.gray700.bgGray100.$,
    pressedStyles: Css.gray700.bgGray200.$,
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
  },
};
