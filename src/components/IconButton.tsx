import { useButton } from "@react-aria/button";
import type { AriaButtonProps } from "@react-types/button";
import { useMemo, useRef } from "react";
import { useFocusRing, useHover } from "react-aria";
import { Css, Palette } from "src/Css";
import { Icon, IconProps } from "./Icon";

export interface IconButtonProps extends Omit<AriaButtonProps, "children"> {
  // The icon to use within the button
  icon: IconProps["icon"];
}

export function IconButton(props: IconButtonProps) {
  const ref = useRef(null);
  const { buttonProps } = useButton(props, ref);
  const { focusProps, isFocusVisible } = useFocusRing(props);
  const { hoverProps, isHovered } = useHover(props);
  const { icon, isDisabled } = props;

  const styles = useMemo(
    () => ({
      ...stylesReset,
      ...(isHovered && stylesHover),
      ...(isFocusVisible && stylesFocus),
      ...(isDisabled && stylesDisabled),
    }),
    [isHovered, isFocusVisible, isDisabled],
  );
  const iconColor = useMemo(() => (isDisabled ? Palette.CoolGray300 : undefined), [isDisabled]);

  return (
    <button {...buttonProps} {...focusProps} {...hoverProps} ref={ref} css={styles}>
      <Icon icon={icon} color={iconColor} />
    </button>
  );
}

const stylesReset = Css.hPx(28).wPx(28).p0.br8.bTransparent.bw2.bgTransparent.cursorPointer.outline0.transition.$;
export const stylesHover = Css.bgCoolGray100.$;
const stylesFocus = Css.bSky500.$;
const stylesDisabled = Css.cursorNotAllowed.$;
