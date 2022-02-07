import { AriaButtonProps } from "@react-types/button";
import { RefObject, useMemo, useRef } from "react";
import { useButton, useFocusRing, useHover } from "react-aria";
import { Link } from "react-router-dom";
import { Icon, IconProps, maybeTooltip, navLink, resolveTooltip } from "src/components";
import { Css, Palette } from "src/Css";
import { BeamButtonProps, BeamFocusableProps } from "src/interfaces";
import { isAbsoluteUrl, noop } from "src/utils";
import { useTestIds } from "src/utils/useTestIds";

export interface IconButtonProps extends BeamButtonProps, BeamFocusableProps {
  /** The icon to use within the button. */
  icon: IconProps["icon"];
  color?: Palette;
  /** The size of the icon, in increments, defaults to 3 which is 24px. */
  inc?: number;
  /** HTML attributes to apply to the button element when it is being used to trigger a menu. */
  menuTriggerProps?: AriaButtonProps;
  buttonRef?: RefObject<HTMLButtonElement>;
}

export function IconButton(props: IconButtonProps) {
  const {
    onClick: onPress,
    disabled,
    color,
    icon,
    autoFocus,
    inc,
    buttonRef,
    tooltip,
    menuTriggerProps,
    openInNew,
  } = props;
  const isDisabled = !!disabled;
  const ariaProps = { onPress, isDisabled, autoFocus, ...menuTriggerProps };
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const ref = buttonRef || useRef(null);
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
      ...(isHovered && iconButtonStylesHover),
      ...(isFocusVisible && iconButtonStylesFocus),
      ...(isDisabled && iconButtonStylesDisabled),
    }),
    [isHovered, isFocusVisible, isDisabled],
  );

  const buttonAttrs = { ...testIds, ...buttonProps, ...focusProps, ...hoverProps, ref: ref as any, css: styles };
  const buttonContent = (
    <Icon icon={icon} color={color || (isDisabled ? Palette.Gray400 : Palette.Gray900)} inc={inc} />
  );

  const button =
    typeof onPress === "string" ? (
      isAbsoluteUrl(onPress) || openInNew ? (
        <a {...buttonAttrs} href={onPress} className={navLink} target="_blank" rel="noreferrer noopener">
          {buttonContent}
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
    title: resolveTooltip(disabled, tooltip),
    placement: "top",
    children: button,
  });
}

const iconButtonStylesReset =
  Css.hPx(28).wPx(28).br8.bTransparent.bsSolid.bw2.bgTransparent.cursorPointer.outline0.p0.dif.aic.jcc.transition.$;
export const iconButtonStylesHover = Css.bgGray200.$;
const iconButtonStylesFocus = Css.bLightBlue700.$;
const iconButtonStylesDisabled = Css.cursorNotAllowed.$;
