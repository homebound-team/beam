import { AriaButtonProps } from "@react-types/button";
import type { PressEvent } from "@react-types/shared";
import { ReactNode, RefObject, useMemo } from "react";
import { mergeProps, useButton, useFocusRing, useHover, VisuallyHidden } from "react-aria";
import type { IconKey } from "src/components";
import { navLink } from "src/components";
import { Icon } from "src/components/Icon";
import { Css, Properties, Tokens } from "src/Css";
import { useGetRef } from "src/hooks/useGetRef";
import { BeamButtonProps, BeamFocusableProps } from "src/interfaces";
import { noop } from "src/utils";
import { getButtonOrLink } from "src/utils/getInteractiveElement";

export type NavLinkVariant = "side" | "global";

export type NavLinkProps = {
  /** active indicates the user is on the current page */
  active?: boolean;
  disabled?: boolean;
  label: ReactNode;
  icon?: IconKey;
  variant: NavLinkVariant;
  openInNew?: boolean;
  /** HTML attributes to apply to the button element when it is being used to trigger a menu. */
  menuTriggerProps?: AriaButtonProps;
  buttonRef?: RefObject<HTMLElement>;
  /**
   * When true with an `icon`, shows icon only but keeps `label` for accessibility
   * (visually hidden text). Used by SideNav when the rail is collapsed.
   */
  iconOnly?: boolean;
  onClick?: BeamButtonProps["onClick"];
  nested?: boolean;
  /** Storybook-only visual state overrides for snapshotting pseudo-interactions. */
  __storyState?: {
    hovered?: boolean;
    focusVisible?: boolean;
    pressed?: boolean;
  };
} & BeamFocusableProps;

export function NavLink(props: NavLinkProps) {
  const {
    disabled: isDisabled,
    label,
    openInNew,
    menuTriggerProps,
    buttonRef,
    iconOnly,
    onClick,
    active,
    variant,
    icon,
    nested = false,
    __storyState,
    ...otherProps
  } = props;
  const asLink = typeof onClick === "string";
  const isIconOnly = !!iconOnly && !!icon;
  const labelContent = isIconOnly ? <VisuallyHidden>{label}</VisuallyHidden> : label;
  const ariaProps = { children: labelContent, isDisabled, ...menuTriggerProps };
  const ref = useGetRef(buttonRef);
  const { buttonProps, isPressed: isPressedFromEvents } = useButton(
    {
      ...ariaProps,
      onPress: asLink
        ? noop
        : (e: PressEvent) => {
            if (typeof onClick === "function") {
              void onClick(e);
            } else {
              menuTriggerProps?.onPress?.(e);
            }
          },
      elementType: asLink ? "a" : "button",
    },
    ref,
  );
  const { hoverProps, isHovered: isHoveredFromEvents } = useHover({ isDisabled });
  const { isFocusVisible: isFocusVisibleFromEvents, focusProps } = useFocusRing(ariaProps);
  const isPressed = __storyState?.pressed ?? isPressedFromEvents;
  const isHovered = __storyState?.hovered ?? isHoveredFromEvents;
  const isFocusVisible = __storyState?.focusVisible ?? isFocusVisibleFromEvents;

  const { baseStyles, activeStyles, focusRingStyles, hoverStyles, disabledStyles, pressedStyles } = useMemo(
    () => getNavLinkStyles(variant, nested),
    [variant, nested],
  );

  const linkAttributes = {
    ref: ref,
    /** does not focus if disabled */
    tabIndex: isDisabled ? -1 : 0,
    /** aria-current represents the current page within a set of pages */
    "aria-current": active ? ("page" as const) : undefined,
    ...Css.props({
      ...baseStyles,
      ...(isIconOnly && Css.jcc.pxPx(6).$),
      ...(active && activeStyles),
      ...(isDisabled && disabledStyles),
      ...(isFocusVisible && focusRingStyles),
      ...(isHovered && hoverStyles),
      ...(isPressed && pressedStyles),
    }),
  };

  const linkContent = (
    <>
      {labelContent}
      {icon && (
        <span css={Css.fs0.$}>
          <Icon icon={icon} />
        </span>
      )}
    </>
  );

  return getButtonOrLink(
    linkContent,
    onClick,
    mergeProps(buttonProps, focusProps, hoverProps, linkAttributes, { className: navLink }, otherProps),
    openInNew,
  );
}

export function getNavLinkStyles(variant: NavLinkVariant, nested?: boolean) {
  const styles = navLinkVariantStyles[variant];

  return {
    ...styles,
    baseStyles: { ...styles.baseStyles, ...(nested ? Css.pl3.sm.$ : Css.smSb.$) },
  };
}

const baseStyles = Css.df.gap1.aic.pyPx(6).px1.br4.outline0.$;

const navLinkVariantStyles: Record<
  NavLinkVariant,
  {
    baseStyles: Properties;
    hoverStyles: Properties;
    disabledStyles: Properties;
    focusRingStyles: Properties;
    activeStyles: Properties;
    pressedStyles: Properties;
  }
> = {
  side: {
    baseStyles: { ...baseStyles, ...Css.hPx(40).fs0.color(Tokens.NavText).$ },
    activeStyles: Css.fw6.color(Tokens.NavTextActive).bgColor(Tokens.NavItemBgActive).$,
    disabledStyles: Css.color(Tokens.NavTextDisabled).cursorNotAllowed.$,
    focusRingStyles: Css.bshFocus.$,
    hoverStyles: Css.color(Tokens.NavText).bgColor(Tokens.NavItemBgHover).$,
    pressedStyles: Css.color(Tokens.NavTextPressed).bgColor(Tokens.NavItemBgPressed).$,
  },
  global: {
    // Lives inside ContrastScope (Navbar); Nav* contrast values resolve light-on-dark chrome.
    baseStyles: { ...baseStyles, ...Css.hPx(32).add("width", "max-content").color(Tokens.NavText).$ },
    activeStyles: Css.color(Tokens.NavTextActive).bgColor(Tokens.NavItemBgActive).$,
    disabledStyles: Css.color(Tokens.NavTextDisabled).cursorNotAllowed.$,
    focusRingStyles: Css.color(Tokens.NavTextFocusVisible).bgColor(Tokens.NavItemBgActive).bshFocus.$,
    hoverStyles: Css.color(Tokens.NavText).bgColor(Tokens.NavItemBgHover).$,
    pressedStyles: Css.color(Tokens.NavTextPressed).bgColor(Tokens.NavItemBgPressed).$,
  },
};
