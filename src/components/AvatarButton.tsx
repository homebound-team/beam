import { AriaButtonProps } from "@react-types/button";
import { RefObject, useMemo, useRef } from "react";
import { useButton, useFocusRing, useHover } from "react-aria";
import { maybeTooltip, navLink, resolveTooltip } from "src/components";
import { Avatar, AvatarProps } from "src/components/Avatar";
import { Css, Palette } from "src/Css";
import { BeamButtonProps, BeamFocusableProps } from "src/interfaces";
import { noop } from "src/utils";
import { getButtonOrLink } from "src/utils/getInteractiveElement";
import { useTestIds } from "src/utils/useTestIds";

export interface AvatarButtonProps extends AvatarProps, BeamButtonProps, BeamFocusableProps {
  menuTriggerProps?: AriaButtonProps;
  buttonRef?: RefObject<HTMLButtonElement>;
}

export function AvatarButton(props: AvatarButtonProps) {
  const {
    onClick: onPress,
    disabled,
    autoFocus,
    buttonRef,
    tooltip,
    menuTriggerProps,
    openInNew,
    ...avatarProps
  } = props;
  const isDisabled = !!disabled;
  const ariaProps = { onPress, isDisabled, autoFocus, ...menuTriggerProps };
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const ref = buttonRef || useRef(null);
  const { buttonProps, isPressed } = useButton(
    {
      ...ariaProps,
      onPress: typeof onPress === "string" ? noop : onPress,
      elementType: typeof onPress === "string" ? "a" : "button",
    },
    ref,
  );
  const { focusProps, isFocusVisible } = useFocusRing(ariaProps);
  const { hoverProps, isHovered } = useHover(ariaProps);
  const tid = useTestIds(props, avatarProps.name);

  const styles = useMemo(
    () => ({
      ...resetStyles,
      ...(isHovered && hoverStyles),
      ...(isPressed && pressedStyles),
      ...(isFocusVisible && focusStyles),
      ...(isDisabled && disabledStyles),
    }),
    [isHovered, isFocusVisible, isDisabled, isPressed],
  );

  const buttonAttrs = {
    ...tid.button,
    ...buttonProps,
    ...focusProps,
    ...hoverProps,
    className: typeof onPress === "string" ? navLink : undefined,
    ref: ref as any,
    css: styles,
  };

  // If we're disabled b/c of a non-boolean ReactNode, or the caller specified tooltip text, then show it in a tooltip
  return maybeTooltip({
    title: resolveTooltip(disabled, tooltip),
    placement: "top",
    children: getButtonOrLink(<Avatar {...avatarProps} {...tid} />, onPress, buttonAttrs, openInNew),
  });
}

const resetStyles = Css.br100.cursorPointer.outline0.relative.$;
export const hoverStyles = Css.boxShadow(`0 0 4px ${Palette.Gray900}`).$;
const focusStyles = Css.bshFocus.$;
const disabledStyles = Css.cursorNotAllowed.$;
export const pressedStyles = Css.addIn(
  ":after",
  Css.br100.bgGray900.contentEmpty.w100.h100.absolute.top0.left0.add("opacity", "0.2").$,
).$;
