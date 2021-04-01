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
}

type NavLinkVariant = "side" | "global";

export function NavLink(props: NavLinkProps) {
  const { disabled: isDisabled, label, ...otherProps } = props;
  const ariaProps = { children: label, isDisabled, ...otherProps };
  const { href, active = false, icon = false, variant } = ariaProps;
  const ref = useRef() as RefObject<HTMLAnchorElement>;
  const { linkProps } = useLink(ariaProps, ref);
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const { isFocusVisible, focusProps } = useFocusRing(ariaProps);

  const { baseStyles, activeStyles, focusStyles, hoverStyles, disabledStyles } = useMemo(() => getStyles(variant), [
    variant,
  ]);

  return (
    <a
      {...linkProps}
      {...focusProps}
      {...hoverProps}
      ref={ref}
      href={href}
      css={{
        ...baseStyles,
        ...(active && activeStyles),
        ...(isDisabled && disabledStyles),
        ...(isHovered && hoverStyles),
        ...(isFocusVisible && focusStyles),
      }}
      className={navLink}
    >
      <span css={Css.mr1.$}>{label}</span>
      {icon && <Icon icon={icon} />}
    </a>
  );
}

function getStyles(variant: NavLinkVariant) {
  return variantStyles[variant];
}

const baseStyles = Css.df.itemsCenter.hPx(32).pyPx(6).px1.br4.smEm.$;

const variantStyles: Record<
  NavLinkVariant,
  { baseStyles: {}; hoverStyles: {}; disabledStyles: {}; focusStyles: {}; activeStyles: {} }
> = {
  side: {
    baseStyles: { ...baseStyles, ...Css.wPx(184).gray700.$ },
    hoverStyles: Css.gray700.bgGray100.$,
    focusStyles: Css.bgLightBlue50.bshFocus.outline0.$,
    activeStyles: Css.lightBlue700.bgLightBlue50.$,
    disabledStyles: Css.gray400.cursorNotAllowed.$,
  },
  global: {
    baseStyles: { ...baseStyles, ...Css.add("width", "fit-content").gray500.$ },
    hoverStyles: Css.gray500.bgGray900.$,
    focusStyles: Css.gray500.bgGray900.add(
      "boxShadow",
      `0px 1px 2px rgba(0, 0, 0, 0.05), 0px 0px 0px 2px #242424, 0px 0px 0px 4px #0EA5E9`,
    ).outline0.$,
    activeStyles: Css.white.bgGray900.$,
    disabledStyles: Css.gray400.cursorNotAllowed.$,
  },
};
