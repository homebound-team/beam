import { useMemo, useRef } from "react";
import { useButton, useFocusRing, useHover } from "react-aria";
import { Icon, IconProps } from "src/components";
import { Css, Palette } from "src/Css";
import { BeamButtonProps, BeamFocusableProps } from "src/interfaces";
import { useTestIds } from "src/utils/useTestIds";

export interface IconButtonProps extends BeamButtonProps, BeamFocusableProps {
  /** The icon to use within the button. */
  icon: IconProps["icon"];
  color?: Palette;
  /** The size of the icon, in increments, defaults to 3 which is 24px. */
  inc?: number;
}

export function IconButton(props: IconButtonProps) {
  const { onClick: onPress, disabled: isDisabled, color, icon, autoFocus, inc } = props;
  const ariaProps = { onPress, isDisabled, autoFocus };
  const ref = useRef(null);
  const { buttonProps } = useButton(ariaProps, ref);
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

  return (
    <button {...testIds} {...buttonProps} {...focusProps} {...hoverProps} ref={ref} css={styles}>
      <Icon icon={icon} color={color || (isDisabled ? Palette.Gray400 : Palette.Gray900)} inc={inc} />
    </button>
  );
}

const iconButtonStylesReset = Css.hPx(28).wPx(28).br8.bTransparent.bsSolid.bw2.bgTransparent.cursorPointer.outline0.p0
  .df.itemsCenter.justifyCenter.transition.$;
export const iconButtonStylesHover = Css.bgGray100.$;
const iconButtonStylesFocus = Css.bLightBlue700.$;
const iconButtonStylesDisabled = Css.cursorNotAllowed.$;
