import { useButton } from "@react-aria/button";
import { useMemo, useRef } from "react";
import { useFocusRing, useHover } from "react-aria";
import { Icon, IconProps } from "src";
import { Css, Palette } from "src/Css";
import { BeamButtonProps, BeamFocusableProps } from "src/interfaces";

export interface IconButtonProps extends BeamButtonProps, BeamFocusableProps {
  // The icon to use within the button
  icon: IconProps["icon"];
}

export function IconButton({ onClick: onPress, disabled: isDisabled, ...otherProps }: IconButtonProps) {
  const ariaProps = { onPress, isDisabled, ...otherProps };
  const { icon } = ariaProps;
  const ref = useRef(null);
  const { buttonProps } = useButton(ariaProps, ref);
  const { focusProps, isFocusVisible } = useFocusRing(ariaProps);
  const { hoverProps, isHovered } = useHover(ariaProps);

  const styles = useMemo(
    () => ({
      ...iconButtonStylesReset,
      ...(isHovered && iconButtonStylesHover),
      ...(isFocusVisible && iconButtonStylesFocus),
      ...(isDisabled && iconButtonStylesDisabled),
    }),
    [isHovered, isFocusVisible, isDisabled],
  );

  return (
    <button {...buttonProps} {...focusProps} {...hoverProps} ref={ref} css={styles}>
      <Icon icon={icon} color={isDisabled ? Palette.Gray400 : undefined} />
    </button>
  );
}

const iconButtonStylesReset = Css.hPx(28).wPx(28).br8.bTransparent.bw2.bgTransparent.cursorPointer.outline0.df
  .itemsCenter.justifyCenter.transition.$;
export const iconButtonStylesHover = Css.bgGray100.$;
const iconButtonStylesFocus = Css.bLightBlue700.$;
const iconButtonStylesDisabled = Css.cursorNotAllowed.$;
