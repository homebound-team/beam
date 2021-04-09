import { useButton } from "@react-aria/button";
import { useMemo, useRef } from "react";
import { useFocusRing, useHover } from "react-aria";
import { Icon, IconProps } from "src";
import { Css, Palette } from "src/Css";
import { BeamButtonProps, BeamFocusableProps } from "src/interfaces";
import { useTestIds } from "src/utils/useTestIds";

export interface IconButtonProps extends BeamButtonProps, BeamFocusableProps {
  // The icon to use within the button
  icon: IconProps["icon"];
  color?: Palette;
}

export function IconButton(props: IconButtonProps) {
  const { onClick: onPress, disabled: isDisabled, color, icon, autoFocus, ...others } = props;
  const ariaProps = { onPress, isDisabled, autoFocus };
  const ref = useRef(null);
  const { buttonProps } = useButton(ariaProps, ref);
  const { focusProps, isFocusVisible } = useFocusRing(ariaProps);
  const { hoverProps, isHovered } = useHover(ariaProps);
  const testIds = useTestIds(others);

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
    <button {...testIds} {...buttonProps} {...focusProps} {...hoverProps} ref={ref} css={styles} {...others}>
      <Icon icon={icon} color={color || (isDisabled ? Palette.Gray400 : undefined)} />
    </button>
  );
}

const iconButtonStylesReset = Css.hPx(28).wPx(28).br8.bTransparent.bw2.bgTransparent.cursorPointer.outline0.p0.df
  .itemsCenter.justifyCenter.transition.$;
export const iconButtonStylesHover = Css.bgGray100.$;
const iconButtonStylesFocus = Css.bLightBlue700.$;
const iconButtonStylesDisabled = Css.cursorNotAllowed.$;
