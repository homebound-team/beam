import { useLink } from "@react-aria/link";
import { RefObject, useMemo, useRef } from "react";
import { useFocusRing, useHover } from "react-aria";
import { navLink } from "src/components";
import { Css } from "src/Css";
import { BeamFocusableProps } from "src/interfaces";
import { Icon, Icons } from "./Icon";

export interface NavLinkProps extends BeamFocusableProps {
  active?: boolean;
  disabled?: boolean;
  href: string;
  label: string;
  icon?: keyof typeof Icons;
  variant: NavLinkVariant;
  /** Target and rel attributes are added for external links */
  external?: boolean;
}

type NavLinkVariant = "side" | "global";

export function NavLink(props: NavLinkProps) {
  const { disabled: isDisabled, label, external, ...otherProps } = props;
  const ariaProps = { children: label, isDisabled, ...otherProps };
  const { href, active = false, icon = false, variant } = ariaProps;
  const ref = useRef() as RefObject<HTMLAnchorElement>;
  const { linkProps } = useLink(ariaProps, ref);
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const { isFocusVisible, focusProps } = useFocusRing(ariaProps);

  const { baseStyles, activeStyles, focusStyles, hoverStyles, disabledStyles } = useMemo(
    () => getNavLinkStyles(variant),
    [variant],
  );

  const target = external ? "_blank" : undefined;
  const rel = external ? "noopener noreferrer" : undefined;

  return (
    <a
      {...linkProps}
      {...focusProps}
      {...hoverProps}
      className={navLink}
      href={href}
      ref={ref}
      rel={rel}
      // does not focus if disabled
      tabIndex={isDisabled ? -1 : 0}
      target={target}
      css={{
        ...baseStyles,
        ...(active && activeStyles),
        ...(isDisabled && disabledStyles),
        ...(isFocusVisible && focusStyles),
        ...(isHovered && hoverStyles),
      }}
    >
      <span css={Css.mr1.$}>{label}</span>
      {icon && <Icon icon={icon} />}
    </a>
  );
}

export function getNavLinkStyles(variant: NavLinkVariant) {
  return navLinkVariantStyles[variant];
}

const baseStyles = Css.df.itemsCenter.hPx(32).pyPx(6).px1.br4.smEm.outline0.$;

const navLinkVariantStyles: Record<
  NavLinkVariant,
  { baseStyles: {}; hoverStyles: {}; disabledStyles: {}; focusStyles: {}; activeStyles: {}; pressedStyles: {} }
> = {
  side: {
    baseStyles: { ...baseStyles, ...Css.wPx(184).gray700.$ },
    activeStyles: Css.lightBlue700.bgLightBlue50.$,
    disabledStyles: Css.gray400.cursorNotAllowed.$,
    focusStyles: Css.bgLightBlue50.bshFocus.$,
    hoverStyles: Css.gray700.bgGray100.$,
    pressedStyles: Css.gray700.bgGray200.$,
  },
  global: {
    baseStyles: { ...baseStyles, ...Css.add("width", "max-content").gray500.$ },
    activeStyles: Css.white.bgGray900.$,
    disabledStyles: Css.gray400.cursorNotAllowed.$,
    focusStyles: Css.gray500.bgGray900.add(
      "boxShadow",
      `0px 1px 2px rgba(0, 0, 0, 0.05), 0px 0px 0px 2px #242424, 0px 0px 0px 4px #0EA5E9`,
    ).$,
    hoverStyles: Css.gray500.bgGray900.$,
    pressedStyles: Css.gray500.bgGray700.$,
  },
};
