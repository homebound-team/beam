import { AriaButtonProps } from "@react-types/button";
import { RefObject, useMemo } from "react";
import { useButton, useFocusRing, useHover } from "react-aria";
import { Icon, IconProps, maybeTooltip, navLink, resolveTooltip } from "src/components";
import { Css, Palette } from "src/Css";
import { useGetRef } from "src/hooks/useGetRef";
import { BeamButtonProps, BeamFocusableProps } from "src/interfaces";
import { noop } from "src/utils";
import { getButtonOrLink } from "src/utils/getInteractiveElement";
import { useTestIds } from "src/utils/useTestIds";

export interface IconButtonProps extends BeamButtonProps, BeamFocusableProps {
  /** The icon to use within the button. */
  icon: IconProps["icon"];
  color?: Palette;
  bgColor?: Palette;
  /** The size of the icon, in increments, defaults to 3 which is 24px. */
  inc?: number;
  /** HTML attributes to apply to the button element when it is being used to trigger a menu. */
  menuTriggerProps?: AriaButtonProps;
  buttonRef?: RefObject<HTMLButtonElement>;
  /** Whether to show a 16x16px version of the IconButton */
  compact?: boolean;
  /** Whether to display the contrast variant */
  contrast?: boolean;
  /** Whether to display the circle variant */
  circle?: boolean;
  /** Indicates that the button is active/selected */
  active?: boolean;
  /** Denotes if this button is used to download a resource. Uses the anchor tag with the `download` attribute */
  download?: boolean;
  /** Provides label for screen readers - Will become a required soon */
  label?: string;
}

export function IconButton(props: IconButtonProps) {
  const {
    onClick: onPress,
    disabled,
    color,
    bgColor,
    icon,
    autoFocus,
    inc,
    buttonRef,
    tooltip,
    menuTriggerProps,
    openInNew,
    active = false,
    compact = false,
    contrast = false,
    circle = false,
    download = false,
    forceFocusStyles = false,
    label,
  } = props;
  const isDisabled = !!disabled;
  const ariaProps = { onPress, isDisabled, autoFocus, ...menuTriggerProps };
  const ref = useGetRef(buttonRef);
  const { buttonProps } = useButton(
    {
      ...ariaProps,
      onPress: typeof onPress === "string" ? noop : onPress,
      elementType: typeof onPress === "string" ? "a" : "button",
    },
    ref,
  );
  const { focusProps, isFocusVisible } = useFocusRing(ariaProps);
  const { hoverProps, isHovered } = useHover(ariaProps);
  const testIds = useTestIds(props, icon);

  const styles = useMemo(
    () => ({
      ...iconButtonStylesReset,
      ...(circle ? iconButtonCircle : compact ? iconButtonCompact : iconButtonNormal),
      ...(isHovered &&
        (contrast ? iconButtonContrastStylesHover : circle ? iconButtonCircleStylesHover : iconButtonStylesHover)),
      ...(isFocusVisible || forceFocusStyles ? (circle ? iconButtonCircleStylesFocus : iconButtonStylesFocus) : {}),
      ...(active ? (contrast ? iconButtonContrastStylesHover : activeStyles) : {}),
      ...(isDisabled && iconButtonStylesDisabled),
      ...(bgColor && Css.bgColor(bgColor).$),
    }),
    // TODO: validate this eslint-disable. It was automatically ignored as part of https://app.shortcut.com/homebound-team/story/40033/enable-react-hooks-exhaustive-deps-for-react-projects
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isHovered, isFocusVisible, isDisabled, compact],
  );
  const iconColor = contrast ? contrastIconColor : circle ? circleIconColor : defaultIconColor;

  const buttonAttrs = {
    ...testIds,
    ...buttonProps,
    ...focusProps,
    ...hoverProps,
    className: typeof onPress === "string" ? navLink : undefined,
    ref: ref as any,
    css: styles,
    "aria-label": label,
  };
  const buttonContent = (
    <Icon
      icon={icon}
      color={
        color ||
        (isDisabled
          ? Palette.Gray400
          : circle && (isHovered || active || isFocusVisible)
            ? defaultIconColor
            : iconColor)
      }
      bgColor={bgColor}
      inc={compact ? 2 : circle ? 2.5 : inc}
    />
  );

  // If we're disabled b/c of a non-boolean ReactNode, or the caller specified tooltip text, then show it in a tooltip
  return maybeTooltip({
    title: resolveTooltip(disabled, tooltip),
    placement: "top",
    children: getButtonOrLink(buttonContent, onPress, buttonAttrs, openInNew, download),
  });
}

const defaultIconColor = Palette.Gray900;
const contrastIconColor = Palette.White;
const circleIconColor = Palette.Gray700;
const iconButtonStylesReset = Css.bcTransparent.bss.bgTransparent.cursorPointer.outline0.dif.aic.jcc.transition.$;
const iconButtonNormal = Css.hPx(28).wPx(28).br8.bw2.$;
const iconButtonCompact = Css.hPx(18).wPx(18).br4.bw1.$;
const iconButtonCircle = Css.br100.wPx(48).hPx(48).bcGray300.ba.bw1.df.jcc.aic.$;
export const iconButtonStylesHover = Css.bgGray200.$;
export const iconButtonContrastStylesHover = Css.bgGray700.$;
export const iconButtonCircleStylesHover = Css.bgBlue100.bcBlue200.$;
const iconButtonStylesFocus = Css.bcBlue700.$;
const iconButtonCircleStylesFocus = Css.bgBlue100.bcBlue700.$;
const iconButtonStylesDisabled = Css.cursorNotAllowed.$;
const activeStyles = Css.bgGray200.bcGray200.$;
